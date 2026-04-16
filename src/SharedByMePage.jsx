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
    <div className="min-h-screen bg-gray-50">
      <DirectoryHeader
        directoryName="Shared By Me"
        path={[]}
        userName={user?.name || "Guest User"}
        userEmail={user?.email || "guest@example.com"}
        userPicture={user?.picture}
        userRole={user?.role || "User"}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate("/share")}
              className="group flex items-center gap-2 mb-4 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center">
                <Users className="w-6 h-6 text-[#66B2D6]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shared by Me</h1>
                <p className="text-sm font-medium text-gray-400">Manage and monitor assets you've shared with your team</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-400 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-[#66B2D6]">{filteredFiles.length}</span>
            <span>active shares</span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#66B2D6] transition-colors" />
            <input
              type="text"
              placeholder="Search shared items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#66B2D6] focus:bg-white transition-all outline-none"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full md:w-48 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 focus:outline-none focus:border-[#66B2D6] transition-all outline-none cursor-pointer appearance-none"
            >
              <option value="all">All Items</option>
              <option value="document">Documents</option>
              <option value="image">Images</option>
              <option value="directory">Folders</option>
            </select>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-10 h-10 border-4 border-gray-100 border-t-[#66B2D6] rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Fetching shared records...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-24 px-6">
              <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <LayoutGrid className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No shares detected</h3>
              <p className="text-sm font-medium text-gray-400 max-w-xs mx-auto mb-8">
                You haven't shared any files or folders yet. Start collaborating by sharing your work.
              </p>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#66B2D6] text-white rounded-xl text-sm font-bold hover:bg-[#5aa0c1] transition-all shadow-sm hover:-translate-y-0.5"
              >
                Go to My Drive
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Shared Item</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Recipients</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Shared Date</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Global Access</th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredFiles.map((file) => (
                    <tr key={file.fileId} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                            <FileText className="w-4.5 h-4.5 text-[#66B2D6]" />
                          </div>
                          <span className="text-sm font-bold text-gray-700 truncate max-w-[200px] sm:max-w-xs transition-colors group-hover:text-black">
                            {file.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2.5">
                            {file.sharedWith.slice(0, 3).map((u, idx) => (
                              <div
                                key={idx}
                                className="w-7 h-7 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center ring-1 ring-gray-100"
                                title={u.name}
                              >
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            ))}
                          </div>
                          {file.sharedWith.length > 3 && (
                            <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                              +{file.sharedWith.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-400">{formatDate(file.sharedAt)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            file.permission === "editor"
                              ? "bg-green-50 text-green-600 border border-green-100"
                              : "bg-[#66B2D6]/10 text-[#66B2D6] border border-[#66B2D6]/20"
                          }`}
                        >
                          {file.permission}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => navigate(`/share/manage/${file.fileType === 'directory' ? 'folder' : 'file'}/${file.fileId}`)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-[#66B2D6] hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200 hover:shadow-sm"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                          Permissions
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
