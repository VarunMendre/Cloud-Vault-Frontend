import { useState, useEffect, useRef } from "react";
import {
  X,
  Link,
  Copy,
  Trash2,
  Eye,
  Globe,
  Mail,
  Users,
  Pencil,
  UserCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import PropTypes from "prop-types";
import "./DriveActionModals.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function ShareModal({ resourceType, resourceId, resourceName, onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [activeTab, setActiveTab] = useState("shareLink");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [sharedUsers, setSharedUsers] = useState([]);
  const [shareLink, setShareLink] = useState(null);
  const [linkRole, setLinkRole] = useState("viewer");
  const [linkEnabled, setLinkEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // For Email Invite tab - user selection
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userToRemove, setUserToRemove] = useState(null);
  const [isRemovingAccess, setIsRemovingAccess] = useState(false);

  useEffect(() => {
    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();

    const handleDialogKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const focusableElements = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]'
      );
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && (document.activeElement === firstElement || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && (document.activeElement === lastElement || !dialogRef.current.contains(document.activeElement))) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleDialogKeyDown);
    return () => {
      document.removeEventListener("keydown", handleDialogKeyDown);
      previousFocus?.focus?.();
    };
  }, []);

  // Fetch shared users on mount or when resource changes
  useEffect(() => {
    if (resourceType && resourceId) {
      fetchSharedUsers();
    } else {
      setLoading(false);
    }
    fetchAllUsers();
  }, [resourceType, resourceId]);

  const fetchSharedUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/share/${resourceType}/${resourceId}/shared-users`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setSharedUsers(data.sharedWith);
        setShareLink(data.shareLink);
        if (data.shareLink && data.shareLink.enabled) {
          setLinkRole(data.shareLink.role);
          setLinkEnabled(true);
        } else {
             setLinkEnabled(false);
        }
        return data;
      } else {
        const data = await response.json();
        setError(data.error || "Failed to fetch shared users");
      }
    } catch (err) {
      console.error("Error fetching shared users:", err);
      setError("Error loading sharing information");
    } finally {
      setLoading(false);
    }
    return null;
  };



  const fetchAllUsers = async () => {
    try {
      // Correct endpoint for user list
      const response = await fetch(`${BASE_URL}/list`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        // Safety check to ensure data is an array
        if (Array.isArray(data)) {
          setAllUsers(data);
        } else {
          console.error("User list is not an array:", data);
          setAllUsers([]);
        }
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleShareWithUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter an email address");
      return;
    }

    setIsSharing(true);

    try {
      const response = await fetch(
        `${BASE_URL}/share/${resourceType}/${resourceId}/share`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, role }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Shared with ${email} successfully!`);
        setEmail("");
        setRole("viewer");
        fetchSharedUsers();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to share");
      }
    } catch (err) {
      console.error("Error sharing:", err);
      setError("Error sharing resource");
    } finally {
      setIsSharing(false);
    }
  };

  const handleRemoveAccess = async (userId) => {
    const user = sharedUsers.find((sharedUser) => sharedUser.userId === userId);
    if (user) setUserToRemove(user);
  };

  const confirmRemoveAccess = async () => {
    if (!userToRemove) return;
    setIsRemovingAccess(true);
    try {
      const response = await fetch(
        `${BASE_URL}/share/${resourceType}/${resourceId}/share/${userToRemove.userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        const removedName = userToRemove.name || userToRemove.email;
        setUserToRemove(null);
        setError("");
        setSuccess(`Access removed for ${removedName}.`);
        await fetchSharedUsers();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to remove access");
      }
    } catch (err) {
      console.error("Error removing access:", err);
      setError("Error removing access");
    } finally {
      setIsRemovingAccess(false);
    }
  };

  const handleToggleLink = async () => {
    if (!linkEnabled) {
      // Generate link
      await handleGenerateLink();
    } else {
      // Disable link
      await handleDisableLink();
    }
  };

  const handleGenerateLink = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/share/${resourceType}/${resourceId}/share-link`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role: linkRole }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const generatedLink = data.shareLink?.url
          ? data.shareLink
          : (await fetchSharedUsers())?.shareLink;
        if (!generatedLink?.url) {
          throw new Error("The link was created, but its URL could not be loaded. Please try again.");
        }
        setShareLink(generatedLink);
        setLinkRole(generatedLink.role || linkRole);
        setLinkEnabled(true);
        setError("");
        setSuccess("Share link generated!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to generate link");
      }
    } catch (err) {
      console.error("Error generating link:", err);
      setError(err.message || "Error generating share link");
    }
  };

  const handleUpdateLinkRole = async (newRole) => {
    try {
      const response = await fetch(
        `${BASE_URL}/share/${resourceType}/${resourceId}/share-link`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (response.ok) {
        setLinkRole(newRole);
        setShareLink({ ...shareLink, role: newRole });
        setSuccess("Link permission updated!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update link");
      }
    } catch (err) {
      console.error("Error updating link:", err);
      setError("Error updating share link");
    }
  };

  const handleDisableLink = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/share/${resourceType}/${resourceId}/share-link`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setShareLink(null);
        setLinkEnabled(false);
        setError("");
        setSuccess("Share link disabled!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to disable link");
      }
    } catch (err) {
      console.error("Error disabling link:", err);
      setError("Error disabling share link");
    }
  };

  const handleCopyLink = () => {
    if (shareLink?.url) {
      navigator.clipboard.writeText(shareLink.url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleUserSelect = (user) => {
    if (selectedUsers.find((u) => u.userId === user.userId)) {
      setSelectedUsers(selectedUsers.filter((u) => u.userId !== user.userId));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleSendInvites = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select users to invite");
      return;
    }

    setIsSharing(true);
    setError("");
    setSuccess("");

    try {
      // Send invites to all selected users
      const promises = selectedUsers.map((user) =>
        fetch(`${BASE_URL}/share/${resourceType}/${resourceId}/share`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: user.email, role: "viewer" }),
        })
      );

      await Promise.all(promises);
      setSuccess(`Invites sent to ${selectedUsers.length} user(s)!`);
      setSelectedUsers([]);
      await fetchSharedUsers();
      setActiveTab("sharedWith");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error sending invites:", err);
      setError("Error sending invites");
    } finally {
      setIsSharing(false);
    }
  };

  const filteredUsers = Array.isArray(allUsers) 
    ? allUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];



  return (
    <div
      className="cv-share-overlay"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="cv-share-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-share-title"
      >
        <header className="cv-share-header">
          <div className="cv-share-heading">
            <span className="cv-share-heading-icon" aria-hidden="true">
              <Users size={21} />
            </span>
            <div className="cv-share-heading-copy">
              <p>Access and permissions</p>
              <h2 id="cv-share-title">Share {resourceType === "directory" ? "folder" : "file"}</h2>
              <span className="cv-share-resource-name" title={resourceName}>{resourceName || "Manage who can access this item"}</span>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="cv-share-close"
            aria-label="Close sharing dialog"
          >
            <X size={19} />
          </button>
        </header>

        <nav className="cv-share-tabs" aria-label="Sharing options">
          <button
            type="button"
            onClick={() => setActiveTab("shareLink")}
            className={`cv-share-tab${activeTab === "shareLink" ? " is-active" : ""}`}
            aria-pressed={activeTab === "shareLink"}
            style={{
              color: activeTab === "shareLink" ? '#66B2D6' : '#2C3E50',
              borderColor: activeTab === "shareLink" ? '#66B2D6' : 'transparent'
            }}
          >
            <Link className="w-4 h-4" />
            Share Link
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("emailInvite")}
            className={`cv-share-tab${activeTab === "emailInvite" ? " is-active" : ""}`}
            aria-pressed={activeTab === "emailInvite"}
            style={{
              color: activeTab === "emailInvite" ? '#66B2D6' : '#2C3E50',
              borderColor: activeTab === "emailInvite" ? '#66B2D6' : 'transparent'
            }}
          >
            <Mail className="w-4 h-4" />
            Email Invite
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("sharedWith")}
            className={`cv-share-tab${activeTab === "sharedWith" ? " is-active" : ""}`}
            aria-pressed={activeTab === "sharedWith"}
            style={{
              color: activeTab === "sharedWith" ? '#66B2D6' : '#2C3E50',
              borderColor: activeTab === "sharedWith" ? '#66B2D6' : 'transparent'
            }}
          >
            <UserCheck className="w-4 h-4" />
            Shared With
          </button>
        </nav>

        <div className="cv-share-body">

          {/* Messages */}
          {error && (
            <div className="cv-share-feedback is-error" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{error}</span>
              <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
                <X size={16} />
              </button>
            </div>
          )}
          {success && (
            <div className="cv-share-feedback is-success" role="status" aria-live="polite">
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>{success}</span>
              <button type="button" onClick={() => setSuccess("")} aria-label="Dismiss notification">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Share Link Tab */}
          {activeTab === "shareLink" && (
            <div className="space-y-6">
              {loading ? (
                <div className="cv-share-loading" role="status" aria-label="Loading sharing information">
                  <span />
                </div>
              ) : (
                <>
                  {/* Toggle Share Link */}
                  <div className="cv-share-link-toggle-row">
                    <div className="flex items-center gap-3">
                      <div className="cv-share-link-icon" aria-hidden="true">
                        <Globe size={19} />
                      </div>
                    <div>
                      <h4 className="text-sm font-semibold">Share with link</h4>
                      <p className="text-xs">Anyone with the link can access</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleLink}
                    className={`cv-share-toggle${linkEnabled ? " is-enabled" : ""}`}
                    role="switch"
                    aria-checked={linkEnabled}
                    aria-label="Enable share link"
                  >
                    <span />
                  </button>
                  </div>

                  {linkEnabled && shareLink && (
                    <>
                      {/* Permission Level */}
                      <div>
                        <label className="cv-share-label">
                          Permission level
                        </label>
                        <div className="cv-share-role-options">
                          <button
                            type="button"
                            onClick={() => handleUpdateLinkRole("viewer")}
                            className={`cv-share-role${linkRole === "viewer" ? " is-selected" : ""}`}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="font-medium">Viewer</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateLinkRole("editor")}
                            className={`cv-share-role${linkRole === "editor" ? " is-selected" : ""}`}
                          >
                            <Pencil className="w-4 h-4" />
                            <span className="font-medium">Editor</span>
                          </button>
                        </div>
                      </div>

                      {/* Share Link */}
                      <div>
                        <label className="cv-share-label">
                          Share link
                        </label>
                        <div className="cv-share-link-field">
                          <Link className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                          <input
                            type="text"
                            value={shareLink.url}
                            readOnly
                            aria-label="Share link"
                          />
                          <button
                            type="button"
                            onClick={handleCopyLink}
                            className="cv-share-primary-button"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedLink ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Email Invite Tab */}
          {activeTab === "emailInvite" && (
            <div className="space-y-4">
              <div>
                <label className="cv-share-label">
                  Select users to invite
                </label>
                <input
                  type="text"
                  placeholder="Choose users to invite"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="cv-share-search"
                  aria-label="Search users to invite"
                />
              </div>

              {/* User List */}
              <div className="cv-share-user-list">
                {filteredUsers.map((user) => {
                  const isSelected = selectedUsers.find((u) => u.userId === user.userId);
                  return (
                    <button
                      type="button"
                      key={user.userId}
                      onClick={() => handleUserSelect(user)}
                      className={`cv-share-user${isSelected ? " is-selected" : ""}`}
                      aria-pressed={Boolean(isSelected)}
                    >
                      <span className="cv-share-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="cv-share-user-copy">
                        <span className="cv-share-user-name">
                          {user.name}
                        </span>
                        <span className="cv-share-user-email">{user.email}</span>
                      </span>
                      {isSelected && (
                        <span className="cv-share-selected-icon" aria-hidden="true">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Send Invites Button */}
              <button
                type="button"
                onClick={handleSendInvites}
                disabled={selectedUsers.length === 0 || isSharing}
                className="cv-share-primary-button cv-share-invite-button"
              >
                {isSharing
                  ? "Sending..."
                  : selectedUsers.length > 0
                  ? "Send Invites"
                  : "Select users to send invites"}
              </button>
            </div>
          )}

          {/* Shared With Tab */}
          {activeTab === "sharedWith" && (
            <div className="space-y-4">
              <div className="cv-share-access-heading">
              <div className="cv-share-access-icon">
                <UserCheck size={17} />
                </div>
              <h4>Users with access</h4>
              </div>

              {loading ? (
                <div className="cv-share-loading" role="status" aria-label="Loading sharing information">
                  <span />
                </div>
              ) : sharedUsers.length === 0 ? (
                <div className="cv-share-empty">
                  <div className="cv-share-empty-icon">
                    <UserCheck size={26} />
                  </div>
                  <h3>No one has access yet</h3>
                  <p>
                    Use the Email Invite tab to share this document with others.
                  </p>
                </div>
              ) : (
                <div className="cv-share-access-list">
                  {sharedUsers.map((user) => (
                    <div
                      key={user.userId}
                      className="cv-share-access-row"
                    >
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="cv-share-avatar"
                        />
                      ) : (
                        <div className="cv-share-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="cv-share-user-copy">
                        <div className="cv-share-user-name">
                          {user.name}
                        </div>
                        <div className="cv-share-user-email">{user.email}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAccess(user.userId)}
                        title="Remove access"
                        aria-label={`Remove ${user.name}'s access`}
                        className="cv-share-remove-access"
                        disabled={isRemovingAccess}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        {userToRemove && (
          <div
            className="cv-share-confirm-overlay"
            onClick={(event) => {
              if (event.target === event.currentTarget && !isRemovingAccess) {
                setUserToRemove(null);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape" && !isRemovingAccess) {
                event.stopPropagation();
                setUserToRemove(null);
              }
            }}
          >
            <section
              className="cv-share-confirm-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="cv-share-remove-title"
              aria-describedby="cv-share-remove-description"
            >
              <span className="cv-share-confirm-icon" aria-hidden="true">
                <Trash2 size={21} />
              </span>
              <h3 id="cv-share-remove-title">Remove access?</h3>
              <p id="cv-share-remove-description">
                {userToRemove.name || userToRemove.email} will no longer be able to access this item.
              </p>
              <div className="cv-share-confirm-actions">
                <button
                  type="button"
                  className="cv-share-confirm-cancel"
                  onClick={() => setUserToRemove(null)}
                  disabled={isRemovingAccess}
                  autoFocus
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="cv-share-confirm-remove"
                  onClick={confirmRemoveAccess}
                  disabled={isRemovingAccess}
                >
                  {isRemovingAccess ? "Removing…" : "Remove access"}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

ShareModal.propTypes = {
  resourceType: PropTypes.oneOf(["file", "directory"]).isRequired,
  resourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  resourceName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default ShareModal;
