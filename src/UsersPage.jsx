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
      case "Admin": return "bg-[#66B2D6]/10 text-[#66B2D6] border border-[#66B2D6]/20";
      case "Manager": return "bg-indigo-50 text-indigo-600 border border-indigo-100";
      default: return "bg-gray-50 text-gray-500 border border-gray-100";
    }
  };

  const getStatusColor = (isLoggedIn, isDeleted) => {
    if (isDeleted) return "bg-red-50 text-red-600 border border-red-100";
    if (isLoggedIn) return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    return "bg-gray-50 text-gray-400 border border-gray-100";
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
        showToast("Access level synchronized", "success");
        fetchUsers();
      } else {
        const err = await response.json();
        showToast(err.error || "Failed to synchronize node", "error");
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
        showToast("User session terminated", "info");
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
        showToast("User access suspended", "info");
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
        showToast("Node permanently purged", "info");
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
        showToast("Access restored", "success");
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
        showToast("Quota billing paused", "success");
        fetchUsers();
      } else {
        const err = await response.json();
        showToast(err.message || "Pause command failed", "error");
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
        showToast("Quota billing resumed", "success");
        fetchUsers();
      } else {
        const err = await response.json();
        showToast(err.message || "Resume command failed", "error");
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#66B2D6] rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] animate-pulse">Authenticating Admin...</p>
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
    <div className="min-h-screen bg-gray-50">
      <DirectoryHeader
        directoryName="System Registry"
        userName={currentUser?.name || "Admin"}
        userEmail={currentUser?.email || ""}
        userPicture={currentUser?.picture}
        userRole={currentUser?.role}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 animate-fadeIn space-y-8">
        
        {/* Navigation & Identity */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 px-6 py-3 bg-white border border-gray-200 rounded-2xl transition-all text-sm font-bold text-gray-600 hover:text-[#66B2D6] hover:border-[#66B2D6]/30 hover:shadow-lg hover:shadow-[#66B2D6]/5 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Main Console</span>
          </button>

          <div className="flex items-center gap-4 bg-white p-2.5 pr-6 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="relative">
              {currentUser.picture ? (
                <img src={currentUser.picture} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#66B2D6]/10 flex items-center justify-center text-[#66B2D6] font-bold text-sm border-2 border-white">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold text-gray-900 leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{currentUser.role} PRIVILEGES</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<Users />} label="Total Registered" value={totalUsers} color="text-indigo-600" bg="bg-indigo-50" />
          <StatCard icon={<CheckCircle />} label="Verified Nodes" value={activeUsers} color="text-emerald-600" bg="bg-emerald-50" />
          <StatCard icon={<Zap />} label="Online Protocols" value={onlineUsers} color="text-[#66B2D6]" bg="bg-[#66B2D6]/5" />
          <StatCard icon={<Trash2 />} label="Purged Clusters" value={deletedUsers} color="text-rose-600" bg="bg-rose-50" />
        </div>

        {/* Registry Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden group">
          <div className="px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-white">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">System Node Registry</h2>
              <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">Managing access tokens and storage dividends</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#66B2D6] transition-colors" />
                <input
                  type="text"
                  placeholder="Query entry..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-72 pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-[11px] font-black focus:outline-none focus:ring-4 focus:ring-[#66B2D6]/10 transition-all uppercase tracking-widest placeholder:text-gray-300"
                />
              </div>
              <button 
                onClick={() => !processingAction && fetchUsers()}
                className="px-6 py-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-[#66B2D6]/30 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <RefreshCw className={`w-4 h-4 text-[#66B2D6] ${isLoading ? 'animate-spin' : ''}`} />
                <span>Sync Node</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  <th className="px-8 py-5">Node/Identifier</th>
                  <th className="px-8 py-5">Storage Bandwidth</th>
                  <th className="px-8 py-5">Access Level</th>
                  {currentUser.role === "Owner" && <th className="px-8 py-5">Billing Status</th>}
                  <th className="px-8 py-5 text-right">Command</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
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
        <div className="fixed bottom-8 right-8 z-[200] max-w-sm w-full animate-slideInRight">
          <div className="bg-[#1A1C1E] rounded-[2rem] shadow-2xl p-5 flex items-start gap-4 border border-white/5 backdrop-blur-xl">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              toast.type === 'error' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
              toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
              'bg-[#66B2D6]/10 text-[#66B2D6] border-[#66B2D6]/20'
            }`}>
              {toast.type === 'error' ? <AlertTriangle className="w-6 h-6" /> : 
               toast.type === 'success' ? <ShieldCheck className="w-6 h-6" /> :
               <Info className="w-6 h-6" />}
            </div>
            <div className="flex-1 pt-1 text-left">
              <p className="text-[11px] font-black text-white uppercase tracking-widest px-1">Registry Event</p>
              <p className="text-xs font-medium text-gray-400 mt-2 leading-relaxed px-1">{toast.message}</p>
            </div>
            <button onClick={() => setToast({ ...toast, show: false })} className="text-gray-500 hover:text-white transition-all p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Internal Components ---

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

function UserRow({ user, currentUser, onView, onRoleChange, onLogout, onDelete, onRecover, onPause, onResume, getRoleColor, getStatusColor, formatBytes, canChangeRole }) {
  const usagePercent = Math.min(100, Math.round(((user.usedStorageInBytes || 0) / (user.maxStorageLimit || 500 * 1024 * 1024)) * 100));

  return (
    <tr className="hover:bg-gray-50/50 transition-colors group">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user.picture ? (
              <img src={user.picture} alt="" className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-sm ring-1 ring-gray-100" />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 text-sm font-bold border border-gray-200 uppercase">
                {user.name.charAt(0)}
              </div>
            )}
            {user.isLoggedIn && !user.isDeleted && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm tracking-tight">{user.name}</div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1 flex items-center gap-2">
               <Mail className="w-3 h-3" />
               {user.email}
            </div>
          </div>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="w-44">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">{formatBytes(user.usedStorageInBytes || 0)}</span>
            <span className="text-[9px] font-black text-gray-300 uppercase">{usagePercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50 shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                usagePercent > 90 ? 'bg-rose-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-[#66B2D6]'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-[9px] font-bold text-gray-300 mt-2 uppercase tracking-wide">CAPACITY: {formatBytes(user.maxStorageLimit || 500 * 1024 * 1024)}</p>
        </div>
      </td>
      <td className="px-8 py-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getRoleColor(user.role)}`}>
              {user.role}
            </span>
            {canChangeRole(user) && (
              <button onClick={() => onRoleChange(user)} className="p-1 text-gray-200 hover:text-[#66B2D6] transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest w-fit ${getStatusColor(user.isLoggedIn, user.isDeleted)}`}>
            {user.isDeleted ? "Purged" : user.isLoggedIn ? "Active Connection" : "Offline Node"}
          </span>
        </div>
      </td>
      {currentUser.role === "Owner" && (
        <td className="px-8 py-5">
           {user.razorpaySubscriptionId ? (
             <div className="space-y-2">
               {user.subscriptionStatus === "paused" ? (
                  <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 w-fit">
                    <Pause className="w-2.5 h-2.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Billing Paused</span>
                  </div>
               ) : (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 w-fit">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Active Subscription</span>
                  </div>
               )}
               <div className="flex gap-3">
                  {user.subscriptionStatus === "paused" ? (
                    <button onClick={() => onResume(user)} className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline transition-all">Enable Egress</button>
                  ) : (
                    <button onClick={() => onPause(user)} className="text-[9px] font-black text-amber-600 uppercase tracking-widest hover:underline transition-all">Suspend Billing</button>
                  )}
               </div>
             </div>
           ) : (
             <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] italic">Basic Payload</span>
           )}
        </td>
      )}
      <td className="px-8 py-5 text-right">
        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
           {!user.isDeleted && (
             <button onClick={() => onView(user)} className="p-2.5 bg-gray-50 text-gray-400 hover:text-[#66B2D6] hover:bg-white border border-transparent hover:border-[#66B2D6]/20 rounded-xl shadow-sm transition-all" title="View Files">
               <Eye className="w-4.5 h-4.5" />
             </button>
           )}
           {user.isLoggedIn && !user.isDeleted && (
             <button onClick={() => onLogout(user)} className="p-2.5 bg-gray-50 text-gray-400 hover:text-amber-600 hover:bg-white border border-transparent hover:border-amber-600/20 rounded-xl shadow-sm transition-all" title="Terminate Session">
               <LogOut className="w-4.5 h-4.5" />
             </button>
           )}
           {!user.isDeleted ? (
             <button onClick={() => onDelete(user)} className="p-2.5 bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-white border border-transparent hover:border-rose-600/20 rounded-xl shadow-sm transition-all" title="Purge Node">
               <Trash2 className="w-4.5 h-4.5" />
             </button>
           ) : (
             <button onClick={() => onRecover(user)} className="p-2.5 bg-white text-emerald-600 border border-emerald-100 rounded-xl shadow-sm hover:bg-emerald-50 transition-all" title="Restore Node">
               <RotateCcw className="w-4.5 h-4.5" />
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
      <td colSpan={colSpan} className="py-24 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-100 border-t-[#66B2D6] rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] animate-pulse">Syncing Cluster...</p>
        </div>
      </td>
    </tr>
  );
}

function EmptyRow({ colSpan, query }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-24 text-center">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-gray-100 rotate-3">
             <Search className="w-10 h-10 text-gray-200" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Node Not Found</h3>
          <p className="text-xs font-medium text-gray-400 max-w-xs leading-relaxed uppercase tracking-wider px-4">
            No identifier matching "<span className="text-gray-900 font-bold">{query}</span>" exists in the registry.
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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-200 w-full max-w-sm overflow-hidden animate-scaleIn">
        {children}
      </div>
    </div>
  );

  return (
    <>
      {/* Role Modal */}
      {showRoleModal && (
        <ModalWrapper onClose={() => setShowRoleModal(false)}>
           <div className="p-10">
              <div className="flex items-center justify-between mb-10">
                  <div className="w-14 h-14 bg-[#66B2D6]/10 rounded-[1.5rem] flex items-center justify-center text-[#66B2D6] border border-[#66B2D6]/20">
                    <Shield className="w-7 h-7" />
                  </div>
                  <button onClick={() => setShowRoleModal(false)} className="text-gray-300 hover:text-gray-900 transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Elevate Clearance</h3>
              <p className="text-xs font-medium text-gray-400 mb-10 uppercase tracking-widest leading-relaxed">Updating administrative permissions for <span className="text-gray-900 font-bold">{selectedUser.name}</span></p>
              
              <div className="space-y-4 mb-10">
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setNewRole(role)}
                    className={`w-full p-4 rounded-2xl flex items-center justify-between border transition-all ${
                      newRole === role ? 'bg-[#66B2D6]/5 border-[#66B2D6] ring-4 ring-[#66B2D6]/10 shadow-inner' : 'bg-white border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${newRole === role ? 'bg-[#66B2D6] shadow-[0_0_10px_#66B2D6]' : 'bg-gray-200'}`} />
                        <span className={`text-[11px] font-black uppercase tracking-widest ${newRole === role ? 'text-[#66B2D6]' : 'text-gray-500'}`}>{role}</span>
                    </div>
                    {newRole === role && <ShieldCheck className="w-4 h-4 text-[#66B2D6] shadow-sm" />}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={confirmRoleChange} disabled={processingAction === 'roleChange'} className="w-full py-4 bg-[#66B2D6] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#66B2D6]/10 hover:bg-[#5aa0c1] transition-all flex items-center justify-center gap-2">
                   {processingAction === 'roleChange' ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Commit Permission"}
                </button>
                <button onClick={() => setShowRoleModal(false)} className="w-full py-4 bg-white text-gray-400 hover:text-gray-900 transition-colors font-black text-xs uppercase tracking-[0.2em]">Abort Shift</button>
              </div>
           </div>
        </ModalWrapper>
      )}

      {/* Delete/Purge Modal */}
      {showDeleteModal && (
        <ModalWrapper onClose={() => setShowDeleteModal(false)}>
           <div className="p-10">
              <div className="flex items-center justify-between mb-10">
                  <div className="w-14 h-14 bg-rose-50 rounded-[1.5rem] flex items-center justify-center text-rose-500 border border-rose-100">
                    <Trash2 className="w-7 h-7" />
                  </div>
                  <button onClick={() => setShowDeleteModal(false)} className="text-gray-300 hover:text-gray-900 transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Purge Request</h3>
              <p className="text-xs font-medium text-gray-400 mb-10 uppercase tracking-widest leading-relaxed px-1">Suspending all access for <span className="text-gray-900 font-bold">{selectedUser.name}</span></p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleSoftDelete} 
                  disabled={processingAction === 'delete'}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-black transition-all"
                >
                  Standard Suspension
                </button>
                <button 
                  onClick={() => setShowHardDeleteConfirm(true)}
                  className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-100 transition-all border border-rose-100"
                >
                  Hard Purge (Data Erasure)
                </button>
                <button onClick={() => setShowDeleteModal(false)} className="w-full py-4 bg-white text-gray-400 hover:text-gray-900 transition-colors font-black text-xs uppercase tracking-[0.2em]">Cancel</button>
              </div>
           </div>

           {showHardDeleteConfirm && (
             <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-[210] p-10 flex flex-col items-center justify-center text-center animate-fadeIn">
                <div className="w-16 h-16 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mb-8 border border-rose-500/20 shadow-inner">
                   <AlertTriangle className="w-10 h-10 animate-pulse" />
                </div>
                <h4 className="text-xl font-bold text-rose-600 mb-4 tracking-tight">Irreversible Action</h4>
                <p className="text-xs font-medium text-gray-500 mb-10 uppercase tracking-widest leading-loose">
                   Purging this node will permanently erase <span className="text-gray-900 font-bold">ALL DATA</span> associated with this ID. This cannot be undone.
                </p>
                <div className="flex flex-col gap-3 w-full">
                  <button onClick={handleHardDelete} disabled={processingAction === 'hardDelete'} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2">
                     {processingAction === 'hardDelete' ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Confirm Destruction"}
                  </button>
                  <button onClick={() => setShowHardDeleteConfirm(false)} className="w-full py-4 text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Abort Purge</button>
                </div>
             </div>
           )}
        </ModalWrapper>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <ModalWrapper onClose={() => setShowLogoutModal(false)}>
           <div className="p-10 text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-500 mx-auto mb-8 border border-amber-100 shadow-inner">
                <LogOut className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Session Nullification</h3>
              <p className="text-xs font-medium text-gray-400 mb-10 uppercase tracking-widest leading-relaxed">
                 Terminating the active connection for <span className="text-gray-900 font-bold">{selectedUser.name}</span>.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmLogout} disabled={processingAction === 'logout'} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-amber-500/10 hover:bg-amber-600 transition-all flex items-center justify-center gap-2">
                   {processingAction === 'logout' ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Confirm Termination"}
                </button>
                <button onClick={() => setShowLogoutModal(false)} className="w-full py-4 text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Close</button>
              </div>
           </div>
        </ModalWrapper>
      )}

      {/* Recover Modal */}
      {showRecoverModal && (
        <ModalWrapper onClose={() => setShowRecoverModal(false)}>
           <div className="p-10 text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-500 mx-auto mb-8 border border-emerald-100 shadow-inner">
                <RotateCcw className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Node Restoration</h3>
              <p className="text-xs font-medium text-gray-400 mb-10 uppercase tracking-widest leading-relaxed">
                 Restoring system access for <span className="text-gray-900 font-bold">{selectedUser.name}</span>.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmRecover} disabled={processingAction === 'recover'} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                   {processingAction === 'recover' ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Validate Restore"}
                </button>
                <button onClick={() => setShowRecoverModal(false)} className="w-full py-4 text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Cancel</button>
              </div>
           </div>
        </ModalWrapper>
      )}

      {/* Subscription Pause Modal */}
      {showPauseModal && (
        <ModalWrapper onClose={() => setShowPauseModal(false)}>
           <div className="p-10 text-center">
              <div className="w-16 h-16 bg-amber-50 rounded-[2rem] flex items-center justify-center text-amber-500 mx-auto mb-8 border border-amber-100 shadow-inner">
                <Pause className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Billing Suspension</h3>
              <p className="text-xs font-medium text-gray-400 mb-10 uppercase tracking-widest leading-relaxed">
                 The quota egress and billing will be frozen for <span className="text-gray-900 font-bold">{selectedUser.name}</span>. 
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmPause} disabled={processingAction === 'pause'} className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-amber-500/10 hover:bg-amber-600 transition-all flex items-center justify-center gap-2">
                   {processingAction === 'pause' ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Suspend Command"}
                </button>
                <button onClick={() => setShowPauseModal(false)} className="w-full py-4 text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Abort</button>
              </div>
           </div>
        </ModalWrapper>
      )}

      {/* Subscription Resume Modal */}
      {showResumeModal && (
        <ModalWrapper onClose={() => setShowResumeModal(false)}>
           <div className="p-10 text-center">
              <div className="w-16 h-16 bg-[#66B2D6]/10 rounded-[2rem] flex items-center justify-center text-[#66B2D6] mx-auto mb-8 border border-[#66B2D6]/20 shadow-inner">
                <Play className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Re-Enable Billing</h3>
              <p className="text-xs font-medium text-gray-400 mb-10 uppercase tracking-widest leading-relaxed">
                 Restoring billing protocols and storage egress for <span className="text-gray-900 font-bold">{selectedUser.name}</span>.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmResume} disabled={processingAction === 'resume'} className="w-full py-4 bg-[#66B2D6] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#66B2D6]/10 hover:bg-[#5aa0c1] transition-all flex items-center justify-center gap-2">
                   {processingAction === 'resume' ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Resume Command"}
                </button>
                <button onClick={() => setShowResumeModal(false)} className="w-full py-4 text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Abort</button>
              </div>
           </div>
        </ModalWrapper>
      )}
    </>
  );
}
