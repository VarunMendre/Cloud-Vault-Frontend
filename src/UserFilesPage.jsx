import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  Pencil,
  File,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Download,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  Lock,
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Search,
  MoreVertical,
  Clock,
  HardDrive
} from "lucide-react";
import DirectoryHeader, { BASE_URL } from "./components/DirectoryHeader";
import { useAuth } from "./context/AuthContext";

export default function UserFilesPage() {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [targetUser, setTargetUser] = useState(location.state?.user || null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [newFileName, setNewFileName] = useState("");
  const [extensionError, setExtensionError] = useState("");
  const [previewFileUrl, setPreviewFileUrl] = useState("");
  const [previewFileType, setPreviewFileType] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  const hasInitialized = useRef(false);
  const renameInputRef = useRef(null);

  useEffect(() => {
    if (hasInitialized.current) return;
    
    const initData = async () => {
      let tUser = targetUser;
      if (!tUser) {
        try {
          const res = await fetch(`${BASE_URL}/users`, { credentials: "include" });
          if (res.ok) {
            const usersList = await res.json();
            tUser = usersList.find((u) => (u._id || u.id) === userId);
            if (tUser) {
              setTargetUser(tUser);
            } else {
              navigate("/users");
              return;
            }
          } else {
            navigate("/users");
            return;
          }
        } catch (err) {
          console.error("Error fetching users:", err);
          navigate("/users");
          return;
        }
      }

      if (tUser) {
        await fetchFiles();
      }
      
      hasInitialized.current = true;
    };

    initData();
  }, [userId, currentUser]);

  const fetchFiles = async () => {
    setLoading(false); // Immediate feedback
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}/files`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || data);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const getFileType = (fileName) => {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (["mp4", "webm", "ogg", "mov"].includes(ext)) return "video";
    if (["mp3", "wav"].includes(ext)) return "audio";
    if (ext === "pdf") return "pdf";
    if (["txt", "md", "js", "json", "html", "css"].includes(ext)) return "text";
    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) return "office";
    return "download";
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "image": return <ImageIcon className="w-6 h-6 text-indigo-500" />;
      case "video": return <Video className="w-6 h-6 text-rose-500" />;
      case "audio": return <Music className="w-6 h-6 text-amber-500" />;
      case "pdf": return <FileText className="w-6 h-6 text-red-500" />;
      case "text": return <FileText className="w-6 h-6 text-slate-500" />;
      case "office": return <FileText className="w-6 h-6 text-blue-500" />;
      default: return <File className="w-6 h-6 text-gray-400" />;
    }
  };

  const handleViewClick = async (file) => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}/files/${file._id || file.id}/view?format=json`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setPreviewFileUrl(data.url);
        setPreviewFileType(getFileType(file.name));
        setShowFilePreview(true);
      } else {
        console.error("Failed to fetch file view:", response.status);
      }
    } catch (err) {
      console.error("Error viewing file:", err);
    }
  };

  const handleRenameClick = (file) => {
    setSelectedFile(file);
    setNewFileName(file.name);
    setShowRenameModal(true);
  };

  useEffect(() => {
    if (showRenameModal && renameInputRef.current && newFileName) {
      const lastDotIndex = newFileName.lastIndexOf('.');
      renameInputRef.current.focus();
      if (lastDotIndex > 0) {
        renameInputRef.current.setSelectionRange(0, lastDotIndex);
      } else {
        renameInputRef.current.select();
      }
    }
  }, [showRenameModal]);

  useEffect(() => {
    if (!selectedFile || !newFileName) {
      setExtensionError("");
      return;
    }
    const originalName = selectedFile.name;
    const originalExt = originalName.includes('.') ? originalName.split('.').pop().toLowerCase() : '';
    const newExt = newFileName.includes('.') ? newFileName.split('.').pop().toLowerCase() : '';
    if (originalExt && !newExt) {
      setExtensionError("Extension required");
    } else if (originalExt && newExt && originalExt !== newExt) {
      setExtensionError(`Must remain .${originalExt}`);
    } else {
      setExtensionError("");
    }
  }, [newFileName, selectedFile]);

  const confirmRenameFile = async () => {
    if (!selectedFile || !newFileName.trim()) return;
    setIsRenaming(true);
    try {
      const response = await fetch(
        `${BASE_URL}/users/${userId}/files/${selectedFile._id || selectedFile.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newFileName.trim() }),
        }
      );
      if (response.ok) {
        setShowRenameModal(false);
        fetchFiles();
      }
    } catch (err) {
      console.error("Rename error:", err);
    } finally {
      setIsRenaming(false);
    }
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DirectoryHeader
        directoryName="Admin Access"
        userName={currentUser?.name || "Guest User"}
        userEmail={currentUser?.email || "guest@example.com"}
        userPicture={currentUser?.picture || ""}
        userRole={currentUser?.role || "User"}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 space-y-8 animate-fadeIn">
        
        {/* Navigation & Profile */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 group">
            <button
                onClick={() => !isRenaming && navigate("/users")}
                disabled={isRenaming}
                className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl transition-all text-sm font-bold text-gray-600 hover:text-[#66B2D6] hover:border-[#66B2D6]/30 hover:shadow-lg hover:shadow-[#66B2D6]/5 disabled:opacity-50"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Directory</span>
            </button>

            {targetUser && (
                <div className="flex items-center gap-4 bg-white p-2 pr-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                    <div className="relative">
                        {targetUser.picture ? (
                            <img
                                src={targetUser.picture}
                                alt={targetUser.name}
                                className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-sm"
                            />
                        ) : (
                            <div className="w-11 h-11 rounded-xl bg-[#66B2D6]/10 flex items-center justify-center text-[#66B2D6] font-bold text-sm border-2 border-white shadow-sm">
                                {targetUser.name.charAt(0)}
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-900 leading-tight">{targetUser.name}</div>
                        <div className="text-[11px] text-gray-400 font-medium">{targetUser.email}</div>
                    </div>
                    <div className="h-6 w-px bg-gray-100 mx-2"></div>
                    <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg bg-gray-50 text-gray-500 border border-gray-100">
                        {targetUser.role}
                    </span>
                </div>
            )}
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-white">
                <div>
                   <h2 className="text-lg font-bold text-gray-900 tracking-tight">User Infrastructure</h2>
                   <p className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider">Verifying shared nodes and egress logs</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[#66B2D6] transition-colors" />
                        <input
                            type="text"
                            placeholder="Find file nodes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#66B2D6]/10 focus:border-[#66B2D6] transition-all"
                        />
                    </div>
                    <button 
                        onClick={fetchFiles}
                        className="p-2.5 bg-gray-50 text-gray-400 rounded-xl border border-gray-100 hover:text-[#66B2D6] hover:bg-white hover:border-[#66B2D6]/20 transition-all shadow-sm"
                    >
                        <Clock className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="p-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-12 h-12 border-4 border-gray-100 border-t-[#66B2D6] rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] animate-pulse">Scanning Clusters...</p>
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-gray-100 rotate-6 group-hover:rotate-0 transition-transform duration-500">
                            <HardDrive className="w-10 h-10 text-gray-200" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Active Nodes Found</h3>
                        <p className="text-xs font-medium text-gray-400 max-w-xs leading-relaxed uppercase tracking-wider">
                            The requested subdirectory contains zero verified file pointers.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredFiles.map((file) => (
                            <div
                                key={file._id || file.id}
                                className="group/card relative bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#66B2D6]/30 hover:shadow-xl hover:shadow-[#66B2D6]/5 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover/card:bg-white transition-colors">
                                        {getFileIcon(getFileType(file.name))}
                                    </div>
                                    <div className="opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-1">
                                        <button
                                            onClick={() => !isRenaming && handleViewClick(file)}
                                            className="p-1.5 text-gray-400 hover:text-[#66B2D6] hover:bg-[#66B2D6]/5 rounded-lg transition-all"
                                            title="Secure View"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => !isRenaming && handleRenameClick(file)}
                                            className="p-1.5 text-gray-400 hover:text-[#66B2D6] hover:bg-[#66B2D6]/5 rounded-lg transition-all"
                                            title="Modify Header"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-gray-900 truncate tracking-tight" title={file.name}>
                                        {file.name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{getFileType(file.name)}</span>
                                        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">VERIFIED</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                        Protocols Active
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-gray-200 group-hover/card:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    <Lock className="w-3.5 h-3.5 text-indigo-500" /> Administrative Clearance: Level 4
                </div>
                <div className="text-[10px] font-bold text-gray-400">
                    Total Nodes: {filteredFiles.length}
                </div>
            </div>
        </div>
      </div>

      {/* Rename Modal */}
      {showRenameModal && selectedFile && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-200 max-w-sm w-full overflow-hidden animate-scaleIn">
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                   <div className="w-12 h-12 bg-[#66B2D6]/10 rounded-2xl flex items-center justify-center text-[#66B2D6] border border-[#66B2D6]/20">
                      <Pencil className="w-6 h-6" />
                   </div>
                   <button onClick={() => setShowRenameModal(false)} className="text-gray-300 hover:text-gray-900 transition-colors">
                      <X className="w-5 h-5" />
                   </button>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Modify Protocol Header</h3>
                <p className="text-xs font-medium text-gray-400 mb-8 uppercase tracking-wider">Updating target pointer metadata</p>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">NEW IDENTIFIER</label>
                        <input
                            ref={renameInputRef}
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-4 ${
                                extensionError ? 'border-red-100 ring-red-500/5 text-red-600' : 'border-gray-100 focus:border-[#66B2D6] focus:ring-[#66B2D6]/5 text-gray-900'
                            }`}
                        />
                        {extensionError && (
                            <p className="mt-2 text-[10px] font-bold text-red-500 uppercase tracking-widest px-1 animate-fadeIn">{extensionError}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={confirmRenameFile}
                            disabled={!newFileName.trim() || !!extensionError || isRenaming}
                            className="w-full py-4 bg-[#66B2D6] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#66B2D6]/20 hover:bg-[#5aa0c1] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isRenaming ? <Loader2 className="w-4 h-4 animate-spin" /> : "Commit Changes"}
                        </button>
                        <button
                            onClick={() => setShowRenameModal(false)}
                            className="w-full py-4 bg-white text-gray-400 hover:text-gray-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all"
                        >
                            Abort Operation
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showFilePreview && (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-xl flex items-center justify-center z-[150] p-4 lg:p-12 animate-fadeIn">
          <div className="relative w-full h-full flex flex-col items-center justify-center gap-6">
            <div className="absolute top-0 w-full flex items-center justify-between px-4 py-4 lg:px-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-md">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-white text-sm font-bold">Secure Environment</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Temporary Egress Active</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setShowFilePreview(false);
                        setPreviewFileUrl("");
                    }}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all backdrop-blur-md group"
                >
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                </button>
            </div>

            <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
              {previewFileType === "image" ? (
                <img
                  src={previewFileUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_100px_rgba(102,178,214,0.1)] border border-white/5"
                />
              ) : (
                <iframe
                  src={previewFileUrl}
                  className="w-full h-full bg-white rounded-3xl shadow-2xl border border-white/10"
                  title="File Preview"
                />
              )}
            </div>
            
            <div className="flex items-center gap-8 py-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                    <Clock className="w-4 h-4" /> 00:00 SESSION TIME
                </div>
                <button className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10 transition-all">
                    <Download className="w-3.5 h-3.5" /> Secure Egress
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
