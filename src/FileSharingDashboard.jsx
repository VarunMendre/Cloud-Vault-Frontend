import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DirectoryHeader from "./components/DirectoryHeader";
import { useAuth } from "./context/AuthContext";
import { 
  Share2, 
  Users, 
  FileText, 
  ChevronRight,
  ShieldCheck,
  PlusCircle
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
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-[#1A202C]">
      <DirectoryHeader
        directoryName="File Sharing"
        path={[]}
        userName={user?.name || "User"}
        userEmail={user?.email || ""}
        userPicture={user?.picture}
        userRole={user?.role || "User"}
      />

      <div className="max-w-[1100px] mx-auto px-6 pt-24 pb-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
             <div className="w-12 h-12 bg-[#D1FAF5] rounded-[12px] flex items-center justify-center border border-[#A8D8D8]">
                <Share2 className="w-6 h-6 text-[#2D8B8B]" />
             </div>
             <h1 className="text-[28px] font-bold text-[#1A202C]">Sharing Dashboard</h1>
          </div>
          <p className="text-[15px] text-[#718096]">Monitor activity and manage collaboration across your workspace.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Shared With Me */}
          <div
            onClick={() => navigate("/share/shared-with-me")}
            className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-6 cursor-pointer hover:border-[#2D8B8B] hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-[12px] bg-[#F7FFFE] border border-[#A8D8D8] flex items-center justify-center">
                <Share2 className="w-6 h-6 text-[#2D8B8B]" />
              </div>
              <span className="text-[32px] font-bold text-[#1A202C] leading-none">{stats.sharedWithMeCount}</span>
            </div>
            <h3 className="text-[16px] font-bold text-[#1A202C] mb-1">Shared with Me</h3>
            <p className="text-[14px] text-[#718096] mb-5">Assets others have shared with you</p>
            <div className="flex items-center gap-1 text-[13px] font-bold text-[#2D8B8B] group-hover:gap-2 transition-all">
              View Collection <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Shared By Me */}
          <div
            onClick={() => navigate("/share/shared-by-me")}
            className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-6 cursor-pointer hover:border-[#22C55E] hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-[12px] bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#22C55E]" />
              </div>
              <span className="text-[32px] font-bold text-[#1A202C] leading-none">{stats.sharedByMeCount}</span>
            </div>
            <h3 className="text-[16px] font-bold text-[#1A202C] mb-1">Shared by Me</h3>
            <p className="text-[14px] text-[#718096] mb-5">Files you have distributed to others</p>
            <div className="flex items-center gap-1 text-[13px] font-bold text-[#22C55E] group-hover:gap-2 transition-all">
              Manage Access <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Collaborators */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-[12px] bg-[#F0F2F5] border border-[#E2E8F0] flex items-center justify-center">
                <Users className="w-6 h-6 text-[#4A5568]" />
              </div>
              <span className="text-[32px] font-bold text-[#1A202C] leading-none">{stats.collaboratorsCount}</span>
            </div>
            <h3 className="text-[16px] font-bold text-[#1A202C] mb-1">Collaborators</h3>
            <p className="text-[14px] text-[#718096] mb-5">Unique users in your shared network</p>
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#718096] uppercase tracking-wider">
               Active Network
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-8">
           <h2 className="text-[20px] font-bold text-[#1A202C] mb-2">Quick Actions</h2>
           <p className="text-[14px] text-[#718096] mb-6">Streamlined controls for rapid asset sharing and permission auditing.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-4 p-5 border border-[#E2E8F0] rounded-[12px] hover:bg-[#F0F2F5] transition-colors text-left"
              >
                <div className="w-12 h-12 bg-[#F7FFFE] rounded-[10px] flex items-center justify-center border border-[#A8D8D8]">
                  <PlusCircle className="w-6 h-6 text-[#2D8B8B]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1A202C] mb-0.5">Share New Asset</h3>
                  <p className="text-[13px] text-[#718096]">Upload and distribute from your drive</p>
                </div>
              </button>

              <button
                onClick={() => navigate("/share/shared-by-me")}
                className="flex items-center gap-4 p-5 border border-[#E2E8F0] rounded-[12px] hover:bg-[#F0F2F5] transition-colors text-left"
              >
                <div className="w-12 h-12 bg-[#F0FDF4] rounded-[10px] flex items-center justify-center border border-[#BBF7D0]">
                  <ShieldCheck className="w-6 h-6 text-[#22C55E]" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#1A202C] mb-0.5">Audit Permissions</h3>
                  <p className="text-[13px] text-[#718096]">Review or revoke active access</p>
                </div>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

export default FileSharingDashboard;
