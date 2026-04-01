import { useEffect, useState } from "react";
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
  Info,
  MapPin,
  Database,
  Calendar,
  Clock,
  Download,
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
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    async function fetchDetails() {
      try {
        let url;
        if (isDirectory) {
          url = `${BASE_URL}/directory/${id}`;
        } else {
          url = `${BASE_URL}/file/details/${id}`;
        }

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
    if (
      [
        "txt",
        "md",
        "js",
        "json",
        "html",
        "css",
        "py",
        "java",
        "jsx",
        "ts",
        "tsx",
      ].includes(ext)
    )
      return "code";
    if (["zip", "rar", "tar", "gz"].includes(ext)) return "archive";
    return "file";
  };

  const getIcon = (type) => {
    switch (type) {
      case "folder":
        return <Folder className="w-10 h-10" style={{ color: '#66B2D6' }} />;
      case "image":
        return <ImageIcon className="w-10 h-10" style={{ color: '#9333EA' }} />;
      case "video":
        return <Video className="w-10 h-10" style={{ color: '#DC2626' }} />;
      case "audio":
        return <Music className="w-10 h-10" style={{ color: '#EAB308' }} />;
      case "pdf":
        return <FileText className="w-10 h-10" style={{ color: '#DC2626' }} />;
      case "code":
        return <FileCode className="w-10 h-10" style={{ color: '#10B981' }} />;
      case "archive":
        return <Archive className="w-10 h-10" style={{ color: '#F97316' }} />;
      default:
        return <File className="w-10 h-10" style={{ color: '#A3C5D9' }} />;
    }
  };

  const itemType = getFileType(name);
  const typeLabel = isDirectory
    ? "FOLDER"
    : getFileType(name).toUpperCase();
    
  const handleDownload = () => {
    const statusStr = String(subscriptionStatus || "").toLowerCase().trim();
    if (["halted", "expired", "paused"].includes(statusStr)) {
      showToast("Access Restricted: Your subscription is currently paused.", "warning");
      return;
    }
    window.location.href = `${BASE_URL}/file/${item.id}?action=download`;
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[9999] p-4 animate-fadeIn modal-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl shadow-strong max-w-lg w-full max-h-[90vh] flex flex-col animate-scaleIn overflow-hidden border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border flex items-center justify-between bg-secondary/30">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-white shadow-sm ring-1 ring-border">
              <Info className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-text-main">Details</h3>
              <p className="text-xs font-medium text-muted mt-0.5 uppercase tracking-wider">
                {isDirectory ? "Folder" : "File"} information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-text-main hover:bg-secondary/50 transition-all p-2 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-5 sm:py-8 overflow-y-auto custom-scrollbar">
          {/* Item Preview */}
          <div className="flex items-center gap-3 sm:gap-5 mb-5 sm:mb-8 p-3 sm:p-5 bg-background border-2 border-border border-dashed rounded-xl sm:rounded-2xl">
            <div className="flex-shrink-0 scale-110">{getIcon(itemType)}</div>
            <div className="flex-1 min-w-0">
              <div
                className="font-bold truncate text-base sm:text-xl text-text-main"
                title={name}
              >
                {name}
              </div>
              <div className="text-[10px] font-bold text-primary bg-secondary inline-block px-2 py-0.5 rounded-lg mt-1 tracking-widest">
                {typeLabel}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-4">
            {/* Location */}
            <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-white hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-secondary/50">
                <MapPin className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-muted uppercase tracking-tighter mb-1">
                  Location
                </div>
                <div className="text-[13px] font-medium text-text-main break-all leading-relaxed">{path}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Size */}
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border bg-white hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-secondary/50">
                  <Database className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-muted uppercase tracking-tighter mb-1">
                    Size
                  </div>
                  <div className="text-[13px] font-bold text-text-main">{formatSize(size)}</div>
                </div>
              </div>

              {/* Created At */}
              <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border bg-white hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-secondary/50">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-muted uppercase tracking-tighter mb-1">
                    Created
                  </div>
                  <div className="text-[11px] font-bold text-text-main leading-tight">
                    {new Date(createdAt).toLocaleDateString()}<br/>
                    <span className="text-[10px] text-muted">{new Date(createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Folder Contents Info */}
            {isDirectory && (
              <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-white hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-secondary/50">
                  <Folder className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1 flex gap-6">
                  <div>
                    <div className="text-[10px] font-bold text-muted uppercase tracking-tighter mb-1">Files</div>
                    <div className="text-sm font-bold text-text-main">{numberOfFiles}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-muted uppercase tracking-tighter mb-1">Folders</div>
                    <div className="text-sm font-bold text-text-main">{numberOfFolders}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Modified At */}
            <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-white hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-secondary/50">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-muted uppercase tracking-tighter mb-1">
                  Last Modified
                </div>
                <div className="text-[13px] font-bold text-text-main">
                  {new Date(updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-border bg-secondary/10 flex justify-end gap-2 sm:gap-3">
          {!isDirectory && (
             <button
              className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 bg-white border-2 border-border text-text-main hover:bg-secondary hover:border-primary/30 shadow-sm active:scale-95"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 text-primary" />
              Download
            </button>
          )}
          <button
            className="px-4 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white bg-primary rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 shadow-md"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DetailsPopup;
