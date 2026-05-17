import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import DirectoryHeader, { BASE_URL } from "./components/DirectoryHeader";
import {
  ArrowLeft,
  Camera,
  Edit2,
  Check,
  X,
  Shield,
  User,
  HardDrive,
  LogOut,
  CheckCircle2,
  Key,
  Database,
  Eye,
  EyeOff,
  ChevronRight,
  ShieldAlert,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { PasswordStrengthIndicator } from "./components/lightswind/password-strength-indicator";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ title, description }) => (
  <div className="mb-6">
    <h3 className="text-[18px] font-bold text-[#1A202C]">{title}</h3>
    {description && <p className="text-[14px] text-[#718096] mt-1">{description}</p>}
  </div>
);

const Label = ({ children }) => (
  <label className="block text-[14px] font-semibold text-[#1A202C] mb-2">
    {children}
  </label>
);

const inputCls = "w-full px-4 py-2.5 bg-[#F0F2F5] border border-transparent rounded-[10px] text-[15px] text-[#1A202C] focus:outline-none focus:border-[#2D8B8B] focus:bg-white transition-all placeholder:text-[#718096]";
const btnPrimaryCls = "px-5 py-2.5 bg-[#2D8B8B] text-white rounded-[10px] text-[14px] font-semibold hover:bg-[#1A7A7A] transition-colors flex items-center justify-center gap-2 disabled:opacity-50";
const btnSecondaryCls = "px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#1A202C] rounded-[10px] text-[14px] font-semibold hover:bg-[#F0F2F5] transition-colors flex items-center justify-center gap-2 disabled:opacity-50";
const btnDangerCls = "px-5 py-2.5 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded-[10px] text-[14px] font-semibold hover:bg-[#FEE2E2] transition-colors flex items-center justify-center gap-2";

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
        setPasswordError(data.message || "Failed to update password");
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
    if (window.confirm("Are you sure you want to log out of all devices?")) {
      await fetch(`${BASE_URL}/user/logout-all`, { method: "POST", credentials: "include" });
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#2D8B8B] animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "storage", label: "Storage", icon: HardDrive },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-[#1A202C]">
      <DirectoryHeader
        userName={user?.name || "User"}
        userEmail={user?.email || ""}
        userPicture={user?.picture || ""}
        userRole={user?.role || "User"}
        subscriptionId={user?.subscriptionId}
        subscriptionStatus={user?.subscriptionStatus || "active"}
      />

      <div className="max-w-[1000px] mx-auto px-6 py-8 mt-16">
        
        {/* Breadcrumb & Title */}
        <div className="mb-8">
            <button 
                onClick={() => navigate("/")}
                className="flex items-center text-[13px] text-[#4A5568] hover:text-[#1A202C] transition-colors mb-4 gap-1 w-fit"
            >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Drive
            </button>
            <h1 className="text-[28px] font-bold text-[#1A202C]">User Settings</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-[260px] shrink-0 space-y-6">
                <Card className="p-4 flex flex-col gap-2">
                   {tabs.map((tab) => {
                       const isActive = activeTab === tab.id;
                       return (
                           <button
                               key={tab.id}
                               onClick={() => setActiveTab(tab.id)}
                               className={`w-full flex items-center gap-3 px-4 py-3 rounded-[10px] text-[14px] font-semibold transition-all ${
                                   isActive ? 'bg-[#F7FFFE] text-[#2D8B8B] border border-[#A8D8D8]' : 'text-[#718096] hover:bg-[#F0F2F5] border border-transparent'
                               }`}
                           >
                               <tab.icon className={`w-4 h-4 ${isActive ? 'text-[#2D8B8B]' : 'text-[#718096]'}`} />
                               {tab.label}
                           </button>
                       );
                   })}
                </Card>

                {/* Storage Mini Widget */}
                <Card className="p-5">
                    <h4 className="text-[14px] font-semibold mb-3">Storage Link</h4>
                    <div className="h-2 w-full bg-[#E2E8F0] rounded-full overflow-hidden mb-2">
                        <div 
                           className="h-full bg-[#2D8B8B] rounded-full transition-all duration-500" 
                           style={{ width: `${usagePercentage}%` }} 
                        />
                    </div>
                    <div className="flex justify-between text-[12px] text-[#718096]">
                        <span>{formatStorage(usedStorageInBytes)}</span>
                        <span>{formatStorage(maxStorageLimit)}</span>
                    </div>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full space-y-6">
                
                {/* ── PROFILE TAB ────────────────────────────────────────── */}
                {activeTab === "profile" && (
                    <div className="animate-fadeIn space-y-6">
                        <Card>
                            <SectionHeader title="Profile Picture" description="Update your personal photo identifying your account." />
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <div className="w-20 h-20 rounded-full bg-[#F0F2F5] border border-[#E2E8F0] overflow-hidden flex items-center justify-center">
                                        {profilePicture ? (
                                            <img src={profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-[#A0AEC0]" />
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={updatingProfile}
                                        className="absolute bottom-0 right-0 p-1.5 bg-[#2D8B8B] text-white rounded-full shadow-sm hover:scale-110 transition-transform disabled:opacity-50"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                <div>
                                    <p className="text-[14px] text-[#1A202C] font-semibold mb-1">Upload a new picture</p>
                                    <p className="text-[12px] text-[#718096]">JPEG or PNG, less than 5MB.</p>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <SectionHeader title="User Information" description="Manage your basic account details." />
                            <div className="space-y-6 max-w-lg">
                                <div>
                                    <Label>Username</Label>
                                    <div className="flex gap-3">
                                        <input 
                                            type="text" 
                                            value={tempName} 
                                            onChange={(e) => setTempName(e.target.value)}
                                            disabled={!isEditingName || updatingProfile}
                                            className={`${inputCls} flex-1 ${!isEditingName && 'bg-white border-[#E2E8F0]'}`}
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
                                    <Label>User Address (Email)</Label>
                                    <input 
                                        type="email" 
                                        value={user?.email || ""} 
                                        disabled
                                        className={`${inputCls} bg-[#F0F2F5] opacity-70 cursor-not-allowed`}
                                    />
                                    <p className="text-[12px] text-[#718096] mt-1 flex items-center gap-1">
                                        <Shield className="w-3 h-3" /> Email cannot be changed.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <SectionHeader title="Connected Accounts" description="Manage your linked login providers." />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className={`flex items-center justify-between p-4 rounded-[12px] border ${connectedProvider === 'google' ? 'bg-[#F7FFFE] border-[#A8D8D8]' : 'bg-white border-[#E2E8F0]'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                                            <FaGoogle className="text-[#DB4437]" />
                                        </div>
                                        <span className="text-[14px] font-semibold">Google</span>
                                    </div>
                                    {connectedProvider === 'google' && <CheckCircle2 className="w-5 h-5 text-[#2D8B8B]" />}
                                </div>
                                <div className={`flex items-center justify-between p-4 rounded-[12px] border ${connectedProvider === 'github' ? 'bg-[#F7FFFE] border-[#A8D8D8]' : 'bg-white border-[#E2E8F0]'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                                            <FaGithub className="text-[#1A202C]" />
                                        </div>
                                        <span className="text-[14px] font-semibold">GitHub</span>
                                    </div>
                                    {connectedProvider === 'github' && <CheckCircle2 className="w-5 h-5 text-[#2D8B8B]" />}
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
                            <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-lg">
                                
                                {passwordError && (
                                    <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] flex items-center gap-2 text-[13px] text-[#DC2626]">
                                         <AlertTriangle className="w-4 h-4 shrink-0" />
                                         {passwordError}
                                    </div>
                                )}

                                {!hasPassword && (
                                    <div>
                                        <Label>Set a password</Label>
                                        <PasswordStrengthIndicator
                                            value={newPassword}
                                            onChange={(val) => setNewPassword(val)}
                                            showScore={true}
                                            showVisibilityToggle={true}
                                            placeholder="Min. 4 characters"
                                            inputProps={{ className: inputCls, disabled: submitting }}
                                        />
                                    </div>
                                )}
                                {hasPassword && (
                                    <div>
                                        <Label>Current Password</Label>
                                        <div className="relative">
                                            <input
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
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#1A202C]"
                                            >
                                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Label>{hasPassword ? "New password" : "Re-type the password"}</Label>
                                    <PasswordStrengthIndicator
                                        value={confirmPassword}
                                        compareValue={newPassword}
                                        onChange={(val) => setConfirmPassword(val)}
                                        showVisibilityToggle={true}
                                        placeholder={hasPassword ? "Min. 4 characters" : "Retype password"}
                                        inputProps={{ className: inputCls, disabled: submitting }}
                                    />
                                </div>

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
                            <div className="space-y-4 max-w-lg">
                                <div className="flex items-center justify-between p-4 bg-[#F0F2F5] rounded-[10px]">
                                    <div>
                                        <p className="text-[14px] font-semibold text-[#1A202C]">Log out of current device</p>
                                        <p className="text-[12px] text-[#718096]">End your session on this browser.</p>
                                    </div>
                                    <button onClick={handleLogout} className={btnSecondaryCls}>
                                        <LogOut className="w-4 h-4" /> Log out
                                    </button>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-[#FEF2F2] rounded-[10px]">
                                    <div>
                                        <p className="text-[14px] font-semibold text-[#DC2626]">Log out everywhere</p>
                                        <p className="text-[12px] text-[#DC2626]/80">If you noticed suspicious activity.</p>
                                    </div>
                                    <button onClick={handleLogoutAll} className={btnDangerCls}>
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
                                <div className="flex items-end gap-3 mb-6">
                                     <h3 className="text-[40px] font-bold text-[#1A202C] leading-none">{formatStorage(usedStorageInBytes)}</h3>
                                     <span className="text-[14px] text-[#718096] pb-1">used of {formatStorage(maxStorageLimit)}</span>
                                </div>
                                
                                <div className="w-full bg-[#F0F2F5] rounded-full h-3 mb-3 shrink-0 overflow-hidden">
                                     <div 
                                         className={`h-full rounded-full transition-all duration-500`}
                                         style={{ 
                                             width: `${Math.max(usagePercentage, 1)}%`,
                                             backgroundColor: usagePercentage > 90 ? '#DC2626' : '#2D8B8B'
                                         }} 
                                     />
                                </div>
                                
                                <p className="text-[13px] text-[#718096]">
                                    You have used {usagePercentage.toFixed(1)}% of your available storage.
                                </p>
                            </div>
                        </Card>

                        <Card>
                            <SectionHeader title="Upgrade Your Plan" description="Need more space? Upgrade to a higher tier plan." />
                            <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-[#F7FFFE] border border-[#A8D8D8] rounded-[12px] gap-4">
                                <div>
                                    <h4 className="text-[15px] font-bold text-[#1A202C]">Current Plan: {user?.subscriptionPlan || "Basic"}</h4>
                                    <p className="text-[13px] text-[#718096] mt-1">
                                        Unlock advanced features and more storage space.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => navigate("/plans")}
                                    className={btnPrimaryCls}
                                >
                                    View Plans <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* ── Modals & Notifications ─────────────────── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[16px] shadow-xl w-full max-w-sm p-6 animate-scaleIn">
            <h3 className="text-[18px] font-bold text-[#1A202C] mb-2">Change Password?</h3>
            <p className="text-[14px] text-[#718096] mb-6">
                Are you sure you want to update your password? You might need to sign in again on other devices.
            </p>
            <div className="flex gap-3">
                <button onClick={() => setShowConfirmModal(false)} className={`${btnSecondaryCls} flex-1`}>Cancel</button>
                <button onClick={confirmPasswordChange} className={`${btnPrimaryCls} flex-1`}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showNotification.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
           <div className={`bg-white rounded-[12px] shadow-lg p-4 flex items-center gap-3 border ${showNotification.type === 'error' ? 'border-[#FECACA]' : 'border-[#A8D8D8]'}`}>
                {showNotification.type === 'error' ? (
                     <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
                ) : (
                     <CheckCircle2 className="w-5 h-5 text-[#2D8B8B]" />
                )}
                <p className="text-[14px] font-medium text-[#1A202C]">{showNotification.message}</p>
                <button onClick={() => setShowNotification({ ...showNotification, show: false })} className="ml-2 text-[#718096] hover:text-[#1A202C]">
                  <X className="w-4 h-4" />
                </button>
           </div>
        </div>
      )}
    </div>
  );
}
