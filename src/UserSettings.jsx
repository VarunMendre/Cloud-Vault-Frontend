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
} from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { Alert, AlertDescription, AlertTitle } from "./components/lightswind/alert";
import { PasswordStrengthIndicator } from "./components/lightswind/password-strength-indicator";
import { Loader2 } from "lucide-react";

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
  const [connectedProvider, setConnectedProvider] = useState(null); // 'google' or 'github'

  // Password management
  const [hasPassword, setHasPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // Global page errors
  const [passwordError, setPasswordError] = useState(""); // Password form errors
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Custom modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [pendingPasswordData, setPendingPasswordData] = useState(null);

  // Tab navigation
  const [activeTab, setActiveTab] = useState("profile");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Format storage size helper
  const formatStorage = (bytes) => {
    const MB = 1024 * 1024;
    const GB = 1024 * 1024 * 1024;
    
    if (bytes >= GB) {
      return `${(bytes / GB).toFixed(2)} GB`;
    } else if (bytes >= MB) {
      return `${(bytes / MB).toFixed(2)} MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${bytes} B`;
    }
  };

  // Calculate storage stats
  const usagePercentage = (usedStorageInBytes / maxStorageLimit) * 100;

  // Refresh storage usage on mount
  useEffect(() => {
    refreshUser();
  }, []);

  // Fetch non-global user data (password status, connected provider)
  useEffect(() => {
    async function fetchAdditionalUserData() {
      if (!user) return;

      try {
        // Check password status from backend
        const passwordResponse = await fetch(`${BASE_URL}/user/has-password`, {
          credentials: "include",
        });

        let passwordStatus = false;
        if (passwordResponse.ok) {
          const passwordData = await passwordResponse.json();
          passwordStatus = passwordData.hasPassword;
        }

        setHasPassword(passwordStatus);

        // Detect connected provider
        const isGoogleImage = user.picture?.includes("googleusercontent.com");
        const isGithubImage = user.picture?.includes("githubusercontent.com") || user.picture?.includes("avatars.github");

        if (!passwordStatus && user.picture) {
          if (user.email.includes("@gmail.com") || user.email.includes("@googlemail.com") || isGoogleImage) {
            setConnectedProvider("google");
          } else if (user.email.includes("@users.noreply.github.com") || user.email.includes("github") || isGithubImage) {
            setConnectedProvider("github");
          } else {
            setConnectedProvider("google");
          }
        } else if (user.picture) {
          if (user.email.includes("@gmail.com") || user.email.includes("@googlemail.com") || isGoogleImage) {
            setConnectedProvider("google");
          } else if (user.email.includes("@users.noreply.github.com") || user.email.includes("github") || isGithubImage) {
            setConnectedProvider("github");
          }
        }
      } catch (err) {
        console.error("Error fetching additional user data:", err);
        setError("Failed to load some settings");
      } finally {
        setLoading(false);
      }
    }

    fetchAdditionalUserData();
  }, [user?.email]); // Use email as dependency to avoid loops from refreshUser

  // Sync profile state when user data is available
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setTempName(user.name || "");
      setProfilePicture(user.picture || "");
    }
  }, [user]);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const response = await fetch(`${BASE_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: profileName,
          picture: profilePicture,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfileSuccess("Profile updated successfully!");
        refreshUser(); // Refresh global user state
        setTimeout(() => setProfileSuccess(""), 4000);
      } else {
        setProfileError(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setProfileError("Network error. Please try again.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Handle local file upload for profile picture
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Please select an image file.");
      setTimeout(() => setProfileError(""), 4000);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("File size exceeds 2MB limit.");
      setTimeout(() => setProfileError(""), 4000);
      return;
    }

    setUpdatingProfile(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      // 1. Get signed URL
      const res = await fetch(`${BASE_URL}/user/profile/picture-upload-url?contentType=${file.type}&filename=${file.name}`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, key } = await res.json();

      // 2. Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });
      if (!uploadRes.ok) throw new Error("Upload to storage failed");

      // 3. Update profile with the new S3 key
      const updateRes = await fetch(`${BASE_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          picture: key,
        }),
      });

      const data = await updateRes.json();

      if (updateRes.ok) {
        setProfileSuccess("Profile picture updated successfully!");
        refreshUser(); // Refresh global user state
        setTimeout(() => setProfileSuccess(""), 4000);
      } else {
        setProfileError(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile picture upload error:", err);
      setProfileError("Network error. Please try again.");
    } finally {
      setUpdatingProfile(false);
      // Reset input
      e.target.value = "";
    }
  };

  // Handle inline name edit
  const handleSaveName = async () => {
    setUpdatingProfile(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const response = await fetch(`${BASE_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: tempName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfileName(tempName);
        setIsEditingName(false);
        setProfileSuccess("Name updated successfully!");
        refreshUser();
        setTimeout(() => setProfileSuccess(""), 4000);
      } else {
        setProfileError(data.error || "Failed to update name");
      }
    } catch (err) {
      console.error("Name update error:", err);
      setProfileError("Network error. Please try again.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setTempName(profileName);
    setIsEditingName(false);
  };

  // Handle password change/set
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setSuccess("");

    // Validation
    if (newPassword.length < 4) {
      setPasswordError("Password must be at least 4 characters long");
      setTimeout(() => setPasswordError(""), 3000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      setTimeout(() => setPasswordError(""), 3000);
      return;
    }

    // Store data and show custom confirmation modal
    const dataToStore = { currentPassword, newPassword };
    
    setPendingPasswordData(dataToStore);
    setShowConfirmModal(true);
  };

  // Actual password change after confirmation
  const confirmPasswordChange = async () => {
    setShowConfirmModal(false);
    
    // Validate pending data exists
    if (!pendingPasswordData) {
      setPasswordError("Error: No password data found. Please try again.");
      setTimeout(() => setPasswordError(""), 3000);
      return;
    }
    
    setSubmitting(true);

    try {
      const endpoint = hasPassword ? "/user/change-password" : "/user/set-password";
      const body = hasPassword
        ? { currentPassword: pendingPasswordData.currentPassword, newPassword: pendingPasswordData.newPassword }
        : { newPassword: pendingPasswordData.newPassword };

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      // Handle rate limiting (429) - returns plain text, not JSON
      if (response.status === 429) {
        const errorText = await response.text();
        setPasswordError(errorText || "Too many password change attempts. Please try again later.");
        setTimeout(() => setPasswordError(""), 5000);
        setSubmitting(false);
        return;
      }
      
      const data = await response.json();

      if (response.ok) {
        const successMessage = hasPassword
          ? "Password changed successfully!"
          : "Password set successfully! You can now login with email and password.";
        
        setSuccess(successMessage);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setHasPassword(true);
        
        // Store password status in localStorage
        localStorage.setItem(`hasPassword_${user?.email}`, 'true');
        
        // Show custom success notification
        setShowSuccessNotification(true);
        
        // Auto-dismiss after 4 seconds
        setTimeout(() => {
          setShowSuccessNotification(false);
          setSuccess("");
        }, 4000);
      } else {
        // Show the actual error from backend
        const errorMessage = data.message || data.error || "Error updating password";
        setPasswordError(errorMessage);
        // Auto-dismiss after 3 seconds
        setTimeout(() => setPasswordError(""), 3000);
      }
    } catch (err) {
      console.error("Error updating password:", err);
      setPasswordError(`Network error: ${err.message}. Please try again.`);
      // Auto-dismiss after 3 seconds
      setTimeout(() => setPasswordError(""), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  // Logout from current device
  const handleLogout = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/logout`, {
        method: "POST",
        credentials: "include",
      });
      // If success (204) OR Unauthorized (401 - means already logged out)
      if (response.ok || response.status === 401) {
        navigate("/login");
      } else {
        setError("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      setError("Logout failed");
    }
  };

  // Logout from all devices
  const handleLogoutAll = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/logout-all`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        navigate("/login");
      } else {
        setError("Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      setError("Logout failed");
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "storage", label: "Storage", icon: HardDrive },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Responsive */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button 
                onClick={() => navigate("/")}
                className="p-2.5 rounded-xl hover:bg-secondary hover:text-primary transition-all duration-300 flex-shrink-0 group ring-1 ring-border border-transparent hover:border-primary/20"
              >
                <ArrowLeft className="w-5 h-5 text-muted group-hover:text-primary" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-text-main truncate tracking-tight">Settings</h1>
                <p className="text-xs sm:text-sm text-muted mt-0.5 hidden sm:block font-medium">
                  Personalize your CloudVault experience
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2.5 text-sm font-bold text-muted hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 flex items-center gap-2 flex-shrink-0 border-2 border-transparent hover:border-red-100"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Mobile/Tablet Navigation - Dropdown */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-card border-2 border-border hover:border-primary/30 transition-all duration-300 shadow-sm"
            >
              <span className="font-bold text-text-main">
                {tabs.find((t) => t.id === activeTab)?.label || "Select Section"}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-muted transition-transform duration-300 ${mobileMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {mobileMenuOpen && (
              <div className="mt-3 space-y-2 bg-card rounded-2xl border-2 border-border p-3 shadow-lg animate-fadeIn">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 text-sm font-bold ${
                        activeTab === tab.id
                          ? "bg-secondary text-primary border-primary/20"
                          : "text-muted hover:bg-secondary hover:text-text-main"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : 'text-muted'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Desktop Sidebar - Navigation tabs */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="space-y-3 sticky top-28">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 text-[15px] font-bold border-2 ${
                      isActive
                        ? "bg-secondary text-primary border-primary/20 shadow-sm shadow-primary/5"
                        : "text-muted border-transparent hover:bg-white hover:border-border hover:shadow-sm"
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              {/* Quick Stats */}
              <div className="mt-10 pt-10 border-t-2 border-border/50">
                <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mb-6 px-1">Account Info</p>
                <div className="space-y-6 px-1">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-muted/60">Account Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                      <p className="text-sm font-bold text-text-main">Verified Account</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold text-muted/60">Member Since</p>
                    <p className="text-sm font-bold text-text-main mt-1">
                      {user?.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        : "January 2024"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Responsive */}
          <div className="col-span-1 lg:col-span-3 min-h-[600px]">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6 sm:space-y-8 animate-fadeIn">
                {/* Error/Success Messages */}
                {profileError && (
                  <Alert variant="destructive" withIcon dismissible onDismiss={() => setProfileError("")} className="bg-white border-red-100 shadow-sm rounded-2xl">
                    <AlertDescription className="font-bold">{profileError}</AlertDescription>
                  </Alert>
                )}
                {profileSuccess && (
                  <Alert variant="success" withIcon dismissible onDismiss={() => setProfileSuccess("")} className="bg-white border-green-100 shadow-sm rounded-2xl">
                    <AlertDescription className="font-bold">{profileSuccess}</AlertDescription>
                  </Alert>
                )}

                {/* Profile Card - Responsive */}
                <div className="bg-card rounded-3xl border-2 border-border p-6 sm:p-10 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0"></div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12 relative z-10">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="relative group cursor-pointer" onClick={() => document.getElementById('profileInput').click()}>
                        <div className="w-24 sm:w-32 h-24 sm:h-32 bg-secondary rounded-3xl flex items-center justify-center text-primary text-3xl sm:text-4xl font-black shadow-inner ring-4 ring-white transition-all duration-500 group-hover:ring-primary/20 group-hover:scale-105 overflow-hidden">
                          {profilePicture ? (
                            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          ) : (
                            <span className="opacity-40">{profileName?.[0]?.toUpperCase() || "U"}</span>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-primary p-2.5 rounded-2xl border-4 border-white shadow-lg transition-transform group-hover:scale-110">
                          <Camera className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <button 
                        onClick={() => document.getElementById('profileInput').click()}
                        disabled={updatingProfile}
                        className="mt-6 px-5 py-2.5 text-xs sm:text-sm font-bold text-primary hover:bg-primary hover:text-white rounded-xl transition-all duration-300 flex items-center gap-2 group border border-primary/20 hover:border-primary shadow-sm active:scale-95"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Update Photo</span>
                      </button>
                      <input 
                        id="profileInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>

                    {/* Name & Info Section */}
                    <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                      <div className="mb-6 sm:mb-8">
                        {!isEditingName ? (
                          <div className="flex items-center justify-center sm:justify-start gap-3 group">
                            <h2 className="text-2xl sm:text-4xl font-black text-text-main tracking-tight">{profileName}</h2>
                            <button
                              onClick={() => setIsEditingName(true)}
                              className="p-2 opacity-0 group-hover:opacity-100 hover:bg-secondary rounded-xl transition-all duration-300 transform hover:scale-110"
                            >
                              <Edit3 className="w-5 h-5 text-primary" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 animate-fadeIn">
                            <input
                              type="text"
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 border-2 border-primary rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-text-main text-lg sm:text-xl bg-white shadow-inner"
                              autoFocus
                              disabled={updatingProfile}
                            />
                            <button
                              onClick={handleSaveName}
                              disabled={updatingProfile}
                              className="p-3 bg-primary text-white rounded-2xl hover:bg-button-hover transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-primary/20 active:scale-95"
                            >
                              {updatingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={updatingProfile}
                              className="p-3 bg-background text-muted rounded-2xl hover:bg-secondary hover:text-text-main transition-all duration-300 disabled:opacity-50 border-2 border-border"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                        <div className="p-4 rounded-2xl bg-white/50 border border-border/50">
                          <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1 opacity-60">Email Address</p>
                          <p className="text-sm sm:text-base text-text-main font-bold truncate">{user?.email}</p>
                        </div>
                        {connectedProvider && (
                          <div className="p-4 rounded-2xl bg-white/50 border border-border/50">
                            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1 opacity-60">Connected Account</p>
                            <div className="flex items-center gap-2 mt-1">
                              {connectedProvider === "google" ? (
                                <div className="w-6 h-6 flex items-center justify-center bg-red-50 rounded-lg"><FaGoogle className="w-3.5 h-3.5 text-red-500" /></div>
                              ) : (
                                <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-lg"><FaGithub className="w-3.5 h-3.5 text-gray-900" /></div>
                              )}
                              <span className="text-sm sm:text-base text-text-main font-bold capitalize">{connectedProvider}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Information Form - Responsive */}
                <div className="bg-card rounded-3xl border-2 border-border p-6 sm:p-10 shadow-sm hover:shadow-lg transition-all duration-500">
                  <div className="flex items-center gap-4 mb-8 sm:mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
                      Profile Information
                    </h3>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-6 sm:space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                      <div className="space-y-3">
                        <label className="block text-xs sm:text-sm font-black text-text-main uppercase tracking-widest ml-1 opacity-70">Full Name</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full px-5 py-4 bg-background border-2 border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 text-text-main font-bold text-sm sm:text-base placeholder:text-muted/40"
                          placeholder="Your full name"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-xs sm:text-sm font-black text-text-main uppercase tracking-widest ml-1 opacity-70">
                          Email Address
                        </label>
                        <div className="relative group">
                          <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full px-5 py-4 bg-secondary/50 border-2 border-border rounded-2xl text-muted font-bold cursor-not-allowed text-sm sm:text-base opacity-80"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-white border border-border rounded-lg text-[10px] font-black text-muted/60 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">Locked</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-xs sm:text-sm font-black text-text-main uppercase tracking-widest ml-1 opacity-70">Bio</label>
                      <textarea
                        className="w-full px-5 py-4 bg-background border-2 border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 text-text-main font-bold text-sm sm:text-base placeholder:text-muted/40 min-h-[120px]"
                        placeholder="Share a little bit about yourself..."
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <button 
                        type="submit"
                        disabled={updatingProfile}
                        className="w-full sm:w-auto px-8 sm:px-12 py-4 bg-primary text-white rounded-2xl hover:bg-button-hover font-black transition-all duration-300 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-primary/20 hover:-translate-y-1 active:translate-y-0"
                      >
                        {updatingProfile ? "Updating Account..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Security Tab - Responsive */}
            {activeTab === "security" && (
              <div className="space-y-6 sm:space-y-8 animate-fadeIn">
                <div className="bg-card rounded-3xl border-2 border-border p-6 sm:p-10 shadow-sm hover:shadow-lg transition-all duration-500">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8 sm:mb-12">
                    <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center shrink-0 shadow-sm border border-primary/10">
                      <Shield className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">
                        {hasPassword ? "Account Password" : "Set Secure Password"}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted mt-1 font-bold">
                        {hasPassword 
                          ? "Update your login credentials regularly to maintain peak account security"
                          : "Establish a unique password to enable multiple secure login methods"}
                      </p>
                    </div>
                  </div>

                  {/* Password-specific error message */}
                  {passwordError && (
                    <Alert variant="destructive" withIcon className="mb-8 bg-white border-red-100 shadow-sm rounded-2xl">
                      <AlertDescription className="font-bold">{passwordError}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handlePasswordSubmit} className="space-y-6 sm:space-y-8 lg:max-w-2xl">
                    {hasPassword && (
                      <div className="space-y-3">
                        <label className="block text-xs sm:text-sm font-black text-text-main uppercase tracking-widest ml-1 opacity-70">
                          Current Password
                        </label>
                        <div className="relative group">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-background border-2 border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-bold text-text-main text-sm sm:text-base pr-14"
                            required
                            placeholder="••••••••"
                            disabled={submitting}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-muted hover:text-primary hover:bg-secondary rounded-xl transition-all"
                          >
                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-6">
                      <PasswordStrengthIndicator
                        value={newPassword}
                        onChange={(value) => setNewPassword(value)}
                        label="New Password"
                        placeholder="Choose a strong password"
                        showScore={true}
                        showScoreNumber={false}
                        showVisibilityToggle={true}
                        inputProps={{
                          required: true,
                          minLength: 4,
                          disabled: submitting,
                          className: "w-full px-5 py-4 bg-background border-2 border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-bold text-text-main text-sm sm:text-base"
                        }}
                      />

                      <div className="pt-2">
                        <PasswordStrengthIndicator
                          value={confirmPassword}
                          compareValue={newPassword}
                          onChange={(value) => setConfirmPassword(value)}
                          label="Confirm New Password"
                          placeholder="Re-enter your new password"
                          showScore={true}
                          showScoreNumber={false}
                          showVisibilityToggle={true}
                          inputProps={{
                            required: true,
                            minLength: 4,
                            disabled: submitting,
                            className: "w-full px-5 py-4 bg-background border-2 border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 font-bold text-text-main text-sm sm:text-base"
                          }}
                        />
                      </div>
                    </div>

                    <div className="pt-6 sm:pt-8 border-t border-border/50">
                      <button 
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto px-10 sm:px-14 py-4 bg-primary text-white rounded-2xl hover:bg-button-hover font-black transition-all duration-300 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-primary/20 hover:-translate-y-1 active:translate-y-0"
                      >
                        {submitting
                          ? hasPassword
                            ? "Updating Security..."
                            : "Setting Password..."
                          : hasPassword
                          ? "Update Password"
                          : "Save Password"}
                      </button>
                    </div>
                  </form>
                </div>


                {/* Logout Options */}
                <div className="bg-card rounded-3xl border-2 border-border p-6 sm:p-10 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-red-50/30 rounded-bl-full -z-0"></div>
                  <h3 className="text-xl sm:text-2xl font-black text-text-main tracking-tight mb-8 sm:mb-10 relative z-10">Access & Session Control</h3>
                  <div className="grid md:grid-cols-2 gap-6 sm:gap-10 relative z-10">
                    {/* Current Device Logout */}
                    <div className="border-2 border-border rounded-2xl p-6 bg-white hover:border-orange-200 transition-all group">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <LogOut className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-text-main text-sm">Current Session</h4>
                          <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">Exit this device only</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-bold text-sm shadow-sm active:scale-95"
                      >
                        Sign Out
                      </button>
                    </div>

                    {/* All Devices Logout */}
                    <div className="border-2 border-border rounded-2xl p-6 bg-white hover:border-red-200 transition-all group">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <LogOut className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-text-main text-sm">Global Logout</h4>
                          <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">Terminate all sessions</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogoutAll}
                        className="w-full px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-bold text-sm shadow-sm active:scale-95"
                      >
                        Sign Out All Devices
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Storage Tab - Responsive */}
            {activeTab === "storage" && (
              <div className="space-y-6 sm:space-y-8 animate-fadeIn">
                <div className="bg-card rounded-3xl border-2 border-border p-6 sm:p-10 shadow-sm hover:shadow-lg transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -z-0"></div>
                  
                  <div className="flex items-center gap-4 mb-10 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                      <Database className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-text-main tracking-tight">Cloud Storage Plan</h3>
                  </div>

                  <div className="space-y-8 relative z-10">
                    <div>
                      <div className="flex justify-between items-end mb-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">Occupied Space</span>
                          <span className="text-3xl sm:text-5xl font-black text-text-main tracking-tighter">{formatStorage(usedStorageInBytes)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-muted">Total Quota</span>
                          <p className="text-lg font-bold text-text-main">{formatStorage(maxStorageLimit)}</p>
                        </div>
                      </div>
                      
                      <div className="relative w-full bg-secondary rounded-full h-4 overflow-hidden shadow-inner ring-1 ring-border/50">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                            usagePercentage > 90 
                              ? "bg-red-500" 
                              : usagePercentage > 75 
                              ? "bg-orange-500" 
                              : "bg-primary"
                          }`}
                          style={{ 
                            width: usedStorageInBytes === 0 
                              ? "0.5%" 
                              : `${Math.max(usagePercentage, 1)}%` 
                          }}
                        >
                          <div className="w-full h-full bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-2">
                           <div className="w-3 h-3 rounded-full bg-secondary border border-border"></div>
                           <span className="text-xs font-bold text-muted">
                            {formatStorage(maxStorageLimit - usedStorageInBytes)} Available
                          </span>
                        </div>
                        <span className={`text-sm font-black px-3 py-1 rounded-lg ${
                          usagePercentage > 90 
                            ? "text-red-500 bg-red-50" 
                            : usagePercentage > 75 
                            ? "text-orange-500 bg-orange-50" 
                            : "text-primary bg-secondary"
                        }`}>
                          {usedStorageInBytes > 0 && usagePercentage < 0.1 
                            ? "< 0.1%" 
                            : `${usagePercentage.toFixed(1)}% Used`}
                        </span>
                      </div>
                    </div>

                    <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      usagePercentage > 90 
                        ? "bg-red-50/50 border-red-100" 
                        : usagePercentage > 75 
                        ? "bg-orange-50/50 border-orange-100" 
                        : "bg-secondary/30 border-primary/10"
                    }`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          usagePercentage > 90 ? "bg-red-100 text-red-600" : usagePercentage > 75 ? "bg-orange-100 text-orange-600" : "bg-white text-primary shadow-sm"
                        }`}>
                          <Info className="w-5 h-5" />
                        </div>
                        <p className={`text-sm font-bold leading-relaxed ${
                          usagePercentage > 90 ? "text-red-900" : usagePercentage > 75 ? "text-orange-900" : "text-text-main"
                        }`}>
                          {usagePercentage > 90 
                            ? "Storage Critical: You have nearly exhausted your allocated space. Access may become restricted soon unless you upgrade or free up space." 
                            : usagePercentage > 75 
                            ? "Storage Warning: You're approaching your limit. Consider reviewing your files or migrating to a larger plan." 
                            : "Storage Healthy: You have plenty of room for more memories and documents! Your cloud experience is running smoothly."}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button 
                        onClick={() => navigate("/plans")}
                        className="w-full px-8 py-4 bg-primary text-white rounded-2xl hover:bg-button-hover font-black transition-all duration-300 text-base shadow-lg shadow-primary/20 hover:-translate-y-1 active:translate-y-0"
                      >
                        Upgrade Storage Plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-text-main/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-card rounded-[32px] shadow-strong max-w-md w-full p-8 sm:p-10 animate-scaleIn border border-border">
            <div className="flex flex-col items-center text-center gap-6 mb-8">
              <div className="w-20 h-20 bg-secondary rounded-[24px] flex items-center justify-center shadow-inner relative">
                <div className="absolute inset-0 bg-primary/5 animate-ping rounded-[24px]"></div>
                <ShieldCheck className="w-10 h-10 text-primary relative z-10" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-text-main tracking-tight mb-2">
                  {hasPassword ? "Update Security Key?" : "Secure Your Account?"}
                </h3>
                <p className="text-sm font-bold text-muted leading-relaxed">
                  {hasPassword 
                    ? "Updating your password will invalidate your old one. You will need to use your new credentials for all future sign-ins." 
                    : "Establish a secure password to unlock additional login methods and enhance your workspace's integrity."}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-4 text-text-main bg-background border-2 border-border rounded-2xl hover:bg-secondary hover:border-primary/20 transition-all font-black text-sm active:scale-95"
              >
                No, Go Back
              </button>
              <button
                onClick={confirmPasswordChange}
                className="flex-1 px-6 py-4 text-white bg-primary rounded-2xl hover:bg-button-hover transition-all font-black text-sm shadow-md shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                Yes, Secure It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-12 right-6 z-[10000] max-w-sm w-full md:w-[400px] animate-slideIn">
          <div className="bg-white/95 backdrop-blur-xl shadow-strong border-2 border-green-100 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-base font-black text-text-main">Success!</h4>
                <button onClick={() => setShowSuccessNotification(false)} className="text-muted hover:text-text-main p-1"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-sm font-bold text-muted leading-snug">{success}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserSettings;
