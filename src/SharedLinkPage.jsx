import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  File, 
  Image as ImageIcon, 
  Download, 
  AlertTriangle, 
  Pencil, 
  Eye,
  ShieldCheck,
  Lock,
  ArrowRight,
  User,
  Info,
  X,
  ChevronRight,
  FileText,
  Clock
} from "lucide-react";
import RenameModal from "./components/RenameModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function SharedLinkPage() {
  const { token } = useParams();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Custom Toast State
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 4000);
  };

  const [error, setError] = useState("");
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [extensionError, setExtensionError] = useState("");
  const [originalExtension, setOriginalExtension] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        const response = await fetch(`${BASE_URL}/share/link/${token}`);
        if (!response.ok) {
           const data = await response.json();
           throw new Error(data.error || "Failed to load shared file");
        }
        const data = await response.json();
        setFileData(data);
      } catch (err) {
        console.error("Error fetching shared file:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSharedFile();
    }
  }, [token]);

  const openRenameModal = () => {
      setRenameValue(fileData.name);
      const dotIndex = fileData.name.lastIndexOf(".");
      if (dotIndex > 0) {
        setOriginalExtension(fileData.name.substring(dotIndex));
      } else {
        setOriginalExtension("");
      }
      setExtensionError("");
      setShowRenameModal(true);
  };

  const validateExtension = (newName) => {
    if (!originalExtension) return true;
    const newDotIndex = newName.lastIndexOf(".");
    if (newDotIndex === -1) {
      setExtensionError(`File extension "${originalExtension}" is required`);
      return false;
    }
    const newExtension = newName.substring(newDotIndex);
    if (newExtension !== originalExtension) {
      setExtensionError(`Extension must remain "${originalExtension}"`);
      return false;
    }
    setExtensionError("");
    return true;
  };

  const handleRenameChange = (newValue) => {
    setRenameValue(newValue);
    validateExtension(newValue);
  };

  const handleRenameSubmit = async (e) => {
    e.preventDefault();
    if (!validateExtension(renameValue)) return;
    
    setIsRenaming(true);
    try {
        const response = await fetch(`${BASE_URL}/file/${fileData._id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-Share-Token": token,
            },
            body: JSON.stringify({ newFilename: renameValue }),
            credentials: "include", 
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to rename file");
        }

        setFileData(prev => ({ ...prev, name: renameValue }));
        setShowRenameModal(false);
        showToast("Infrastructure node updated!", "success");

    } catch (err) {
        showToast(err.message, "error");
    } finally {
        setIsRenaming(false);
    }
  };

  const isImage = fileData?.fileType?.startsWith("image/") || fileData?.mimeType?.startsWith("image/");
  const isVideo = fileData?.fileType?.startsWith("video/") || fileData?.mimeType?.startsWith("video/");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#66B2D6] rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Gateway...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-2xl p-10 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-red-100">
                <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Node Unavailable</h2>
            <p className="text-sm font-medium text-gray-400 mb-8 leading-relaxed">{error}</p>
            <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pt-8 border-t border-gray-100">404 - ACCESS DENIED</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto space-y-8 animate-fadeIn">
        
        {/* Gateway Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center rotate-3">
                    <Lock className="w-6 h-6 text-[#66B2D6]" />
                </div>
                <div>
                   <h2 className="text-xs font-black text-[#66B2D6] uppercase tracking-[0.3em] mb-1">Encrypted Gateway</h2>
                   <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                      <Clock className="w-3 h-3" />
                      SYSTEM STATUS: ACTIVE
                   </div>
                </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Node Type:</p>
                <p className="text-[11px] font-black text-gray-900 uppercase tracking-wider">{fileData?.role === 'editor' ? 'Bidirectional' : 'Egress Only'}</p>
            </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden group">
          {/* File Info Section */}
          <div className="p-8 sm:p-12">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-10">
                  <div className="space-y-4 max-w-2xl">
                    <div className="flex items-center gap-3">
                        {fileData?.role === 'editor' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black bg-green-50 text-green-600 uppercase tracking-widest border border-green-100">
                                <Pencil className="w-3 h-3" />
                                Editor Ingress
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black bg-gray-50 text-gray-600 uppercase tracking-widest border border-gray-200">
                                <Eye className="w-3 h-3" />
                                Secure Viewer
                            </span>
                        )}
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">SIZE: {fileData?.size ? (fileData.size / 1024 / 1024).toFixed(2) + ' MB' : 'UNK'}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight break-all leading-tight">
                        {fileData?.name}
                    </h1>
                    <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100 w-fit">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                            <User className="w-4 h-4 text-gray-300" />
                        </div>
                        <p className="text-xs font-bold text-gray-400">
                            Shared by <span className="text-gray-900">{fileData?.owner?.name || "System Base"}</span>
                        </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      {fileData?.downloadUrl && (
                          <a
                              href={fileData.downloadUrl}
                              download
                              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#66B2D6] text-white rounded-2xl font-bold transition-all shadow-lg shadow-[#66B2D6]/20 hover:bg-[#5aa0c1] hover:scale-[1.02] active:scale-[0.98] text-sm"
                          >
                              <Download className="w-4 h-4" />
                              Download
                          </a>
                      )}
                      {fileData?.role === 'editor' && (
                        <button
                          onClick={openRenameModal}
                          className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-[#66B2D6]/30 transition-all font-bold shadow-sm text-sm"
                        >
                          <Pencil className="w-4 h-4" />
                          Modify Node
                        </button>
                      )}
                  </div>
              </div>

              {/* Preview Container */}
              <div className="relative rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-100 flex justify-center items-center min-h-[450px] group/preview">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [background-position:center] opacity-40"></div>
                {isImage ? (
                  <div className="relative p-8 w-full h-full flex items-center justify-center">
                    <img
                      src={fileData.downloadUrl || fileData.previewUrl} 
                      alt={fileData.name}
                      className="max-w-full max-h-[60vh] rounded-2xl shadow-2xl object-contain transition-transform duration-500 group-hover/preview:scale-[1.02]"
                    />
                  </div>
                ) : isVideo ? (
                  <div className="w-full max-w-3xl p-4">
                    <video controls className="w-full rounded-2xl shadow-2xl border border-gray-200">
                      <source src={fileData.downloadUrl} type={fileData.fileType || fileData.mimeType} />
                      Node visualization not supported.
                    </video>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-12 relative animate-fadeIn">
                    <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl border border-gray-100 rotate-6 group-hover/preview:rotate-0 transition-transform duration-500">
                      <FileText className="w-16 h-16 text-gray-200" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Visual Egress Locked</h3>
                    <p className="text-sm font-medium text-gray-400 max-w-xs leading-relaxed">
                        This file format requires local rendering. Use the download trigger to access raw data packets.
                    </p>
                  </div>
                )}
              </div>
          </div>
          
          {/* Footer Metadata */}
          <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
             <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> End-to-End Encrypted
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> SHA-256 Verified
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5 text-[#66B2D6]" /> Secure Protocol v2.4
             </div>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="text-center pt-8">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Secured by CloudVault</p>
            <div className="flex items-center justify-center gap-6">
                <button className="text-[10px] font-black text-gray-300 hover:text-gray-900 uppercase tracking-widest transition-colors">Privacy Infrastructure</button>
                <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                <button className="text-[10px] font-black text-gray-300 hover:text-gray-900 uppercase tracking-widest transition-colors">Compliance Protocols</button>
            </div>
        </div>
      </div>

      {showRenameModal && (
        <RenameModal
            renameType="file"
            renameValue={renameValue}
            setRenameValue={handleRenameChange}
            onClose={() => setShowRenameModal(false)}
            onRenameSubmit={handleRenameSubmit}
            extensionError={extensionError}
            isProcessing={isRenaming}
        />
      )}

      {/* Modern Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-8 right-8 z-[100] max-w-sm w-full animate-slideInRight">
          <div className="bg-[#1A1C1E] rounded-2xl shadow-2xl p-4 flex items-start gap-4 border border-white/5 backdrop-blur-md">
            <div className={classNames(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
              toast.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
              toast.type === 'success' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
              'bg-[#66B2D6]/10 text-[#66B2D6] border-[#66B2D6]/20'
            )}>
              {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : 
               toast.type === 'success' ? <ShieldCheck className="w-5 h-5" /> :
               <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1 pt-1 text-left">
              <p className="text-sm font-bold text-white leading-tight">System Notification</p>
              <p className="text-[11px] font-medium text-gray-400 mt-1">{toast.message}</p>
            </div>
            <button onClick={() => setToast({ ...toast, show: false })} className="text-gray-500 hover:text-white transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default SharedLinkPage;
