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
    if (["txt", "md", "js", "json", "html", "css", "py", "java", "jsx", "ts", "tsx"].includes(ext)) return "code";
    if (["zip", "rar", "tar", "gz"].includes(ext)) return "archive";
    return "file";
  };

  const getIcon = (type) => {
    const cls = "w-7 h-7";
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

  const Row = ({ label, value }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 font-medium w-24 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-800 font-semibold text-right break-all leading-relaxed ml-2">{value}</span>
    </div>
  );

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-scaleIn"
        style={{ border: "1px solid #e5e7eb" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {/* File icon */}
            <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
              {getIcon(itemType)}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate max-w-[180px]" title={name}>
                {name}
              </p>
              {ext ? (
                <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-gray-100 text-gray-500 tracking-wide">
                  {ext}
                </span>
              ) : (
                <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-blue-50 text-blue-500 tracking-wide">
                  Folder
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Details rows */}
        <div className="px-5 py-2 overflow-y-auto" style={{ maxHeight: "60vh" }}>
          {!isDirectory && (
            <Row label="Size" value={formatSize(size || 0)} />
          )}
          {isDirectory && (
            <>
              <Row label="Files" value={String(numberOfFiles)} />
              <Row label="Folders" value={String(numberOfFolders)} />
            </>
          )}
          <Row
            label="Created"
            value={new Date(createdAt).toLocaleString("en-US", {
              month: "short", day: "numeric", year: "numeric",
              hour: "2-digit", minute: "2-digit", hour12: true,
            })}
          />
          <Row
            label="Modified"
            value={new Date(updatedAt).toLocaleString("en-US", {
              month: "short", day: "numeric", year: "numeric",
              hour: "2-digit", minute: "2-digit", hour12: true,
            })}
          />
          <Row label="Location" value={path} />
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50/60">
          {!isDirectory && (
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-xs font-semibold text-white transition-all"
            style={{ backgroundColor: "#66B2D6" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default DetailsPopup;
