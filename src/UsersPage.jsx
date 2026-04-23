import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import DirectoryHeader, { BASE_URL } from "./components/DirectoryHeader";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  Trash2,
  Pencil,
  Eye,
  LogOut,
  RotateCcw,
  AlertTriangle,
  File,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Download,
  Zap,
  Pause,
  Play,
  RefreshCw,
  MoreVertical,
  Mail,
  User,
  Shield,
  Search,
  Loader2,
  ShieldCheck,
  Info,
  X,
  Lock,
  Clock,
  ChevronRight,
  UserCheck,
  UserPlus,
  ArrowRight
} from "lucide-react";

export default function UsersPage() {
  const navigate = useNavigate();

  // --- State ---
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser, isAuthenticating } = useAuth();

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showHardDeleteConfirm, setShowHardDeleteConfirm] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  
  // Toast notifications
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 4000);
  };

  // Selection
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [processingAction, setProcessingAction] = useState(null);

  // --- Effects ---
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const [usersResponse, permResponse, meResponse] = await Promise.all([
        fetch(`${BASE_URL}/users`, { credentials: "include" }),
        fetch(`${BASE_URL}/users/permission`, { credentials: "include" }).catch(err => ({ ok: false })),
        fetch(`${BASE_URL}/user`, { credentials: "include" }).catch(err => ({ ok: false }))
      ]);

      if (usersResponse.status === 403) { navigate("/"); return; }
      if (usersResponse.status === 401) { navigate("/login"); return; }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        
        let permissionData = { users: [] };
        if (permResponse.ok) permissionData = await permResponse.json();

        let myData = null;
        if (meResponse.ok) myData = await meResponse.json();
        
        const roleMap = {};
        if (permissionData.users && Array.isArray(permissionData.users)) {
          permissionData.users.forEach(u => {
            roleMap[u._id || u.id] = u.role;
            roleMap[u.email] = u.role;
          });
        }

        const normalized = usersData.map((u) => {
          const isMe = myData && (
            (myData.email && u.email === myData.email) || 
            (myData._id && u._id && u._id === myData._id) || 
            (myData.id && u.id && u.id === myData.id)
          );

          if (isMe) return { ...u, role: myData.role, isLoggedIn: true };

          const role = roleMap[u._id || u.id] || roleMap[u.email] || u.role || "User";
          return {
            ...u,
            role: role,
            isLoggedIn: u.isLoggedIn === true || u.status === "online" || u.active === true,
          };
        });

        setUsers(normalized);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  }

  // --- Helpers ---
  const getRoleColor = (role) => {
    switch (role) {
      case "Owner": return "bg-rose-50 text-rose-600 border border-rose-100";
      case "Admin": return "bg-[#D1FAF5] text-[#2D8B8B] border border-[#2D8B8B]/20";
      case "Manager": return "bg-indigo-50 text-indigo-600 border border-indigo-100";
      default: return "bg-[#F0F2F5] text-[#718096] border border-[#E2E8F0]";
    }
  };

  const getStatusColor = (isLoggedIn, isDeleted) => {
    if (isDeleted) return "bg-red-50 text-red-600 border border-red-100";
    if (isLoggedIn) return "bg-emerald-50 text-[#22C55E] border border-[#22C55E]/20";
    return "bg-[#F0F2F5] text-[#718096] border border-[#E2E8F0]";
  };

  const getRolePriority = (role) => {
    const priorities = { Owner: 1, Admin: 2, Manager: 3, User: 4 };
    return priorities[role] || 5;
  };

  const canChangeRole = (targetUser) => {
    if (currentUser.email === targetUser.email) return false;
    if (currentUser.role === "Owner") return true;
    const currentPriority = getRolePriority(currentUser.role);
    const targetPriority = getRolePriority(targetUser.role);
    return currentPriority <= targetPriority;
  };

  const getAvailableRolesForUser = (targetUserRole) => {
    const role = currentUser.role;
    if (role === "Owner") {
      return targetUserRole === "Owner" ? ["Owner"] : ["Admin", "Manager", "User"];
    } else if (role === "Admin") {
      return ["Admin", "Manager", "User"];
    } else if (role === "Manager") {
      return ["Manager", "User"];
    }
    return [];
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // --- Handlers ---
  const handleViewClick = (user) => {
    navigate(`/users/${user._id || user.id}/files`, { state: { user, currentUser } });
  };
  
  const handleRoleChangeClick = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const confirmRoleChange = async () => {
    if (!selectedUser || !newRole) return;
    setProcessingAction('roleChange');
    try {
      const response = await fetch(`${BASE_URL}/users/${selectedUser._id || selectedUser.id}/role`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) {
        setShowRoleModal(false);
        showToast("Role updated successfully", "success");
        fetchUsers();
      } else {
        const err = await response.json();
        showToast(err.error || "Failed to update role", "error");
      }
    } catch (err) {
      console.error("Role change error:", err);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleLogoutClick = (user) => {
    setSelectedUser(user);
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    if (!selectedUser) return;
    setProcessingAction('logout');
    try {
      const response = await fetch(`${BASE_URL}/users/${selectedUser.id}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setShowLogoutModal(false);
        showToast("User logged out successfully", "info");
        fetchUsers();
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleSoftDelete = async () => {
    if (!selectedUser) return;
    setProcessingAction('delete');
    try {
      const response = await fetch(`${BASE_URL}/users/${selectedUser.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setShowDeleteModal(false);
        showToast("User deleted successfully", "info");
        fetchUsers();
      }
    } catch (err) {
      console.error("Soft delete error:", err);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleHardDelete = async () => {
    if (!selectedUser) return;
    setProcessingAction('hardDelete');
    try {
      const response = await fetch(`${BASE_URL}/users/${selectedUser.id}/hard`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setShowHardDeleteConfirm(false);
        showToast("User permanently deleted", "info");
        fetchUsers();
      }
    } catch (err) {
      console.error("Hard delete error:", err);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRecoverClick = (user) => {
    setSelectedUser(user);
    setShowRecoverModal(true);
  };

  const confirmRecover = async () => {
    if (!selectedUser) return;
    setProcessingAction('recover');
    try {
      const response = await fetch(`${BASE_URL}/users/${selectedUser.id}/recover`, {
        method: "PUT",
        credentials: "include",
      });
      if (response.ok) {
        setShowRecoverModal(false);
        showToast("User restored successfully", "success");
        fetchUsers();
      }
    } catch (err) {
      console.error("Recover error:", err);
    } finally {
      setProcessingAction(null);
    }
  };

  const handlePauseSubscription = (user) => {
    if (!user.razorpaySubscriptionId) {
      showToast("No active subscription found", "error");
      return;
    }
    setSelectedUser(user);
    setShowPauseModal(true);
  };

  const confirmPause = async () => {
    if (!selectedUser) return;
    setProcessingAction('pause');
    try {
      const response = await fetch(`${BASE_URL}/subscriptions/${selectedUser.razorpaySubscriptionId}/pause`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setShowPauseModal(false);
        showToast("Subscription paused", "success");
        fetchUsers();
      } else {
        const err = await response.json();
        showToast(err.message || "Failed to pause subscription", "error");
      }
    } catch (err) {
      console.error("Pause error:", err);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleResumeSubscription = (user) => {
    if (!user.razorpaySubscriptionId) {
      showToast("No active subscription found", "error");
      return;
    }
    setSelectedUser(user);
    setShowResumeModal(true);
  };

  const confirmResume = async () => {
    if (!selectedUser) return;
    setProcessingAction('resume');
    try {
      const response = await fetch(`${BASE_URL}/subscriptions/${selectedUser.razorpaySubscriptionId}/resume`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setShowResumeModal(false);
        showToast("Subscription resumed", "success");
        fetchUsers();
      } else {
        const err = await response.json();
        showToast(err.message || "Failed to resume subscription", "error");
      }
    } catch (err) {
      console.error("Resume error:", err);
    } finally {
      setProcessingAction(null);
    }
  };

  // --- Loading Check ---
  if (isAuthenticating || !currentUser) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#2D8B8B] animate-spin" />
        <p className="text-sm font-medium text-[#718096]">Loading users...</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    let roleMatch = false;
    if (currentUser.role === "Owner") roleMatch = true;
    else if (currentUser.role === "Admin") roleMatch = (u.role !== "Owner");
    else if (currentUser.role === "Manager") roleMatch = (u.role !== "Owner" && u.role !== "Admin");

    const searchMatch = !searchQuery || 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    return roleMatch && searchMatch;
  });

  const totalUsers = filteredUsers.length;
  const activeUsers = filteredUsers.filter((u) => !u.isDeleted).length;
  const deletedUsers = filteredUsers.filter((u) => u.isDeleted).length;
  const onlineUsers = filteredUsers.filter(u => u.isLoggedIn && !u.isDeleted).length;

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1A202C] font-sans">
      <DirectoryHeader
        directoryName="Users"
        userName={currentUser?.name || "Admin"}
        userEmail={currentUser?.email || ""}
        userPicture={currentUser?.picture}
        userRole={currentUser?.role}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20 space-y-8 animate-fadeIn">
        
        {/* Navigation & Identity */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E2E8F0] rounded-[10px] text-sm font-semibold text-[#1A202C] hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Users />} label="Total Users" value={totalUsers} color="text-indigo-600" bg="bg-indigo-50" />
          <StatCard icon={<CheckCircle />} label="Active Users" value={activeUsers} color="text-[#22C55E]" bg="bg-[#22C55E]/10" />
          <StatCard icon={<Zap />} label="Online Users" value={onlineUsers} color="text-[#2D8B8B]" bg="bg-[#D1FAF5]" />
          <StatCard icon={<Trash2 />} label="Deleted Users" value={deletedUsers} color="text-rose-600" bg="bg-rose-50" />
        </div>

        {/* Registry Table */}
        <div className="bg-white rounded-[16px] overflow-hidden shadow-sm border border-[#E2E8F0]">
          <div className="px-6 py-5 border-b border-[#E2E8F0] flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-[22px] font-bold text-[#1A202C]">User Management</h2>
              <p className="text-sm text-[#718096] mt-1">View and manage system users and roles.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0AEC0]" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-[280px] pl-10 pr-4 py-2.5 bg-[#F0F2F5] border border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B8B]/50 transition-all placeholder:text-[#718096] text-[#1A202C]"
                />
              </div>
              <button 
                onClick={() => !processingAction && fetchUsers()}
                className="px-5 py-2.5 bg-white border border-[#E2E8F0] rounded-[10px] hover:bg-gray-50 transition-colors text-sm font-semibold text-[#1A202C] flex items-center justify-center gap-2 shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 text-[#2D8B8B] ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-[#E2E8F0] text-[12px] font-semibold text-[#718096] uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Storage Usage</th>
                  <th className="px-6 py-4">Role & Status</th>
                  {currentUser.role === "Owner" && <th className="px-6 py-4">Subscription</th>}
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {isLoading ? (
                  <LoadingRow colSpan={currentUser.role === "Owner" ? 5 : 4} />
                ) : filteredUsers.length === 0 ? (
                  <EmptyRow colSpan={currentUser.role === "Owner" ? 5 : 4} query={searchQuery} />
                ) : (
                  filteredUsers.map((u) => (
                    <UserRow 
                      key={u._id || u.id}
                      user={u} 
                      currentUser={currentUser}
                      onView={handleViewClick}
                      onRoleChange={handleRoleChangeClick}
                      onLogout={handleLogoutClick}
                      onDelete={handleDeleteClick}
                      onRecover={handleRecoverClick}
                      onPause={handlePauseSubscription}
                      onResume={handleResumeSubscription}
                      getRoleColor={getRoleColor}
                      getStatusColor={getStatusColor}
                      formatBytes={formatBytes}
                      canChangeRole={canChangeRole}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals & Portal Overlays */}
      <Modals 
        selectedUser={selectedUser}
        showRoleModal={showRoleModal}
        setShowRoleModal={setShowRoleModal}
        newRole={newRole}
        setNewRole={setNewRole}
        confirmRoleChange={confirmRoleChange}
        availableRoles={selectedUser ? getAvailableRolesForUser(selectedUser.role) : []}
        
        showLogoutModal={showLogoutModal}
        setShowLogoutModal={setShowLogoutModal}
        confirmLogout={confirmLogout}
        
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleSoftDelete={handleSoftDelete}
        showHardDeleteConfirm={showHardDeleteConfirm}
        setShowHardDeleteConfirm={setShowHardDeleteConfirm}
        handleHardDelete={handleHardDelete}
        
        showRecoverModal={showRecoverModal}
        setShowRecoverModal={setShowRecoverModal}
        confirmRecover={confirmRecover}
        
        showPauseModal={showPauseModal}
        setShowPauseModal={setShowPauseModal}
        confirmPause={confirmPause}
        
        showResumeModal={showResumeModal}
        setShowResumeModal={setShowResumeModal}
        confirmResume={confirmResume}
        
        processingAction={processingAction}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[200] max-w-sm w-full shadow-lg rounded-[10px] bg-white border border-[#E2E8F0] p-4 flex items-start gap-3 animate-slideInRight">
          <div className={`mt-0.5 ${
            toast.type === 'error' ? 'text-rose-500' :
            toast.type === 'success' ? 'text-[#22C55E]' :
            'text-[#2D8B8B]'
          }`}>
            {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : 
             toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
             <Info className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1A202C]">Notification</p>
            <p className="text-sm text-[#718096] mt-0.5">{toast.message}</p>
          </div>
          <button onClick={() => setToast({ ...toast, show: false })} className="text-[#A0AEC0] hover:text-[#1A202C]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// --- Internal Components ---

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="bg-white rounded-[16px] p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
      <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center ${bg} ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-[#718096] mb-1">{label}</p>
        <p className="text-[26px] leading-[30px] font-bold text-[#1A202C]">{value}</p>
      </div>
    </div>
  );
}

function UserRow({ user, currentUser, onView, onRoleChange, onLogout, onDelete, onRecover, onPause, onResume, getRoleColor, getStatusColor, formatBytes, canChangeRole }) {
  const usagePercent = Math.min(100, Math.round(((user.usedStorageInBytes || 0) / (user.maxStorageLimit || 500 * 1024 * 1024)) * 100));

  return (
    <tr className="hover:bg-[#F0F2F5]/50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            {user.picture ? (
              <img src={user.picture} alt="" className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0] shadow-sm bg-[#F7FFFE]" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#4A5568] text-[15px] font-bold uppercase">
                {user.name.charAt(0)}
              </div>
            )}
            {user.isLoggedIn && !user.isDeleted && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#22C55E] border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <div className="font-semibold text-[15px] text-[#1A202C] truncate max-w-[180px]">{user.name}</div>
            <div className="text-[12px] text-[#718096] mt-0.5 truncate max-w-[180px]">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="w-40">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[13px] font-semibold text-[#1A202C]">{formatBytes(user.usedStorageInBytes || 0)}</span>
            <span className="text-[11px] font-medium text-[#718096]">{usagePercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                usagePercent > 90 ? 'bg-rose-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-[#2D8B8B]'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[#718096] mt-1.5">Capacity: {formatBytes(user.maxStorageLimit || 500 * 1024 * 1024)}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-2 items-start">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getRoleColor(user.role)}`}>
              {user.role}
            </span>
            {canChangeRole(user) && (
              <button onClick={() => onRoleChange(user)} className="p-1 text-[#A0AEC0] hover:text-[#2D8B8B] transition-colors rounded">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${getStatusColor(user.isLoggedIn, user.isDeleted)}`}>
            {user.isDeleted ? "Deleted" : user.isLoggedIn ? "Online" : "Offline"}
          </span>
        </div>
      </td>
      {currentUser.role === "Owner" && (
        <td className="px-6 py-4">
           {user.razorpaySubscriptionId ? (
             <div className="space-y-1.5">
               {user.subscriptionStatus === "paused" ? (
                  <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded text-[11px] font-semibold w-fit border border-amber-100">
                    <Pause className="w-3 h-3" />
                    <span>Paused</span>
                  </div>
               ) : (
                  <div className="flex items-center gap-1.5 text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded text-[11px] font-semibold w-fit border border-[#22C55E]/20">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Active Plan</span>
                  </div>
               )}
               <div className="flex gap-3">
                  {user.subscriptionStatus === "paused" ? (
                    <button onClick={() => onResume(user)} className="text-[11px] font-semibold text-[#2D8B8B] hover:underline">Resume</button>
                  ) : (
                    <button onClick={() => onPause(user)} className="text-[11px] font-semibold text-amber-600 hover:underline">Pause Plan</button>
                  )}
               </div>
             </div>
           ) : (
             <span className="text-[12px] text-[#718096] font-medium">Free Plan</span>
           )}
        </td>
      )}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           {!user.isDeleted && (
             <button onClick={() => onView(user)} className="p-2 text-[#718096] hover:text-[#2D8B8B] hover:bg-white rounded-[8px] transition-colors bg-[#F0F2F5] border border-transparent shadow-sm" title="View Files">
               <Eye className="w-3.5 h-3.5" />
             </button>
           )}
           {user.isLoggedIn && !user.isDeleted && (
             <button onClick={() => onLogout(user)} className="p-2 text-[#718096] hover:text-amber-600 hover:bg-white rounded-[8px] transition-colors bg-[#F0F2F5] border border-transparent shadow-sm" title="Logout User">
               <LogOut className="w-3.5 h-3.5" />
             </button>
           )}
           {!user.isDeleted ? (
             <button onClick={() => onDelete(user)} className="p-2 text-[#718096] hover:text-rose-600 hover:bg-white rounded-[8px] transition-colors bg-[#F0F2F5] border border-transparent shadow-sm" title="Delete User">
               <Trash2 className="w-3.5 h-3.5" />
             </button>
           ) : (
             <button onClick={() => onRecover(user)} className="p-2 text-[#22C55E] bg-[#22C55E]/10 hover:bg-[#22C55E]/20 rounded-[8px] transition-colors shadow-sm" title="Restore User">
               <RotateCcw className="w-3.5 h-3.5" />
             </button>
           )}
        </div>
      </td>
    </tr>
  );
}

function LoadingRow({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#2D8B8B] animate-spin" />
          <p className="text-sm font-medium text-[#718096]">Loading users...</p>
        </div>
      </td>
    </tr>
  );
}

function EmptyRow({ colSpan, query }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-[#F0F2F5] rounded-full flex items-center justify-center mb-4">
             <Search className="w-8 h-8 text-[#A0AEC0]" />
          </div>
          <h3 className="text-[15px] font-semibold text-[#1A202C] mb-1">No users found</h3>
          <p className="text-sm text-[#718096]">
            No users matching "{query}" exist.
          </p>
        </div>
      </td>
    </tr>
  );
}

function Modals({ 
  selectedUser, 
  showRoleModal, setShowRoleModal, newRole, setNewRole, confirmRoleChange, availableRoles,
  showLogoutModal, setShowLogoutModal, confirmLogout,
  showDeleteModal, setShowDeleteModal, handleSoftDelete, showHardDeleteConfirm, setShowHardDeleteConfirm, handleHardDelete,
  showRecoverModal, setShowRecoverModal, confirmRecover,
  showPauseModal, setShowPauseModal, confirmPause,
  showResumeModal, setShowResumeModal, confirmResume,
  processingAction
}) {
  if (!selectedUser) return null;

  const ModalWrapper = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-[#1A202C]/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-[16px] shadow-xl border border-[#E2E8F0] w-full max-w-sm overflow-hidden animate-scaleIn">
        {children}
      </div>
    </div>
  );

  return (
    <>
      {/* Role Modal */}
      {showRoleModal && (
        <ModalWrapper onClose={() => setShowRoleModal(false)}>
           <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#1A202C]">Change Role</h3>
                  <button onClick={() => setShowRoleModal(false)} className="text-[#A0AEC0] hover:text-[#1A202C] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-[#718096] mb-6">Select a new role for <span className="font-semibold text-[#1A202C]">{selectedUser.name}</span>.</p>
              
              <div className="space-y-3 mb-6">
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setNewRole(role)}
                    className={`w-full p-3 rounded-[10px] flex items-center justify-between border transition-all ${
                      newRole === role ? 'bg-[#F7FFFE] border-[#2D8B8B] ring-1 ring-[#2D8B8B]' : 'bg-white border-[#E2E8F0] hover:border-[#A8D8D8]'
                    }`}
                  >
                    <span className={`text-sm font-semibold ${newRole === role ? 'text-[#2D8B8B]' : 'text-[#4A5568]'}`}>{role}</span>
                    {newRole === role && <CheckCircle className="w-4 h-4 text-[#2D8B8B]" />}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={confirmRoleChange} disabled={processingAction === 'roleChange'} className="w-full py-2.5 bg-[#2D8B8B] hover:bg-[#1A7A7A] text-white rounded-[10px] font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                   {processingAction === 'roleChange' ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
                <button onClick={() => setShowRoleModal(false)} className="w-full py-2.5 bg-white border border-[#E2E8F0] text-[#1A202C] hover:bg-[#F0F2F5] rounded-[10px] font-semibold text-sm transition-colors">Cancel</button>
              </div>
           </div>
        </ModalWrapper>
      )}

      {/* Delete/Purge Modal */}
      {showDeleteModal && (
        <ModalWrapper onClose={() => setShowDeleteModal(false)}>
           <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#1A202C]">Delete User</h3>
                  <button onClick={() => setShowDeleteModal(false)} className="text-[#A0AEC0] hover:text-[#1A202C] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-[#718096] mb-6">Are you sure you want to delete <span className="font-semibold text-[#1A202C]">{selectedUser.name}</span>?</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleSoftDelete} 
                  disabled={processingAction === 'delete'}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-[10px] font-semibold text-sm transition-colors"
                >
                  Delete User
                </button>
                <button 
                  onClick={() => setShowHardDeleteConfirm(true)}
                  className="w-full py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-[10px] font-semibold text-sm transition-colors"
                >
                  Permanently Delete
                </button>
                <button onClick={() => setShowDeleteModal(false)} className="w-full py-2.5 bg-white border border-[#E2E8F0] text-[#1A202C] hover:bg-[#F0F2F5] rounded-[10px] font-semibold text-sm transition-colors">Cancel</button>
              </div>
           </div>

           {showHardDeleteConfirm && (
             <div className="absolute inset-0 bg-white/95 backdrop-blur z-[210] p-6 flex flex-col items-center justify-center text-center animate-fadeIn">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-4">
                   <AlertTriangle className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-[#1A202C] mb-2">Permanent Deletion</h4>
                <p className="text-sm text-[#718096] mb-6">
                   This will permanently erase all data for <span className="font-semibold text-[#1A202C]">{selectedUser.name}</span>. This action cannot be undone.
                </p>
                <div className="flex flex-col gap-3 w-full">
                  <button onClick={handleHardDelete} disabled={processingAction === 'hardDelete'} className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-[10px] font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                     {processingAction === 'hardDelete' ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Confirm Delete"}
                  </button>
                  <button onClick={() => setShowHardDeleteConfirm(false)} className="w-full py-2.5 bg-white border border-[#E2E8F0] text-[#1A202C] hover:bg-[#F0F2F5] rounded-[10px] font-semibold text-sm transition-colors">Cancel</button>
                </div>
             </div>
           )}
        </ModalWrapper>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <ModalWrapper onClose={() => setShowLogoutModal(false)}>
           <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#1A202C]">Logout User</h3>
                  <button onClick={() => setShowLogoutModal(false)} className="text-[#A0AEC0] hover:text-[#1A202C] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-[#718096] mb-6">Force logout the active session for <span className="font-semibold text-[#1A202C]">{selectedUser.name}</span>?</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmLogout} disabled={processingAction === 'logout'} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-[10px] font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                   {processingAction === 'logout' ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Logout User"}
                </button>
                <button onClick={() => setShowLogoutModal(false)} className="w-full py-2.5 bg-white border border-[#E2E8F0] text-[#1A202C] hover:bg-[#F0F2F5] rounded-[10px] font-semibold text-sm transition-colors">Cancel</button>
              </div>
           </div>
        </ModalWrapper>
      )}

      {/* Recover Modal */}
      {showRecoverModal && (
        <ModalWrapper onClose={() => setShowRecoverModal(false)}>
           <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#1A202C]">Restore User</h3>
                  <button onClick={() => setShowRecoverModal(false)} className="text-[#A0AEC0] hover:text-[#1A202C] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-[#718096] mb-6">Restore account access for <span className="font-semibold text-[#1A202C]">{selectedUser.name}</span>?</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmRecover} disabled={processingAction === 'recover'} className="w-full py-2.5 bg-[#22C55E] hover:bg-[#1CA851] text-white rounded-[10px] font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                   {processingAction === 'recover' ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Restore User"}
                </button>
                <button onClick={() => setShowRecoverModal(false)} className="w-full py-2.5 bg-white border border-[#E2E8F0] text-[#1A202C] hover:bg-[#F0F2F5] rounded-[10px] font-semibold text-sm transition-colors">Cancel</button>
              </div>
           </div>
        </ModalWrapper>
      )}

      {/* Subscription Pause Modal */}
      {showPauseModal && (
        <ModalWrapper onClose={() => setShowPauseModal(false)}>
           <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#1A202C]">Pause Subscription</h3>
                  <button onClick={() => setShowPauseModal(false)} className="text-[#A0AEC0] hover:text-[#1A202C] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-[#718096] mb-6">Pause billing plan for <span className="font-semibold text-[#1A202C]">{selectedUser.name}</span>?</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmPause} disabled={processingAction === 'pause'} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-[10px] font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                   {processingAction === 'pause' ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Pause Plan"}
                </button>
                <button onClick={() => setShowPauseModal(false)} className="w-full py-2.5 bg-white border border-[#E2E8F0] text-[#1A202C] hover:bg-[#F0F2F5] rounded-[10px] font-semibold text-sm transition-colors">Cancel</button>
              </div>
           </div>
        </ModalWrapper>
      )}

      {/* Subscription Resume Modal */}
      {showResumeModal && (
        <ModalWrapper onClose={() => setShowResumeModal(false)}>
           <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-[#1A202C]">Resume Subscription</h3>
                  <button onClick={() => setShowResumeModal(false)} className="text-[#A0AEC0] hover:text-[#1A202C] transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-[#718096] mb-6">Resume billing plan for <span className="font-semibold text-[#1A202C]">{selectedUser.name}</span>?</p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmResume} disabled={processingAction === 'resume'} className="w-full py-2.5 bg-[#2D8B8B] hover:bg-[#1A7A7A] text-white rounded-[10px] font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                   {processingAction === 'resume' ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Resume Plan"}
                </button>
                <button onClick={() => setShowResumeModal(false)} className="w-full py-2.5 bg-white border border-[#E2E8F0] text-[#1A202C] hover:bg-[#F0F2F5] rounded-[10px] font-semibold text-sm transition-colors">Cancel</button>
              </div>
           </div>
        </ModalWrapper>
      )}
    </>
  );
}
