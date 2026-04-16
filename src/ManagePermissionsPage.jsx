import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Link,
  Copy,
  Trash2,
  Eye,
  Globe,
  UserCheck,
  Users,
  Pencil,
  AlertTriangle,
  FileText,
  ShieldCheck,
  ChevronRight,
  Info,
  X
} from "lucide-react";
import DirectoryHeader from "./components/DirectoryHeader";
import { useAuth } from "./context/AuthContext";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function ManagePermissionsPage() {
  const { user } = useAuth();
  const { resourceType, resourceId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("shareLink");
  const [loading, setLoading] = useState(true);
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
  };
  
  // Data State
  const [owner, setOwner] = useState(null);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [shareLink, setShareLink] = useState(null);
  const [linkRole, setLinkRole] = useState("viewer");
  const [linkEnabled, setLinkEnabled] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch shared users and link info
  useEffect(() => {
    fetchSharedInfo();
  }, [resourceType, resourceId]);

  const fetchSharedInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/share/${resourceType}/${resourceId}/shared-users`,
        { credentials: "include" }
      );

      if (response.ok) {
        const data = await response.json();
        setOwner(data.owner);
        setSharedUsers(data.sharedWith);
        setShareLink(data.shareLink);
        if (data.shareLink && data.shareLink.enabled) {
          setLinkRole(data.shareLink.role);
          setLinkEnabled(true);
        } else {
          setLinkEnabled(false);
        }
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to fetch sharing info", "error");
      }
    } catch (err) {
      console.error("Error fetching info:", err);
      showToast("Error loading permission settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLink = async () => {
    if (!linkEnabled) {
      await handleGenerateLink();
    } else {
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
        setShareLink(data.shareLink);
        setLinkEnabled(true);
        showToast("Share link generated!", "success");
      } else {
        showToast(data.error || "Failed to generate link", "error");
      }
    } catch (err) {
      showToast("Error generating share link", "error");
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
        showToast("Link permission updated!", "success");
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to update link", "error");
      }
    } catch (err) {
      showToast("Error updating share link", "error");
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
        showToast("Share link disabled!", "success");
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to disable link", "error");
      }
    } catch (err) {
      showToast("Error disabling share link", "error");
    }
  };

  const handleCopyLink = () => {
    if (shareLink?.url) {
      navigator.clipboard.writeText(shareLink.url);
      setCopiedLink(true);
      showToast("Link copied to clipboard", "success");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleUpdateAccess = async (userId, newRole) => {
    try {
      const response = await fetch(
        `${BASE_URL}/share/${resourceType}/${resourceId}/share/${userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role: newRole }),
        }
      );
      if (response.ok) {
        showToast("Access level updated!", "success");
        fetchSharedInfo();
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to update access", "error");
      }
    } catch (err) {
      showToast("Error updating access level", "error");
    }
  };

  const handleRemoveAccess = async (userId) => {
    if (!confirm("Remove this user's access? They will no longer be able to view or edit this item.")) {
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/share/${resourceType}/${resourceId}/share/${userId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (response.ok) {
        showToast("Access removed successfully!", "success");
        fetchSharedInfo();
      } else {
        const data = await response.json();
        showToast(data.error || "Failed to remove access", "error");
      }
    } catch (err) {
      showToast("Error removing access", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DirectoryHeader
        userName={user?.name || "Guest User"}
        userEmail={user?.email || "guest@example.com"}
        userPicture={user?.picture || ""}
        userRole={user?.role || "User"}
        subscriptionId={user?.subscriptionId}
        subscriptionStatus={user?.subscriptionStatus || "active"}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 mb-4 text-sm font-semibold text-gray-400 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Return
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-[#66B2D6]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Permissions Strategy</h1>
                <p className="text-sm font-medium text-gray-400">Control governance and access nodes for this resource</p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-gray-400 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm uppercase tracking-widest">
            <Info className="w-3.5 h-3.5 text-[#66B2D6]" />
            Encrypted Channel
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-2 space-y-1">
              <button
                onClick={() => setActiveTab("shareLink")}
                className={classNames(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                  activeTab === "shareLink" 
                    ? "bg-[#66B2D6]/10 text-[#66B2D6] ring-1 ring-[#66B2D6]/20" 
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                )}
              >
                <Link className="w-4 h-4" />
                Public Ingress
              </button>
              <button
                onClick={() => setActiveTab("sharedWith")}
                className={classNames(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                  activeTab === "sharedWith" 
                    ? "bg-[#66B2D6]/10 text-[#66B2D6] ring-1 ring-[#66B2D6]/20" 
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                )}
              >
                <Users className="w-4 h-4" />
                Entity Access
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 flex flex-col items-center justify-center gap-4">
                <div className="w-8 h-8 border-4 border-gray-100 border-t-[#66B2D6] rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] animate-pulse">Syncing permissions...</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8">
                  {activeTab === "shareLink" && (
                    <div className="space-y-8 animate-fadeIn">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1">Link Synthesis</h2>
                        <p className="text-sm font-medium text-gray-400">Generate a secure public gateway for this asset.</p>
                      </div>

                      <div className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-100 group">
                        <div className="flex items-center gap-4">
                          <div className={classNames(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all border shadow-inner",
                            linkEnabled ? "bg-[#66B2D6]/10 border-[#66B2D6]/20 text-[#66B2D6]" : "bg-white border-gray-200 text-gray-300"
                          )}>
                            <Globe className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">Distribution Channel</h4>
                            <p className="text-xs font-medium text-gray-400">{linkEnabled ? "Public access is live" : "Access currently disabled"}</p>
                          </div>
                        </div>
                        <button
                          onClick={handleToggleLink}
                          className={classNames(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-all ring-offset-2 focus:ring-2",
                            linkEnabled ? "bg-[#66B2D6]" : "bg-gray-200"
                          )}
                        >
                          <span className={classNames(
                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md",
                            linkEnabled ? "translate-x-6" : "translate-x-1"
                          )} />
                        </button>
                      </div>

                      {linkEnabled && shareLink && (
                        <div className="space-y-8 pt-4 border-t border-gray-100 animate-slideDown">
                          <div className="space-y-4">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Logic & Permissions</label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => handleUpdateLinkRole("viewer")}
                                className={classNames(
                                  "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-sm",
                                  linkRole === "viewer" ? "bg-white border-[#66B2D6] text-[#66B2D6] shadow-md shadow-[#66B2D6]/10" : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200"
                                )}
                              >
                                <Eye className="w-4 h-4" />
                                Viewer
                              </button>
                              <button
                                onClick={() => handleUpdateLinkRole("editor")}
                                className={classNames(
                                  "flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all font-bold text-sm",
                                  linkRole === "editor" ? "bg-white border-[#66B2D6] text-[#66B2D6] shadow-md shadow-[#66B2D6]/10" : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200"
                                )}
                              >
                                <Pencil className="w-4 h-4" />
                                Editor
                              </button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Gateway URL</label>
                            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-100 ring-1 ring-gray-200/50">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-gray-100 shadow-sm">
                                <Link className="w-4 h-4 text-[#66B2D6]" />
                              </div>
                              <input
                                type="text"
                                value={shareLink.url}
                                readOnly
                                className="flex-1 bg-transparent px-2 text-sm font-medium text-gray-600 focus:outline-none"
                              />
                              <button
                                onClick={handleCopyLink}
                                className={classNames(
                                  "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm",
                                  copiedLink ? "bg-green-500 text-white" : "bg-white text-gray-700 hover:bg-gray-900 hover:text-white border border-gray-200"
                                )}
                              >
                                {copiedLink ? <ShieldCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {copiedLink ? "Copied" : "Copy"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "sharedWith" && (
                    <div className="space-y-8 animate-fadeIn">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1">Entity Privileges</h2>
                        <p className="text-sm font-medium text-gray-400">Audit and modify granular access for verified users.</p>
                      </div>

                      {sharedUsers.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                            <Users className="w-10 h-10 text-gray-200" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">Standalone Node</h3>
                          <p className="text-sm font-medium text-gray-400 max-w-xs mx-auto mb-8 leading-relaxed">
                            No external entities currently have access privileges for this resource.
                          </p>
                          <button
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#66B2D6] text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all active:scale-[0.98]"
                          >
                            Return to Drive
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1">Authorized Entities</label>
                          <div className="grid grid-cols-1 gap-3">
                            {sharedUsers.map((u) => (
                              <div key={u.userId} className="group flex items-center gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:border-[#66B2D6]/30 hover:shadow-lg hover:shadow-[#66B2D6]/5 transition-all">
                                <div className="relative">
                                  {u.picture ? (
                                    <img src={u.picture} alt={u.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-sm" />
                                  ) : (
                                    <div className="w-12 h-12 bg-white rounded-2xl border border-gray-200 flex items-center justify-center text-sm font-black text-[#66B2D6] ring-2 ring-white shadow-sm">
                                      {u.name.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-bold text-gray-900 truncate tracking-tight">{u.name}</div>
                                  <div className="text-[10px] font-bold text-gray-400 truncate uppercase tracking-tighter">{u.email}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <select
                                    value={u.role}
                                    onChange={(e) => handleUpdateAccess(u.userId, e.target.value)}
                                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-[11px] font-black text-gray-600 uppercase tracking-widest focus:ring-2 focus:ring-[#66B2D6]/20 transition-all cursor-pointer hover:border-[#66B2D6]/30 outline-none shadow-sm"
                                  >
                                    <option value="viewer">Viewer</option>
                                    <option value="editor">Editor</option>
                                  </select>
                                  <button
                                    onClick={() => handleRemoveAccess(u.userId)}
                                    className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                    title="Revoke Node"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 z-[100] max-w-sm w-full animate-slideInRight">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 flex items-start gap-4 backdrop-blur-md">
            <div className={classNames(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner",
              toast.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' :
              toast.type === 'success' ? 'bg-green-50 text-green-500 border border-green-100' :
              'bg-[#66B2D6]/10 text-[#66B2D6] border border-[#66B2D6]/20'
            )}>
              {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : 
               toast.type === 'success' ? <ShieldCheck className="w-5 h-5" /> :
               <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm font-bold text-gray-900 leading-tight">Security Message</p>
              <p className="text-xs font-medium text-gray-400 mt-1">{toast.message}</p>
            </div>
            <button onClick={() => setToast({ ...toast, show: false })} className="text-gray-300 hover:text-gray-900 transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default ManagePermissionsPage;
