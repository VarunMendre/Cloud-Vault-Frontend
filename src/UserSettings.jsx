import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import DirectoryHeader, { BASE_URL } from "./components/DirectoryHeader";
import {
  ArrowLeft,
  Upload,
  Eye,
  EyeOff,
  LogOut,
  Camera,
  Edit3,
  Save,
  X,
  Shield,
  User,
  Lock,
  HardDrive,
  ChevronDown,
  Database,
  ShieldCheck,
  Check,
  Info,
  Loader2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Zap,
  ArrowRight,
  Activity,
  UserCheck,
  Globe,
  RefreshCw,
  Clock,
  Key
} from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { Alert, AlertDescription, AlertTitle } from "./components/lightswind/alert";
import { PasswordStrengthIndicator } from "./components/lightswind/password-strength-indicator";

/* ─── Shared UI Components ─────────────────────────────────────────── */

const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden ${className}`}>
        {children}
    </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#66B2D6] shadow-sm">
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <h3 className="text-[10px] font-black text-[#66B2D6] uppercase tracking-[0.2em] mb-0.5">{title}</h3>
            <p className="text-xs font-bold text-gray-900 tracking-tight">{subtitle}</p>
        </div>
    </div>
);

const Label = ({ children }) => (
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
        {children}
    </label>
);

function UserSettings() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Profile management
  const [profileName, setProfileName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
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
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Custom modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotification, setShowNotification] = useState({ show: false, message: "", type: "success" });
  const [pendingPasswordData, setPendingPasswordData] = useState(null);

  // Tab navigation
  const [activeTab, setActiveTab] = useState("profile");

  const showNotify = (message, type = "success") => {
    setShowNotification({ show: true, message, type });
    setTimeout(() => setShowNotification({ show: false, message: "", type: "success" }), 4000);
  };

  // Format storage size helper
  const formatStorage = (bytes) => {
    const MB = 1024 * 1024;
    const GB = 1024 * 1024 * 1024;
    if (bytes >= GB) return `${(bytes / GB).toFixed(2)} GB`;
    if (bytes >= MB) return `${(bytes / MB).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(2)} KB`;
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
      showNotify("Invalid asset type. Image required.", "error");
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
        showNotify("Biometric asset updated");
        refreshUser();
      }
    } catch (err) {
      showNotify("Asset deployment failed", "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleSaveName = async () => {
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
        showNotify("Identity re-indexed");
        refreshUser();
      }
    } catch (err) {
      showNotify("Naming protocol failure", "error");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setPasswordError("Complexity insufficient (min 4 chars)");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Verification mismatch");
      return;
    }
    setPendingPasswordData({ currentPassword, newPassword });
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
        showNotify("Security protocols synchronized");
      } else {
        const data = await response.json();
        setPasswordError(data.message || "Protocol reject: Invalid credentials");
      }
    } catch (err) {
      setPasswordError("Security relay interrupted");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch(`${BASE_URL}/user/logout`, { method: "POST", credentials: "include" });
    navigate("/login");
  };

  const handleLogoutAll = async () => {
    await fetch(`${BASE_URL}/user/logout-all`, { method: "POST", credentials: "include" });
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-gray-100 border-t-[#66B2D6] rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] animate-pulse">Syncing Core Assets...</p>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Identity Hub", icon: User },
    { id: "security", label: "Security Protocol", icon: ShieldCheck },
    { id: "storage", label: "Infrastructure", icon: HardDrive },
  ];

  const inputCls = "w-full pl-6 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-[#66B2D6]/30 focus:bg-white transition-all outline-none placeholder:text-gray-300";

  return (
    <div className="min-h-screen bg-gray-50">
      <DirectoryHeader
        userName={user?.name || "Guest User"}
        userEmail={user?.email || ""}
        userPicture={user?.picture || ""}
        userRole={user?.role || "User"}
        subscriptionId={user?.subscriptionId}
        subscriptionStatus={user?.subscriptionStatus || "active"}
      />

      <div className="max-w-7xl mx-auto px-4 pt-32 pb-16">
        
        {/* Dynamic Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
            <div>
                <button 
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2 mb-8 text-[10px] font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  Primary Node
                </button>
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white rounded-[1.5rem] border border-gray-200 shadow-sm flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-500">
                         <Zap className="w-8 h-8 text-[#66B2D6]" />
                    </div>
                    <div>
                        <h2 className="text-[10px] font-black text-[#66B2D6] uppercase tracking-[0.4em] mb-1">Vault Console</h2>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Registry</h1>
                    </div>
                </div>
            </div>
            
            <div className="inline-flex p-1.5 bg-white border border-gray-200 rounded-[1.5rem] shadow-sm">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all flex items-center gap-3 ${
                            activeTab === tab.id 
                            ? "bg-gray-900 text-white shadow-xl scale-105" 
                            : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                        id={`tab-nav-${tab.id}`}
                    >
                        <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-[#66B2D6]' : ''}`} />
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Left Column: Biometric Snapshot */}
            <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-32">
                <Card className="p-8">
                    <div className="relative mb-10 flex justify-center group">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden shadow-inner flex items-center justify-center relative transform rotate-1 group-hover:rotate-0 transition-all duration-500">
                            {profilePicture ? (
                                <img src={profilePicture} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                                <User className="w-12 h-12 text-gray-200" />
                            )}
                            <button 
                                onClick={() => document.getElementById('biometric-uploader').click()}
                                className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2 backdrop-blur-sm"
                            >
                                <Camera className="w-6 h-6 text-[#66B2D6]" />
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Update Binary</span>
                            </button>
                        </div>
                        <input id="biometric-uploader" type="file" className="hidden" onChange={handleFileChange} />
                        
                        <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-gray-100">
                             <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight mb-2 truncate">{profileName}</h2>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Operational Phase</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-8 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Registry ID</span>
                            <span className="text-[10px] font-bold text-gray-900 font-mono">#{user?._id?.slice(-8).toUpperCase() || "GRID-NODE"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Uptime</span>
                            <span className="text-[10px] font-bold text-gray-900">99.9%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Protocol</span>
                            <span className="text-[10px] font-black text-[#66B2D6] uppercase tracking-widest">{user?.role || "User"} Unit</span>
                        </div>
                    </div>
                </Card>
                
                <Card className="p-8 bg-gray-900 border-none relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-[#66B2D6]/10 rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-700" />
                     <h3 className="text-[10px] font-black text-[#66B2D6] uppercase tracking-[0.3em] mb-4">Infrastructure Status</h3>
                     <div className="space-y-4">
                         <div className="flex justify-between items-end mb-2">
                             <p className="text-2xl font-black text-white leading-none">{formatStorage(usedStorageInBytes)}</p>
                             <p className="text-[9px] font-black text-gray-500 uppercase">Used dividend</p>
                         </div>
                         <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-[#66B2D6] rounded-full shadow-[0_0_12px_rgba(102,178,214,0.3)] transition-all duration-1000" style={{ width: `${usagePercentage}%` }} />
                         </div>
                         <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center mt-3">Capactity: {formatStorage(maxStorageLimit)}</p>
                     </div>
                </Card>
            </div>

            {/* Right Column: Dynamic Content Panels */}
            <div className="lg:col-span-3 space-y-8">
                
                {/* ── PROFILE HUB ────────────────────────────────────────── */}
                {activeTab === "profile" && (
                    <div className="space-y-8 animate-fadeIn">
                        <Card>
                            <SectionHeader icon={Info} title="Identity Meta" subtitle="Synchronize your personal identification assets" />
                            <div className="p-10 space-y-10">
                                <div>
                                    <Label>Registry Identifier</Label>
                                    <div className="relative group">
                                        <input 
                                            type="text" 
                                            value={tempName} 
                                            onChange={(e) => setTempName(e.target.value)}
                                            disabled={!isEditingName || updatingProfile}
                                            className={`${inputCls} group-hover:border-[#66B2D6]/20 ${isEditingName ? 'border-[#66B2D6]' : ''}`}
                                            id="identity-identifier-input"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            {!isEditingName ? (
                                                <button onClick={() => setIsEditingName(true)} className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all shadow-sm">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={handleSaveName} disabled={updatingProfile} className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2">
                                                        {updatingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                    </button>
                                                    <button onClick={() => { setIsEditingName(false); setTempName(profileName); }} className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <Label>Node Address (Read Only)</Label>
                                    <div className="px-6 py-5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between">
                                         <span className="text-sm font-bold text-gray-400">{user?.email}</span>
                                         <ShieldAlert className="w-4 h-4 text-amber-500/50" />
                                    </div>
                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-3 px-1 italic">Verified logic branch locked</p>
                                </div>

                                <div>
                                    <Label>External Authentication Anchors</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${connectedProvider === 'google' ? 'bg-[#66B2D6]/5 border-[#66B2D6]/30' : 'bg-gray-50 border-gray-100 grayscale opacity-60'}`}>
                                            <div className="flex items-center gap-4">
                                                <FaGoogle className={connectedProvider === 'google' ? 'text-[#DB4437]' : 'text-gray-400'} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Google Gateway</span>
                                            </div>
                                            {connectedProvider === 'google' && <div className="w-5 h-5 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg"><Check className="w-3 h-3 text-white" /></div>}
                                        </div>
                                        <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${connectedProvider === 'github' ? 'bg-[#66B2D6]/5 border-[#66B2D6]/30' : 'bg-gray-50 border-gray-100 grayscale opacity-60'}`}>
                                            <div className="flex items-center gap-4">
                                                <FaGithub className={connectedProvider === 'github' ? 'text-black' : 'text-gray-400'} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">GitHub Relay</span>
                                            </div>
                                            {connectedProvider === 'github' && <div className="w-5 h-5 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg"><Check className="w-3 h-3 text-white" /></div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* ── SECURITY HUB ───────────────────────────────────────── */}
                {activeTab === "security" && (
                    <div className="space-y-8 animate-fadeIn">
                        <Card>
                            <SectionHeader icon={Shield} title="Encryption Management" subtitle="Manage account access keys and protocols" />
                            <form onSubmit={handlePasswordSubmit} className="p-10 space-y-10">
                                
                                {passwordError && (
                                    <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-4 animate-shake">
                                         <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                                         <div className="space-y-1">
                                             <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-none">Protocol Violation</p>
                                             <p className="text-xs font-bold text-rose-500 leading-tight">{passwordError}</p>
                                         </div>
                                    </div>
                                )}

                                {hasPassword && (
                                    <div>
                                        <Label>Current Cipher Key</Label>
                                        <div className="relative">
                                            <input 
                                                type={showCurrentPassword ? "text" : "password"} 
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="Enter legacy index"
                                                className={inputCls}
                                                required
                                                disabled={submitting}
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors"
                                            >
                                                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                     <div className="space-y-4">
                                        <Label>New Encryption Node</Label>
                                        <PasswordStrengthIndicator
                                            value={newPassword}
                                            onChange={(val) => setNewPassword(val)}
                                            showScore={true}
                                            showVisibilityToggle={true}
                                            placeholder="Min. 4 characters"
                                            inputProps={{ className: inputCls, disabled: submitting }}
                                        />
                                     </div>
                                     <div className="space-y-4">
                                        <Label>Redundancy Check</Label>
                                        <PasswordStrengthIndicator
                                            value={confirmPassword}
                                            compareValue={newPassword}
                                            onChange={(val) => setConfirmPassword(val)}
                                            showVisibilityToggle={true}
                                            placeholder="Verify index integrity"
                                            inputProps={{ className: inputCls, disabled: submitting }}
                                        />
                                     </div>
                                </div>

                                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100 pt-10">
                                     <div className="flex items-center gap-4">
                                         <ShieldCheck className="w-6 h-6 text-[#66B2D6]" />
                                         <div className="max-w-[18rem]">
                                             <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">Update Protocol</p>
                                             <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wider leading-relaxed">Updating ciphers will invalidate all active biometric sessions.</p>
                                         </div>
                                     </div>
                                     <button 
                                        type="submit" 
                                        disabled={submitting || !newPassword} 
                                        className="w-full sm:w-auto px-10 py-5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 hover:bg-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                     >
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                                        Synchronize Keys
                                     </button>
                                </div>
                            </form>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <Card className="group">
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100 group-hover:bg-amber-100 transition-colors">
                                            <LogOut className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Active Node Session</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Local Authorization Only</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full py-4 border border-amber-100 bg-white text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                                    >
                                        Inactivate Current Session
                                    </button>
                                </div>
                             </Card>
                             <Card className="group">
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100 group-hover:bg-rose-100 transition-colors">
                                            <ShieldAlert className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Global Invalidation</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Emergency Killswitch</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleLogoutAll}
                                        className="w-full py-4 border border-rose-100 bg-white text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                    >
                                        Purge Global Auth Registry
                                    </button>
                                </div>
                             </Card>
                        </div>
                    </div>
                )}

                {/* ── INFRASTRUCTURE HUB ─────────────────────────────────── */}
                {activeTab === "storage" && (
                    <div className="space-y-8 animate-fadeIn">
                        <Card>
                            <SectionHeader icon={Database} title="Asset Cluster" subtitle="Manage node storage dividends and tiers" />
                            <div className="p-10 space-y-12">
                                <div>
                                    <div className="flex justify-between items-end mb-6">
                                         <div>
                                             <h3 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-2">{formatStorage(usedStorageInBytes)}</h3>
                                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Allocated Dividend Index</p>
                                         </div>
                                         <div className="text-right">
                                             <p className="text-xs font-black text-gray-900">{usagePercentage.toFixed(2)}%</p>
                                             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Sync Ratio</p>
                                         </div>
                                    </div>
                                    
                                    <div className="h-4 bg-gray-50 border border-gray-100 rounded-full overflow-hidden shadow-inner p-1">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${usagePercentage > 90 ? 'bg-rose-500' : 'bg-[#66B2D6]'}`}
                                            style={{ width: `${Math.max(usagePercentage, 1)}%` }} 
                                        />
                                    </div>
                                    
                                    <div className="mt-8 grid grid-cols-2 gap-10">
                                         <div className="space-y-1">
                                             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Primary Capacity</p>
                                             <p className="text-sm font-black text-gray-900">{formatStorage(maxStorageLimit)}</p>
                                         </div>
                                         <div className="space-y-1 text-right">
                                             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Available Flux</p>
                                             <p className="text-sm font-black text-[#66B2D6]">{formatStorage(maxStorageLimit - usedStorageInBytes)}</p>
                                         </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-gray-50 border border-gray-100 rounded-3xl flex items-center gap-6">
                                     <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-gray-100">
                                         <ShieldCheck className="w-7 h-7" />
                                     </div>
                                     <div className="flex-1">
                                          <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">Resource Health</p>
                                          <p className="text-xs font-medium text-gray-400 leading-relaxed uppercase tracking-tight">Your infrastructure node is performing optimally within its designated tier parameters.</p>
                                     </div>
                                </div>

                                <button 
                                    onClick={() => navigate("/plans")}
                                    className="w-full py-6 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                >
                                    Initiate Migration to Higher Tier
                                    <ChevronRight className="w-4 h-4 text-[#66B2D6]" />
                                </button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* ── Security Confirm Modal ─────────────────── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] w-full max-w-sm overflow-hidden animate-scaleIn border border-gray-100">
            <div className="p-10">
                <div className="w-16 h-16 bg-[#66B2D6]/10 rounded-2xl flex items-center justify-center text-[#66B2D6] border border-[#66B2D6]/20 mb-8 mx-auto">
                   <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="text-center mb-10">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight mb-3">Protocol Update?</h3>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest leading-relaxed">
                        Modifying security indices will trigger a global session invalidation across all nodes.
                    </p>
                </div>
                <div className="flex flex-col gap-3">
                    <button onClick={confirmPasswordChange} className="w-full py-5 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95">Commit Encryption Sync</button>
                    <button onClick={() => setShowConfirmModal(false)} className="w-full py-5 bg-white text-gray-400 hover:text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Abort Update</button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notification ─────────────────────── */}
      {showNotification.show && (
        <div className="fixed bottom-10 right-10 z-[10001] max-w-sm w-full animate-slideUp">
           <div className={`bg-white border rounded-[2rem] shadow-2xl p-6 flex items-start gap-5 backdrop-blur-md ${showNotification.type === 'error' ? 'border-rose-100' : 'border-gray-100'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                  showNotification.type === 'error' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'
                }`}>
                  {showNotification.type === 'error' ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-tight">Registry Event</p>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider leading-relaxed">{showNotification.message}</p>
                </div>
                <button onClick={() => setShowNotification({ ...showNotification, show: false })} className="text-gray-300 hover:text-gray-900 transition-colors p-1">
                  <X className="w-4 h-4" />
                </button>
           </div>
        </div>
      )}
    </div>
  );
}

export default UserSettings;
