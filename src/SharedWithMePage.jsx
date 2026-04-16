import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import DirectoryHeader from "./components/DirectoryHeader";
import {
  FileText,
  Search,
  ArrowLeft,
  ChevronRight,
  Eye,
  Download,
  AlertTriangle,
  Info,
  X,
  UserCircle,
  ShieldCheck,
  Globe,
  Database,
  Lock
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function SharedWithMePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Toast state
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
      showToast("Access Relay Interrupted", "warning");
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
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const filteredFiles = sharedFiles.filter((file) => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || file.fileType === filterType;
    return matchesSearch && matchesFilter;
  });

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
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <button
              onClick={() => navigate("/")}
              className="group flex items-center gap-2 mb-6 text-[10px] font-black text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest"
              id="back-to-dashboard-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              Primary Node
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-[1.25rem] border border-gray-200 shadow-sm flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                <Globe className="w-7 h-7 text-[#66B2D6]" />
              </div>
              <div>
                <h2 className="text-[10px] font-black text-[#66B2D6] uppercase tracking-[0.3em] mb-1">External Ingress</h2>
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Shared Artifacts</h1>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Permissions</p>
                <p className="text-sm font-bold text-gray-900">{filteredFiles.length} SHARED NODES</p>
             </div>
             <div className="h-10 w-px bg-gray-200 hidden sm:block" />
             <div className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.1em]">SECURE ACCESS ACTIVE</span>
             </div>
          </div>
        </div>

        {/* Console Controls */}
        <div className="bg-white rounded-[2rem] p-6 border border-gray-200 shadow-sm mb-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#66B2D6] transition-colors" />
            <input
              type="text"
              id="artifact-search-input"
              placeholder="Query registry metadata..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-bold focus:outline-none focus:border-[#66B2D6]/30 focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-56">
                <select
                  id="artifact-filter-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-6 pr-10 py-4 bg-gray-50 border border-transparent rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 focus:outline-none focus:border-[#66B2D6]/30 transition-all outline-none cursor-pointer appearance-none"
                >
                  <option value="all">Global Shards</option>
                  <option value="document">Text Assets</option>
                  <option value="image">Visual Buffers</option>
                  <option value="video">Motion Vectors</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none rotate-90" />
            </div>
          </div>
        </div>

        {/* Shard Registry */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="w-12 h-12 border-4 border-gray-100 border-t-[#66B2D6] rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Syncing Permissions...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-32 px-6">
              <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Lock className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Isolated Registry</h3>
              <p className="text-sm font-medium text-gray-400 max-w-sm mx-auto leading-relaxed">
                No external shards have been indexed. Artifacts shared by collaborators will materialize here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Resource Shard</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Source Hub</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Indexing Date</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Payload</th>
                    <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Logic Access</th>
                    <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredFiles.map((file) => (
                    <tr key={file.fileId} className="group hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-white border border-gray-100 rounded-[1rem] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5 text-[#66B2D6]" />
                          </div>
                          <span className="text-sm font-bold text-gray-900 truncate max-w-[200px]" title={file.fileName} id={`file-name-${file.fileId}`}>
                            {file.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center text-[10px] font-black text-[#66B2D6]">
                            {file.sharedBy.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-gray-600">{file.sharedBy}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-medium text-gray-400 tracking-wide">{formatDate(file.sharedAt)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-xs font-black text-gray-900">{formatFileSize(file.size)}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            file.permission === "editor"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-[#66B2D6]/10 text-[#66B2D6] border border-[#66B2D6]/20"
                          }`}
                        >
                          {file.permission}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            id={`preview-artifact-${file.fileId}`}
                            onClick={(e) => {
                              e.preventDefault();
                              const statusStr = String(user?.subscriptionStatus || "").toLowerCase().trim();
                               if (statusStr === "halted" || statusStr === "expired") {
                                showToast("Encryption Lockdown: Access Restored upon sync", "warning");
                                return;
                              }
                              window.open(`${BASE_URL}/file/${file.fileId}`, '_blank');
                            }}
                            className="p-3 text-gray-300 hover:text-gray-900 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100 hover:shadow-sm active:scale-95"
                            title="Metadata Scan"
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            id={`download-artifact-${file.fileId}`}
                            onClick={(e) => {
                              e.preventDefault();
                              const statusStr = String(user?.subscriptionStatus || "").toLowerCase().trim();
                              if (statusStr === "halted" || statusStr === "expired") {
                                showToast("Egress Restricted: Node Synchronization Required", "warning");
                                return;
                              }
                              window.location.href = `${BASE_URL}/file/${file.fileId}?action=download`;
                            }}
                            className="p-3 text-gray-300 hover:text-gray-900 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100 hover:shadow-sm active:scale-95"
                            title="Secure Egress"
                          >
                            <Download className="w-4.5 h-4.5" />
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

      {/* Modern Notification Module */}
      {toast.show && (
        <div className="fixed bottom-10 right-10 z-[110] max-w-sm w-full animate-slideUp">
          <div className="bg-white border border-gray-100 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] p-6 flex items-start gap-5 backdrop-blur-md">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
              toast.type === 'warning' ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-[#66B2D6]/10 text-[#66B2D6] border-[#66B2D6]/20'
            }`}>
              {toast.type === 'warning' ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm font-black text-gray-900 uppercase tracking-widest leading-tight">Protocol Alert</p>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">{toast.message}</p>
            </div>
            <button onClick={() => setToast({ ...toast, show: false })} className="text-gray-300 hover:text-gray-900 transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SharedWithMePage;
