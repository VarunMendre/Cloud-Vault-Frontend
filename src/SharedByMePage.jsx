import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import DirectoryHeader from "./components/DirectoryHeader";
import { 
  ArrowLeft, 
  FileText, 
  Search, 
  Users, 
  LayoutGrid, 
  Settings2,
  ChevronDown,
  ChevronRight
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function SharedByMePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchSharedFiles();
  }, []);

  const fetchSharedFiles = async () => {
    try {
      const response = await fetch(`${BASE_URL}/share/shared-by-me`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setSharedFiles(data);
      }
    } catch (err) {
      console.error("Error fetching shared files:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredFiles = sharedFiles.filter((file) => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || file.fileType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-[#1A202C]">
      <DirectoryHeader
        directoryName="Shared By Me"
        path={[]}
        userName={user?.name || "User"}
        userEmail={user?.email || ""}
        userPicture={user?.picture}
        userRole={user?.role || "User"}
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
                <Users className="w-6 h-6 text-[#22C55E]" />
              </div>
              <div>
                <h1 className="text-[28px] font-bold text-[#1A202C] leading-tight">Shared by Me</h1>
                <p className="text-[14px] text-[#718096]">Manage and monitor assets you have shared</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E8F0] rounded-[10px] shadow-sm text-[13px] font-bold text-[#1A202C]">
            <span className="text-[#22C55E] bg-[#F0FDF4] px-2 py-0.5 rounded-md border border-[#BBF7D0]">{filteredFiles.length}</span> active shares
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-[16px] p-4 border border-[#E2E8F0] shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096]" />
            <input
              type="text"
              placeholder="Search shared items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#F0F2F5] border border-transparent rounded-[10px] text-[14px] text-[#1A202C] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-all placeholder:text-[#718096]"
            />
          </div>
          <div className="relative w-full md:w-56">
             <select
               value={filterType}
               onChange={(e) => setFilterType(e.target.value)}
               className="w-full pl-4 pr-10 py-2.5 bg-[#F0F2F5] border border-transparent rounded-[10px] text-[14px] text-[#1A202C] focus:outline-none focus:border-[#22C55E] focus:bg-white transition-all cursor-pointer appearance-none shrink-0 font-semibold"
             >
              <option value="all">All Items</option>
              <option value="document">Documents</option>
              <option value="image">Images</option>
              <option value="directory">Folders</option>
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718096] pointer-events-none" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#E2E8F0] overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-8 h-8 border-4 border-[#F0F2F5] border-t-[#22C55E] rounded-full animate-spin"></div>
              <p className="text-[14px] font-semibold text-[#718096]">Fetching shared records...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-24 px-6">
              <div className="w-16 h-16 bg-[#F0F2F5] rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutGrid className="w-8 h-8 text-[#A0AEC0]" />
              </div>
              <h3 className="text-[18px] font-bold text-[#1A202C] mb-2">No active shares</h3>
              <p className="text-[14px] text-[#718096] max-w-sm mx-auto mb-6">
                You haven't shared any files or folders yet. Start collaborating by sharing your work.
              </p>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22C55E] text-white rounded-[10px] text-[14px] font-semibold hover:bg-green-600 transition-colors"
              >
                Go to My Drive
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#F0F2F5] border-b border-[#E2E8F0]">
                    <th className="px-6 py-3 text-[12px] font-bold text-[#718096] uppercase tracking-wider">Shared Item</th>
                    <th className="px-6 py-3 text-[12px] font-bold text-[#718096] uppercase tracking-wider">Recipients</th>
                    <th className="px-6 py-3 text-[12px] font-bold text-[#718096] uppercase tracking-wider">Shared On</th>
                    <th className="px-6 py-3 text-[12px] font-bold text-[#718096] uppercase tracking-wider">Access</th>
                    <th className="px-6 py-3 text-[12px] font-bold text-[#718096] uppercase tracking-wider text-right">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredFiles.map((file) => (
                    <tr key={file.fileId} className="hover:bg-[#F0FDF4] transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-[#E2E8F0] rounded-[8px] flex items-center justify-center shadow-sm text-[#22C55E]">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="text-[15px] font-semibold text-[#1A202C] truncate max-w-[200px]" title={file.fileName}>
                            {file.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {file.sharedWith.slice(0, 3).map((u, idx) => (
                              <div
                                key={idx}
                                className="w-8 h-8 rounded-full bg-[#1A202C] border-2 border-white shadow-sm flex items-center justify-center text-[11px] font-bold text-white relative z-10"
                                title={u.name}
                              >
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                          </div>
                          {file.sharedWith.length > 3 && (
                            <span className="text-[12px] font-bold text-[#718096] bg-[#F0F2F5] px-2 py-0.5 rounded-md border border-[#E2E8F0] ml-1">
                              +{file.sharedWith.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[14px] text-[#718096]">{formatDate(file.sharedAt)}</span>
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
                        <button 
                          onClick={() => navigate(`/share/manage/${file.fileType === 'directory' ? 'folder' : 'file'}/${file.fileId}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold text-[#718096] hover:text-[#22C55E] hover:bg-white bg-[#F0F2F5] rounded-[8px] shadow-sm transition-all border border-[#E2E8F0]"
                        >
                          <Settings2 className="w-4 h-4" />
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SharedByMePage;
