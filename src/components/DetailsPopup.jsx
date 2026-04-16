import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Folder,
  File,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Archive,
  FileCode,
  X,
  Download,
  MapPin,
  Database,
  Calendar,
  Clock,
  Shield,
  ChevronRight,
  Info
} from "lucide-react";

export const formatSize = (bytes) => {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;
  if (bytes >= GB) return (bytes / GB).toFixed(2) + " GB";
  if (bytes >= MB) return (bytes / MB).toFixed(2) + " MB";
  if (bytes >= KB) return (bytes / KB).toFixed() + " KB";
  return bytes + " B";
};

function DetailsPopup({ item, onClose, BASE_URL, subscriptionStatus, showToast }) {
  if (!item) return null;

  const [details, setDetails] = useState({
    path: "Loading...",
    size: 0,
    createdAt: new Date().toLocaleString(),
    updatedAt: new Date().toLocaleString(),
    numberOfFiles: 0,
    numberOfFolders: 0,
  });

  const { id, name, isDirectory, size, createdAt, updatedAt } = item;
  const { path, numberOfFiles, numberOfFolders } = details;

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const url = isDirectory
          ? `${BASE_URL}/directory/${id}`
          : `${BASE_URL}/file/details/${id}`;
        const response = await fetch(url, { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          const pathArray = data.path || [];
          let pathStr = "";
          if (pathArray.length > 0) {
            const displayPath = [...pathArray];
            if (displayPath[0]) displayPath[0].name = "My Drive";
            pathStr = displayPath.map((p) => p.name).join(" / ");
          } else {
            pathStr = "My Drive";
          }
          pathStr += ` / ${name}`;
          setDetails((prev) => ({
            ...prev,
            path: pathStr,
            numberOfFiles: data.totalFiles || 0,
            numberOfFolders: data.totalFolders || 0,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch details", err);
        setDetails((prev) => ({ ...prev, path: "Error fetching registry path" }));
      }
    }
    fetchDetails();
  }, [id, isDirectory, BASE_URL, name]);

  const getFileType = (fileName) => {
    if (isDirectory) return "folder";
    const ext = fileName?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (["mp4", "webm", "ogg", "mov", "avi"].includes(ext)) return "video";
    if (["mp3", "wav"].includes(ext)) return "audio";
    if (ext === "pdf") return "pdf";
    if (["txt", "md", "js", "json", "html", "css", "py", "java", "jsx", "ts", "tsx"].includes(ext)) return "code";
    if (["zip", "rar", "tar", "gz"].includes(ext)) return "archive";
    return "file";
  };

  const getIcon = (type) => {
    const cls = "w-6 h-6";
    switch (type) {
      case "folder":  return <Folder    className={cls} style={{ color: "#66B2D6" }} />;
      case "image":   return <ImageIcon  className={cls} style={{ color: "#9333EA" }} />;
      case "video":   return <Video      className={cls} style={{ color: "#DC2626" }} />;
      case "audio":   return <Music      className={cls} style={{ color: "#EAB308" }} />;
      case "pdf":     return <FileText   className={cls} style={{ color: "#DC2626" }} />;
      case "code":    return <FileCode   className={cls} style={{ color: "#10B981" }} />;
      case "archive": return <Archive    className={cls} style={{ color: "#F97316" }} />;
      default:        return <File       className={cls} style={{ color: "#A3C5D9" }} />;
    }
  };

  const itemType = getFileType(name);
  const ext = !isDirectory && name?.includes(".") ? name.split(".").pop().toUpperCase() : null;

  const handleDownload = () => {
    const statusStr = String(subscriptionStatus || "").toLowerCase().trim();
    if (["halted", "expired", "paused"].includes(statusStr)) {
      showToast("Access Restricted: Your subscription is currently paused.", "warning");
      return;
    }
    window.location.href = `${BASE_URL}/file/${item.id}?action=download`;
  };

  const DetailRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-0 group/row">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 group-hover/row:border-[#66B2D6]/30 transition-colors">
           <Icon className="w-3.5 h-3.5 text-gray-400 group-hover/row:text-[#66B2D6] transition-colors" />
        </div>
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xs font-bold text-gray-900 text-right break-all max-w-[180px] leading-relaxed ml-4">{value}</span>
    </div>
  );

  const modal = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2.5rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] w-full max-w-sm flex flex-col overflow-hidden animate-scaleIn border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="bg-gray-50/50 p-8 border-b border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#66B2D6]/5 rounded-bl-[4rem] -z-10" />
            
            <div className="flex items-start justify-between gap-4 mb-6">
                 <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    {getIcon(itemType)}
                 </div>
                 <button
                    onClick={onClose}
                    className="p-2 rounded-xl text-gray-300 hover:text-gray-900 hover:bg-white border border-transparent hover:border-gray-100 transition-all active:scale-95"
                 >
                    <X className="w-5 h-5" />
                 </button>
            </div>

            <div className="space-y-1">
                <p className="text-[10px] font-black text-[#66B2D6] uppercase tracking-[0.3em]">Metadata Registry</p>
                <h3 className="text-xl font-black text-gray-900 tracking-tight break-all line-clamp-2 leading-tight" title={name}>
                    {name}
                </h3>
            </div>
        </div>

        {/* Content Section */}
        <div className="p-8 overflow-y-auto" style={{ maxHeight: "40vh" }}>
           {!isDirectory && (
             <DetailRow label="Payload Size" value={formatSize(size || 0)} icon={Database} />
           )}
           {isDirectory && (
             <>
               <DetailRow label="Asset Cluster" value={`${numberOfFiles} Files`} icon={File} />
               <DetailRow label="Resource Nodes" value={`${numberOfFolders} Folders`} icon={Folder} />
             </>
           )}
           <DetailRow
             label="Deployment"
             icon={Calendar}
             value={new Date(createdAt).toLocaleString("en-US", {
               month: "short", day: "numeric", year: "numeric",
               hour: "2-digit", minute: "2-digit",
             })}
           />
           <DetailRow
             label="Sync Cycle"
             icon={Clock}
             value={new Date(updatedAt).toLocaleString("en-US", {
               month: "short", day: "numeric", year: "numeric",
               hour: "2-digit", minute: "2-digit",
             })}
           />
           <DetailRow label="Grid Location" icon={MapPin} value={path} />
        </div>

        {/* Footer Section */}
        <div className="p-8 pt-0">
            <div className="flex flex-col gap-3">
                {!isDirectory && (
                    <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 border border-transparent rounded-[1.25rem] text-xs font-black text-white uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 group/btn"
                    >
                        <Download className="w-4 h-4 text-[#66B2D6] group-hover/btn:translate-y-0.5 transition-transform" />
                        Secure Egress Extract
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="w-full py-4 bg-white border border-gray-200 rounded-[1.25rem] text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 hover:border-gray-900 transition-all font-bold"
                >
                    Inactivate Focus
                </button>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-2">
                 <Shield className="w-3 h-3 text-emerald-500" />
                 <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest whitespace-nowrap">
                   Secure Infrastructure Node
                 </span>
            </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default DetailsPopup;
