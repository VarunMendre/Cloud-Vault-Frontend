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
} from "lucide-react";

export const formatSize = (bytes) => {
  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;
  if (bytes >= GB) return (bytes / GB).toFixed(2) + " GB";
  if (bytes >= MB) return (bytes / MB).toFixed(2) + " MB";
  if (bytes >= KB) return (bytes / KB).toFixed(2) + " KB";
  return bytes + " B";
};

function DetailsPopup({ item, onClose, BASE_URL }) {
  if (!item) return null;

  const [details, setDetails] = useState({
    path: "Loading...",
    size: 0,
    createdAt: new Date().toLocaleString(),
    updatedAt: new Date().toLocaleString(),
    isShared: "No",
  });

  const { id, name, isDirectory, size, createdAt, updatedAt } = item;

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
            pathStr = "/" + pathArray.map((p) => p.name).join("/") + "/" + name;
            pathStr = pathStr.replace("//", "/");
          } else {
            pathStr = "/root/" + name;
          }
          
          setDetails((prev) => ({
            ...prev,
            path: pathStr,
            isShared: data.sharedWith && data.sharedWith.length > 0 ? "Yes" : "No",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch details", err);
        setDetails((prev) => ({ ...prev, path: "Error fetching path" }));
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
    if (["txt", "md", "js", "json", "html", "css", "py", "java", "jsx", "ts", "tsx", "xlsx", "xls", "doc", "docx"].includes(ext)) return "code";
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

  const DetailRow = ({ label, value }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors px-2">
      <span className="text-sm font-medium text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-[#344767] text-right break-all max-w-[240px] leading-relaxed ml-4">
        {value}
      </span>
    </div>
  );

  const modal = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-md flex flex-col overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h3 className="text-lg font-bold text-[#344767]">Details</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Info Section */}
        <div className="px-6 py-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
            {getIcon(itemType)}
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-bold text-[#344767] truncate" title={name}>{name}</h4>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{isDirectory ? "Folder" : "File"}</p>
          </div>
        </div>

        {/* Details Table Section */}
        <div className="px-6 pb-8">
          <div className="bg-white rounded-xl border border-gray-50 overflow-hidden">
            {!isDirectory && (
              <DetailRow label="Size" value={formatSize(size || 0)} />
            )}
            <DetailRow
              label="Created"
              value={new Date(createdAt).toLocaleString("en-US", {
                month: "short", day: "numeric", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            />
            <DetailRow
              label="Modified"
              value={new Date(updatedAt).toLocaleString("en-US", {
                month: "short", day: "numeric", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            />
            <DetailRow label="Path" value={details.path} />
            <DetailRow label="Shared via link" value={details.isShared} />
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default DetailsPopup;
