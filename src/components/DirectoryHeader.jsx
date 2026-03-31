import { useNavigate } from "react-router-dom";
import { Cloud, Crown, Share2, Users, Settings } from "lucide-react";

export const BASE_URL = import.meta.env.VITE_BASE_URL;

function DirectoryHeader({
  directoryName,
  path,
  disabled = false,
  onStorageUpdate,
  userName = "Guest User",
  userEmail = "guest@example.com",
  userPicture = "",
  userRole = "User",
  subscriptionId = null,
  subscriptionStatus = "active",
}) {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/settings");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo */}
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-primary transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20">
              <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-text-main">CloudVault</span>
              {/* Hide subtitle on very small screens to save space */}
              <p className="text-[10px] sm:text-xs text-muted leading-tight hidden xs:block">Your Secure Storage</p>
            </div>
          </div>

          {/* Right side: Navigation Links + Profile */}
          <div className="flex items-center gap-1 sm:gap-4 min-w-0">
            {/* Subscription Status Badge — hide on very small screens */}
            {subscriptionStatus?.toLowerCase() === "paused" && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white rounded-full animate-pulse shadow-md border border-amber-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wide">Paused</span>
              </div>
            )}

            {/* Action Buttons Group */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Upgrade/Subscription Link */}
              <button
                onClick={() => navigate(subscriptionId ? "/subscription" : "/plans")}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg transition-all duration-200 hover:-translate-y-0.5 font-semibold text-sm ${
                  subscriptionId 
                    ? "bg-button text-white shadow-sm hover:bg-button-hover hover:shadow-md" 
                    : "bg-white text-primary border border-border hover:bg-secondary hover:border-primary/30"
                }`}
              >
                <Crown className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">
                  {subscriptionId ? "Subscription" : "Upgrade"}
                </span>
              </button>

              {/* Share Link */}
              <button
                onClick={() => navigate("/share")}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg transition-all duration-200 bg-white text-text-main border border-border hover:bg-secondary hover:border-primary/30 hover:-translate-y-0.5 font-semibold text-sm"
              >
                <Share2 className="w-4 h-4 flex-shrink-0" />
                <span className="hidden md:inline">Share</span>
              </button>

              {/* Users Link - Only for Owner/Admin/Manager */}
              {userRole !== "User" && (
                <button
                  onClick={() => navigate("/users")}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg transition-all duration-200 bg-white text-text-main border border-border hover:bg-secondary hover:border-primary/30 hover:-translate-y-0.5 font-semibold text-sm"
                >
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden md:inline">Users</span>
                </button>
              )}
            </div>

            {/* Divider — hidden on mobile */}
            <div className="hidden sm:block h-8 w-px bg-border mx-1"></div>

            {/* Profile Section — flex-shrink-0 so it NEVER gets hidden */}
            <div
              onClick={handleProfileClick}
              className="flex items-center gap-2 cursor-pointer p-1.5 sm:p-2 rounded-xl transition-all duration-200 flex-shrink-0 hover:bg-secondary group"
            >
              {/* Name + email — hidden on mobile */}
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-text-main leading-none mb-0.5 group-hover:text-primary transition-colors">
                  {userName}
                </div>
                <div className="text-xs text-muted leading-none">{userEmail}</div>
              </div>
              {/* Avatar — always visible */}
              {userPicture ? (
                <div className="relative">
                  <img
                    src={userPicture}
                    alt={userName}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white ring-1 ring-border group-hover:ring-primary/30 transition-all"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent border-2 border-white rounded-full"></div>
                </div>
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold border-2 border-secondary bg-white text-primary group-hover:border-primary/30 transition-all">
                  <span className="text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DirectoryHeader;
