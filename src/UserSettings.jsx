import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import DirectoryHeader, { BASE_URL } from "./components/DirectoryHeader";
import {
  ArrowLeft,
  Camera,
  Edit2,
  X,
  Shield,
  User,
  HardDrive,
  LogOut,
  CheckCircle2,
  Key,
  Eye,
  EyeOff,
  ChevronRight,
  ShieldAlert,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { PasswordStrengthIndicator } from "./components/lightswind/password-strength-indicator";
import { getSubscriptionDetails } from "./apis/subscriptionApi";
import "./UserSettingsVisual.css";

const Card = ({ children, className = "" }) => (
  <div className={`settings-card rounded-2xl border p-6 ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ title, description }) => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold text-[var(--cv-text)]">{title}</h3>
    {description && <p className="mt-1 text-sm leading-6 text-[var(--cv-text-muted)]">{description}</p>}
  </div>
);

const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="settings-label mb-2 block text-sm font-medium text-[var(--cv-text)]">
    {children}
  </label>
);

const inputCls = "settings-input w-full rounded-lg border px-4 py-3 pr-12 text-base transition-colors placeholder:text-[var(--cv-text-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cv-focus)]";
const btnPrimaryCls = "settings-button-primary inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const btnSecondaryCls = "settings-button-secondary inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const btnDangerCls = "settings-button-danger inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors";

export default function UserSettings() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Profile management
  const [profileName, setProfileName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // Storage info
  const maxStorageLimit = user?.maxStorageLimit || 1073741824;
  const usedStorageInBytes = user?.usedStorageInBytes || 0;
  const [currentPlanName, setCurrentPlanName] = useState("");

  // Connected accounts
  const [connectedProvider, setConnectedProvider] = useState(null);

  // Password management
  const [hasPassword, setHasPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // UI states
  const [loading, setLoading] = useState(true);
  const [passwordError, setPasswordError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Custom modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLogoutAllConfirm, setShowLogoutAllConfirm] = useState(false);
  const [showNotification, setShowNotification] = useState({ show: false, message: "", type: "success" });
  const [pendingPasswordData, setPendingPasswordData] = useState(null);

  // Tab navigation
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef(null);

  const showNotify = (message, type = "success") => {
    setShowNotification({ show: true, message, type });
    setTimeout(() => setShowNotification({ show: false, message: "", type: "success" }), 4000);
  };

  // Format storage size helper
  const formatStorage = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024, dm = 2, sizes = ["Bytes", "KB", "MB", "GB", "TB"], i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const usagePercentage = Math.min((usedStorageInBytes / maxStorageLimit) * 100, 100);

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    async function fetchAdditionalUserData() {
      if (!user) return;
      try {
        const passwordResponse = await fetch(`${BASE_URL}/user/has-password`, { credentials: "include" });
        if (passwordResponse.ok) {
          const passwordData = await passwordResponse.json();
          setHasPassword(passwordData.hasPassword);
        }

        const isGoogleImage = user.picture?.includes("googleusercontent.com");
        const isGithubImage = user.picture?.includes("githubusercontent.com") || user.picture?.includes("avatars.github");

        if (user.email.includes("@gmail.com") || isGoogleImage) {
          setConnectedProvider("google");
        } else if (user.email.includes("github") || isGithubImage) {
          setConnectedProvider("github");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdditionalUserData();
  }, [user?.email]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setTempName(user.name || "");
      setProfilePicture(user.picture || "");
    }
  }, [user]);

  useEffect(() => {
    let isCurrent = true;
    const fallbackPlanName = user?.subscriptionPlan || (user?.subscriptionId ? "Subscription" : "Free");
    setCurrentPlanName(fallbackPlanName);

    if (!user?.subscriptionId) {
      return () => {
        isCurrent = false;
      };
    }

    async function loadCurrentPlan() {
      try {
        const details = await getSubscriptionDetails();
        if (isCurrent && details?.activePlan?.name) {
          setCurrentPlanName(details.activePlan.name);
        }
      } catch (error) {
        console.error("Failed to load current subscription plan:", error);
      }
    }

    loadCurrentPlan();
    return () => {
      isCurrent = false;
    };
  }, [user?.subscriptionId, user?.subscriptionPlan]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showNotify("Please upload a valid image file.", "error");
      return;
    }
    setUpdatingProfile(true);
    try {
      const res = await fetch(`${BASE_URL}/user/profile/picture-upload-url?contentType=${file.type}&filename=${file.name}`, { credentials: "include" });
      const { uploadUrl, key } = await res.json();
      await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      const updateRes = await fetch(`${BASE_URL}/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ picture: key }),
      });
      if (updateRes.ok) {
        showNotify("Profile picture updated successfully");
        refreshUser();
      }
    } catch (err) {
      showNotify("Failed to upload profile picture", "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleSaveName = async () => {
    if (!tempName.trim()) {
       showNotify("Name cannot be empty", "error");
       return;
    }
    setUpdatingProfile(true);
    try {
      const response = await fetch(`${BASE_URL}/user/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: tempName }),
      });
      if (response.ok) {
        setProfileName(tempName);
        setIsEditingName(false);
        showNotify("Profile name updated successfully");
        refreshUser();
      }
    } catch (err) {
      showNotify("Failed to update profile name", "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setPasswordError("Password must be at least 4 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    setPendingPasswordData(hasPassword ? { currentPassword, newPassword } : { newPassword });
    setShowConfirmModal(true);
  };

  const confirmPasswordChange = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    setPasswordError("");
    try {
      const endpoint = hasPassword ? "/user/change-password" : "/user/set-password";
      const body = hasPassword ? pendingPasswordData : { newPassword: pendingPasswordData.newPassword };
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (response.ok) {
        setHasPassword(true);
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        showNotify("Password updated successfully");
      } else {
        const data = await response.json();
        const errorMessage = data.error || data.message || "Failed to update password";
        setPasswordError(errorMessage);
        if (errorMessage.toLowerCase().includes("already set")) {
          setHasPassword(true);
        }
      }
    } catch (err) {
      setPasswordError("An error occurred while updating the password");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${BASE_URL}/user/logout`, { method: "POST", credentials: "include" });
    navigate("/login");
  };

  const handleLogoutAll = async () => {
    setShowLogoutAllConfirm(true);
  };

  const confirmLogoutAll = async () => {
    setShowLogoutAllConfirm(false);
    await fetch(`${BASE_URL}/user/logout-all`, { method: "POST", credentials: "include" });
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="settings-page flex min-h-screen flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--cv-primary)]" aria-label="Loading settings" />
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "storage", label: "Storage", icon: HardDrive },
  ];

  return (
    <div className="settings-page min-h-screen font-sans text-[var(--cv-text)]">
      <DirectoryHeader
        userName={user?.name || "Guest User"}
        userEmail={user?.email || "guest@example.com"}
        userPicture={user?.picture || ""}
        userRole={user?.role || "User"}
        subscriptionId={user?.subscriptionId}
        subscriptionStatus={user?.subscriptionStatus || "active"}
      />

      <main className="mx-auto mt-16 w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Title */}
        <div className="mb-8">
            <button 
                onClick={() => navigate("/")}
                className="mb-4 inline-flex min-h-11 w-fit items-center gap-2 text-sm font-medium text-[var(--cv-text-muted)] transition-colors hover:text-[var(--cv-primary)]"
            >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Drive
            </button>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--cv-text)]">User Settings</h1>
        </div>

        <div className="flex flex-col items-start gap-6 lg:flex-row lg:gap-8">
            
            {/* Sidebar Navigation */}
            <aside className="w-full shrink-0 space-y-4 lg:w-64">
                <Card className="flex flex-col gap-2 p-3">
                   {tabs.map((tab) => {
                       const isActive = activeTab === tab.id;
                       return (
                           <button
                               key={tab.id}
                               onClick={() => setActiveTab(tab.id)}
                               aria-current={isActive ? "page" : undefined}
                               className={`settings-tab min-h-11 w-full rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                                   isActive ? 'border-[var(--cv-primary)]/30 bg-[var(--cv-primary)]/5 text-[var(--cv-primary)]' : 'border-transparent text-[var(--cv-text-muted)] hover:bg-[var(--cv-surface-muted)] hover:text-[var(--cv-text)]'
                               }`}
                           >
                               <tab.icon className="mr-3 inline h-4 w-4" aria-hidden="true" />
                               {tab.label}
                           </button>
                       );
                   })}
                </Card>

                {/* Storage Mini Widget */}
                <Card className="p-5">
                    <h4 className="mb-3 text-sm font-semibold">Storage Link</h4>
                    <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-[var(--cv-surface-muted)]">
                        <div 
                           className="h-full rounded-full bg-[var(--cv-primary)] transition-[width] duration-200"
                           style={{ width: `${usagePercentage}%` }} 
                        />
                    </div>
                    <div className="flex justify-between text-xs text-[var(--cv-text-muted)]">
                        <span>{formatStorage(usedStorageInBytes)}</span>
                        <span>{formatStorage(maxStorageLimit)}</span>
                    </div>
                </Card>
            </aside>

            {/* Main Content Area */}
            <div className="w-full min-w-0 flex-1 space-y-6">
                
                {/* ── PROFILE TAB ────────────────────────────────────────── */}
                {activeTab === "profile" && (
                    <div className="animate-fadeIn space-y-6">
                        <Card>
                            <SectionHeader title="Profile Picture" description="Update your personal photo identifying your account." />
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[var(--cv-border)] bg-[var(--cv-surface-muted)]">
                                        {profilePicture ? (
                                            <img src={profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="h-8 w-8 text-[var(--cv-text-muted)]" aria-hidden="true" />
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={updatingProfile}
                                        aria-label="Upload a new profile picture"
                                        className="absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cv-primary)] text-white shadow-sm transition-colors hover:bg-[var(--cv-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Camera className="h-4 w-4" aria-hidden="true" />
                                    </button>
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} aria-label="Choose a profile picture" />
                                <div>
                                    <p className="mb-1 text-sm font-semibold text-[var(--cv-text)]">Upload a new picture</p>
                                    <p className="text-sm leading-5 text-[var(--cv-text-muted)]">JPEG or PNG, less than 5MB.</p>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <SectionHeader title="User Information" description="Manage your basic account details." />
                            <div className="max-w-lg space-y-6">
                                <div>
                                    <Label htmlFor="settings-username">Username</Label>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <input 
                                            id="settings-username"
                                            type="text" 
                                            value={tempName} 
                                            onChange={(e) => setTempName(e.target.value)}
                                            disabled={!isEditingName || updatingProfile}
                                            className={`${inputCls} min-w-0 flex-1 disabled:cursor-not-allowed`}
                                        />
                                        {!isEditingName ? (
                                            <button onClick={() => setIsEditingName(true)} className={btnSecondaryCls}>
                                                <Edit2 className="w-4 h-4" /> Edit
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button onClick={handleSaveName} disabled={updatingProfile} className={btnPrimaryCls}>
                                                    {updatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                                                </button>
                                                <button onClick={() => { setIsEditingName(false); setTempName(profileName); }} className={btnSecondaryCls}>
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div>
                                    <Label htmlFor="settings-email">User Address (Email)</Label>
                                    <input 
                                        id="settings-email"
                                        type="email" 
                                        value={user?.email || ""} 
                                        disabled
                                        className={`${inputCls} cursor-not-allowed bg-[var(--cv-surface-muted)] opacity-80`}
                                    />
                                    <p className="mt-2 flex items-center gap-2 text-sm text-[var(--cv-text-muted)]">
                                        <Shield className="h-4 w-4" aria-hidden="true" /> Email cannot be changed.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <SectionHeader title="Connected Accounts" description="Manage your linked login providers." />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className={`flex items-center justify-between rounded-xl border p-4 ${connectedProvider === 'google' ? 'border-[var(--cv-primary)]/30 bg-[var(--cv-primary)]/5' : 'border-[var(--cv-border)] bg-[var(--cv-surface)]'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                                            <FaGoogle className="text-[#DB4437]" aria-hidden="true" />
                                        </div>
                                        <span className="text-[14px] font-semibold">Google</span>
                                    </div>
                                    {connectedProvider === 'google' && <CheckCircle2 className="h-5 w-5 text-[var(--cv-primary)]" role="img" aria-label="Connected" />}
                                </div>
                                <div className={`flex items-center justify-between rounded-xl border p-4 ${connectedProvider === 'github' ? 'border-[var(--cv-primary)]/30 bg-[var(--cv-primary)]/5' : 'border-[var(--cv-border)] bg-[var(--cv-surface)]'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                                            <FaGithub className="text-[var(--cv-text)]" aria-hidden="true" />
                                        </div>
                                        <span className="text-[14px] font-semibold">GitHub</span>
                                    </div>
                                    {connectedProvider === 'github' && <CheckCircle2 className="h-5 w-5 text-[var(--cv-primary)]" role="img" aria-label="Connected" />}
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* ── SECURITY TAB ───────────────────────────────────────── */}
                {activeTab === "security" && (
                    <div className="animate-fadeIn space-y-6">
                        <Card>
                            <SectionHeader title="Security" description="Set and reset password." />
                            <form onSubmit={handlePasswordSubmit} className="max-w-lg space-y-5">
                                
                                {passwordError && (
                                    <div className="flex items-center gap-2 rounded-lg border border-[var(--cv-danger)]/25 bg-[var(--cv-danger-background)] p-3 text-sm text-[var(--cv-danger)]">
                                         <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                                         {passwordError}
                                    </div>
                                )}

                                {!hasPassword && (
                                    <>
                                        <div>
                                            <Label htmlFor="settings-set-password">Set a password</Label>
                                            <PasswordStrengthIndicator
                                                label=""
                                                value={newPassword}
                                                onChange={(val) => setNewPassword(val)}
                                                showScore={true}
                                                showVisibilityToggle={true}
                                                placeholder="Min. 4 characters"
                                                inputProps={{ id: "settings-set-password", className: inputCls, disabled: submitting }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="settings-confirm-set-password">Re-type the password</Label>
                                            <PasswordStrengthIndicator
                                                label=""
                                                value={confirmPassword}
                                                compareValue={newPassword}
                                                onChange={(val) => setConfirmPassword(val)}
                                                showVisibilityToggle={true}
                                                placeholder="Retype password"
                                                inputProps={{ id: "settings-confirm-set-password", className: inputCls, disabled: submitting }}
                                            />
                                        </div>
                                    </>
                                )}
                                {hasPassword && (
                                    <>
                                        <div>
                                            <Label htmlFor="settings-current-password">Current Password</Label>
                                            <div className="relative">
                                                <input
                                                    id="settings-current-password"
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    placeholder="Enter current password"
                                                    className={inputCls}
                                                    required
                                                    disabled={submitting}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                                                    className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-[var(--cv-text-muted)] hover:text-[var(--cv-text)]"
                                                >
                                                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="settings-new-password">New password</Label>
                                            <PasswordStrengthIndicator
                                                label=""
                                                value={newPassword}
                                                onChange={(val) => setNewPassword(val)}
                                                showScore={true}
                                                showVisibilityToggle={true}
                                                placeholder="Min. 4 characters"
                                                inputProps={{ id: "settings-new-password", className: inputCls, disabled: submitting }}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="settings-confirm-password">Confirm new password</Label>
                                            <PasswordStrengthIndicator
                                                label=""
                                                value={confirmPassword}
                                                compareValue={newPassword}
                                                onChange={(val) => setConfirmPassword(val)}
                                                showVisibilityToggle={true}
                                                placeholder="Confirm new password"
                                                inputProps={{ id: "settings-confirm-password", className: inputCls, disabled: submitting }}
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="pt-2">
                                     <button 
                                        type="submit" 
                                        disabled={submitting || !newPassword} 
                                        className={btnPrimaryCls}
                                     >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                                        {hasPassword ? "Change Password" : "Set Password"}
                                     </button>
                                </div>
                            </form>
                        </Card>

                        <Card>
                            <SectionHeader title="Session Management" description="Manage your active sessions and devices." />
                            <div className="max-w-lg space-y-4">
                                <div className="flex flex-col justify-between gap-4 rounded-xl bg-[var(--cv-surface-muted)] p-4 sm:flex-row sm:items-center">
                                    <div>
                                        <p className="text-sm font-semibold text-[var(--cv-text)]">Log out of current device</p>
                                        <p className="mt-1 text-sm text-[var(--cv-text-muted)]">End your session on this browser.</p>
                                    </div>
                                    <button onClick={handleLogout} className={`${btnSecondaryCls} w-full sm:w-auto`}>
                                        <LogOut className="w-4 h-4" /> Log out
                                    </button>
                                </div>
                                <div className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--cv-danger)]/20 bg-[var(--cv-danger-background)] p-4 sm:flex-row sm:items-center">
                                    <div>
                                        <p className="text-sm font-semibold text-[var(--cv-danger)]">Log out everywhere</p>
                                        <p className="mt-1 text-sm text-[var(--cv-danger)]">If you noticed suspicious activity.</p>
                                    </div>
                                    <button onClick={handleLogoutAll} className={`${btnDangerCls} w-full sm:w-auto`}>
                                        <ShieldAlert className="w-4 h-4" /> Secure Account
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* ── STORAGE TAB ────────────────────────────────────────── */}
                {activeTab === "storage" && (
                    <div className="animate-fadeIn space-y-6">
                        <Card>
                            <SectionHeader title="Storage Overview" description="View and manage your account storage limits." />
                            <div className="py-2">
                                <div className="mb-6 flex flex-wrap items-end gap-x-3 gap-y-2">
                                     <h3 className="text-4xl font-semibold leading-none tracking-tight text-[var(--cv-text)]">{formatStorage(usedStorageInBytes)}</h3>
                                     <span className="pb-1 text-sm text-[var(--cv-text-muted)]">used of {formatStorage(maxStorageLimit)}</span>
                                </div>
                                
                                <div className="mb-3 h-3 w-full shrink-0 overflow-hidden rounded-full bg-[var(--cv-surface-muted)]">
                                     <div 
                                         className="h-full rounded-full transition-[width] duration-200"
                                         style={{ 
                                             width: `${Math.max(usagePercentage, 1)}%`,
                                             backgroundColor: usagePercentage > 90 ? "var(--cv-danger)" : "var(--cv-primary)"
                                         }} 
                                     />
                                </div>
                                
                                <p className="text-sm text-[var(--cv-text-muted)]">
                                    You have used {usagePercentage.toFixed(1)}% of your available storage.
                                </p>
                            </div>
                        </Card>

                        <Card>
                            <SectionHeader title="Upgrade Your Plan" description="Need more space? Upgrade to a higher tier plan." />
                            <div className="flex flex-col justify-between gap-4 rounded-xl border border-[var(--cv-primary)]/30 bg-[var(--cv-primary)]/5 p-5 sm:flex-row sm:items-center">
                                <div>
                                    <h4 className="text-base font-semibold text-[var(--cv-text)]">Current Plan: {currentPlanName || "Loading plan..."}</h4>
                                    <p className="mt-1 text-sm text-[var(--cv-text-muted)]">
                                        Unlock advanced features and more storage space.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => navigate("/plans")}
                                    className={btnPrimaryCls}
                                >
                                    View Plans <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                </button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
      </main>

      {/* ── Modals & Notifications ─────────────────── */}
      {showConfirmModal && (
        <div className="settings-modal-backdrop">
          <div role="dialog" aria-modal="true" aria-labelledby="change-password-title" className="settings-modal">
            <h3 id="change-password-title" className="settings-modal-title">Change Password?</h3>
            <p className="settings-modal-copy">
                Are you sure you want to update your password? You might need to sign in again on other devices.
            </p>
            <div className="settings-modal-actions">
                <button onClick={() => setShowConfirmModal(false)} className={`${btnSecondaryCls} flex-1`}>Cancel</button>
                <button onClick={confirmPasswordChange} className={`${btnPrimaryCls} flex-1`}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showLogoutAllConfirm && (
        <div className="settings-modal-backdrop">
          <div role="dialog" aria-modal="true" aria-labelledby="logout-all-title" className="settings-modal">
            <div className="settings-modal-icon settings-modal-icon-danger" aria-hidden="true">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 id="logout-all-title" className="settings-modal-title">Log out everywhere?</h3>
            <p className="settings-modal-copy">Are you sure you want to log out of all devices?</p>
            <div className="settings-modal-actions">
              <button onClick={() => setShowLogoutAllConfirm(false)} className={`${btnSecondaryCls} flex-1`}>Cancel</button>
              <button onClick={confirmLogoutAll} className={`${btnDangerCls} flex-1`}>Log out everywhere</button>
            </div>
          </div>
        </div>
      )}

      {showNotification.show && (
        <div className={`settings-notification ${showNotification.type === "error" ? "settings-notification-error" : "settings-notification-success"}`}>
           <div role={showNotification.type === "error" ? "alert" : "status"} aria-live={showNotification.type === "error" ? "assertive" : "polite"} className="settings-notification-content">
                {showNotification.type === 'error' ? (
                     <span className="settings-notification-icon" aria-hidden="true"><AlertTriangle className="h-5 w-5" /></span>
                ) : (
                     <span className="settings-notification-icon" aria-hidden="true"><CheckCircle2 className="h-5 w-5" /></span>
                )}
                <p className="settings-notification-message">{showNotification.message}</p>
                <button type="button" aria-label="Dismiss notification" onClick={() => setShowNotification({ ...showNotification, show: false })} className="settings-notification-dismiss">
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
           </div>
        </div>
      )}
    </div>
  );
}
