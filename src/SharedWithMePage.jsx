import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import DirectoryHeader from "./components/DirectoryHeader";
import {
  FileText,
  Search,
  ArrowLeft,
  ChevronDown,
  Eye,
  Download,
  AlertCircle,
  Info,
  X,
  Lock,
  Globe
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function SharedWithMePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 4000);
  };

  useEffect(() => {
    fetchSharedFiles();
  }, []);

  const fetchSharedFiles = async () => {
    try {
      const response = await fetch(`${BASE_URL}/share/shared-with-me`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setSharedFiles(data);
      }
    } catch (err) {
      console.error("Error fetching shared files:", err);
      showToast("Could not fetch shared files", "error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024, dm = 2, sizes = ["Bytes", "KB", "MB", "GB", "TB"], i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const filteredFiles = sharedFiles.filter((file) => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || file.fileType === filterType;
    return matchesSearch && matchesFilter;
  });

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

      <div className="max-w-[1100px] mx-auto px-6 pt-24 pb-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <button
              onClick={() => navigate("/share")}
              className="flex items-center gap-1.5 mb-4 text-[13px] font-semibold text-[#718096] hover:text-[#1A202C] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sharing
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm flex items-center justify-center">
                <Globe className="w-6 h-6 text-[#2D8B8B]" />
              </div>
              <div>
                <h1 className="text-[28px] font-bold text-[#1A202C] leading-tight">Shared with Me</h1>
                <p className="text-[14px] text-[#718096]">Files and folders others have shared with you</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-[10px] shadow-sm text-[13px] font-bold text-[#1A202C]">
            <span className="text-[#2D8B8B] bg-[#F7FFFE] px-2 py-0.5 rounded-md border border-[#A8D8D8]">{filteredFiles.length}</span> items visible
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-[16px] p-4 border border-[#E2E8F0] shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
            <input
              type="text"
              placeholder="Search shared items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#F0F2F5] border border-transparent rounded-[10px] text-[14px] text-[#1A202C] focus:outline-none focus:border-[#2D8B8B] focus:bg-white transition-all placeholder:text-[#718096]"
            />
          </div>
          <div className="relative w-full md:w-56">
             <select
               value={filterType}
               onChange={(e) => setFilterType(e.target.value)}
               className="w-full pl-4 pr-10 py-2.5 bg-[#F0F2F5] border border-transparent rounded-[10px] text-[14px] text-[#1A202C] focus:outline-none focus:border-[#2D8B8B] focus:bg-white transition-all cursor-pointer appearance-none shrink-0 font-semibold"
             >
               <option value="all">All Items</option>
               <option value="document">Documents</option>
               <option value="image">Images</option>
               <option value="video">Videos</option>
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096] pointer-events-none" />
          </div>
        </div>

        {/* Main List */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#E2E8F0] overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-8 h-8 border-4 border-[#F0F2F5] border-t-[#2D8B8B] rounded-full animate-spin"></div>
              <p className="text-[14px] font-semibold text-[#718096]">Loading items...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-24 px-6 md:px-12">
              <div className="w-16 h-16 bg-[#F0F2F5] rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-[#A0AEC0]" />
              </div>
              <h3 className="text-[18px] font-bold text-[#1A202C] mb-2">Nothing shared yet</h3>
              <p className="text-[14px] text-[#718096] max-w-sm mx-auto">
                Items shared directly with you will appear here along with your permissions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F0F2F5] border-b border-[#E2E8F0]">
                    <th className="px-6 py-3 text-[12px] font-bold text-[#718096] uppercase tracking-wider">Item Name</th>
                    <th className="px-6 py-3 text-[12px] font-bold text-[#718096] uppercase tracking-wider">Shared By</th>
                    <th className="px-6 py-3 text-[12px] font-bold text-[#718096] uppercase tracking-wider">Date Shared</th>
                    <th className="px-6 py-3 text-[12px] font-bold text-[#718096] uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-[12px] font-bold text-[#718096] uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-[12px] font-bold text-[#718096] uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredFiles.map((file) => (
                    <tr key={file.fileId} className="hover:bg-[#F7FFFE] transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-[#E2E8F0] rounded-[8px] flex items-center justify-center shadow-sm text-[#2D8B8B]">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-[15px] font-semibold text-[#1A202C] truncate max-w-[200px]" title={file.fileName}>
                            {file.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#1A202C] text-white flex items-center justify-center text-[10px] font-bold">
                            {file.sharedBy.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[14px] text-[#4A5568]">{file.sharedBy}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[14px] text-[#718096]">{formatDate(file.sharedAt)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[14px] font-medium text-[#1A202C]">{formatFileSize(file.size)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-[12px] font-bold ${
                            file.permission === "editor"
                              ? "bg-[#F0FDF4] text-[#22C55E]"
                              : "bg-[#F0F2F5] text-[#4A5568]"
                          }`}
                        >
                          {file.permission.charAt(0).toUpperCase() + file.permission.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              const statusStr = String(user?.subscriptionStatus || "").toLowerCase().trim();
                               if (statusStr === "halted" || statusStr === "expired") {
                                showToast("Subscription expired. Access restricted.", "error");
                                return;
                              }
                              window.open(`${BASE_URL}/file/${file.fileId}`, '_blank');
                            }}
                            className="p-2 text-[#718096] hover:text-[#2D8B8B] hover:bg-[#D1FAF5] bg-white border border-[#E2E8F0] rounded-[8px] shadow-sm transition-all"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              const statusStr = String(user?.subscriptionStatus || "").toLowerCase().trim();
                              if (statusStr === "halted" || statusStr === "expired") {
                                showToast("Subscription expired. Download restricted.", "error");
                                return;
                              }
                              window.location.href = `${BASE_URL}/file/${file.fileId}?action=download`;
                            }}
                            className="p-2 text-[#718096] hover:text-[#2D8B8B] hover:bg-[#D1FAF5] bg-white border border-[#E2E8F0] rounded-[8px] shadow-sm transition-all"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
           <div className={`bg-white rounded-[12px] shadow-lg p-4 flex items-center gap-3 border ${toast.type === 'error' ? 'border-[#FECACA]' : 'border-[#A8D8D8]'}`}>
                {toast.type === 'error' ? (
                     <AlertCircle className="w-5 h-5 text-[#DC2626]" />
                ) : (
                     <Info className="w-5 h-5 text-[#2D8B8B]" />
                )}
                <p className="text-[14px] font-medium text-[#1A202C]">{toast.message}</p>
                <button onClick={() => setToast({ ...toast, show: false })} className="ml-2 text-[#718096] hover:text-[#1A202C]">
                  <X className="w-4 h-4" />
                </button>
           </div>
        </div>
      )}
    </div>
  );
}

export default SharedWithMePage;
