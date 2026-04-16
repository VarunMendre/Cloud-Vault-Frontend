import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DirectoryHeader from "./components/DirectoryHeader";
import { useAuth } from "./context/AuthContext";
import { 
  Share2, 
  Users, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Clock
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function FileSharingDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    sharedWithMeCount: 0,
    sharedByMeCount: 0,
    collaboratorsCount: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BASE_URL}/share/dashboard/stats`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DirectoryHeader
        directoryName="File Sharing"
        path={[]}
        userName={user?.name || "Guest User"}
        userEmail={user?.email || "guest@example.com"}
        userPicture={user?.picture}
        userRole={user?.role || "User"}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center">
                <Share2 className="w-6 h-6 text-[#66B2D6]" />
             </div>
             <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sharing Dashboard</h1>
          </div>
          <p className="text-sm font-medium text-gray-400">Monitor activity and manage collaboration nodes across your workspace.</p>
          <div className="flex items-center gap-2 mt-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-white w-fit px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
             <Clock className="w-3.5 h-3.5 text-[#66B2D6]" />
             Last sync: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Shared With Me */}
          <div
            onClick={() => navigate("/share/shared-with-me")}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-[#66B2D6]/30 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#66B2D6]/5 rounded-bl-full -z-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner group-hover:scale-110 transition-transform">
                <Share2 className="w-6 h-6 text-[#66B2D6]" />
              </div>
              <span className="text-4xl font-bold text-gray-900 tracking-tighter">{stats.sharedWithMeCount}</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Incoming Shares</h3>
            <p className="text-xs font-medium text-gray-400 mb-4">Assets shared with you by others</p>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#66B2D6] transition-all group-hover:gap-3">
              View Collection
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Shared By Me */}
          <div
            onClick={() => navigate("/share/shared-by-me")}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-[#66B2D6]/30 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/50 rounded-bl-full -z-0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-4xl font-bold text-gray-900 tracking-tighter">{stats.sharedByMeCount}</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Active Outbound</h3>
            <p className="text-xs font-medium text-gray-400 mb-4">Files you've distributed</p>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-green-500 transition-all group-hover:gap-3">
              Manage Access
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Collaborators */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50/50 rounded-bl-full -z-0"></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shadow-inner">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-4xl font-bold text-gray-900 tracking-tighter">{stats.collaboratorsCount}</span>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">Collaboration Nodes</h3>
            <p className="text-xs font-medium text-gray-400 mb-4">Unique teammates in your network</p>
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-300">
               Live Network
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1A1C1E] rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-bl-[120px] -z-0 group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Infrastructure Actions</h2>
            <p className="text-sm font-medium text-gray-500 mb-8 max-w-md">Streamlined controls for rapid asset deployment and permission auditing.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all text-left group/btn"
              >
                <div className="w-12 h-12 bg-[#66B2D6]/10 rounded-xl flex items-center justify-center border border-[#66B2D6]/20">
                  <PlusCircle className="w-6 h-6 text-[#66B2D6]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Provision Assets</h3>
                  <p className="text-xs font-medium text-gray-500">Upload and initialize new shares</p>
                </div>
              </button>
              <button
                onClick={() => navigate("/share/shared-by-me")}
                className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] transition-all text-left group/btn"
              >
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                  <ShieldCheck className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">Audit Permissions</h3>
                  <p className="text-xs font-medium text-gray-500">Revoke or update global access</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileSharingDashboard;
