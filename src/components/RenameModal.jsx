import { useEffect, useRef } from "react";
import {
  Folder,
  File,
  Image,
  Video,
  Music,
  FileText,
  Archive,
  FileCode,
  Edit3,
  AlertCircle,
  Loader2
} from "lucide-react";
function RenameModal({
  renameType,
  renameValue,
  setRenameValue,
  onClose,
  onRenameSubmit,
  extensionError,
  isProcessing = false,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();

      const dotIndex = renameValue.lastIndexOf(".");
      if (dotIndex > 0) {
        inputRef.current.setSelectionRange(0, dotIndex);
      } else {
        inputRef.current.select();
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const getFileType = (fileName) => {
    if (renameType === "directory") return "folder";
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
    switch (type) {
      case "folder":
        return <Folder className="w-8 h-8" style={{ color: '#66B2D6' }} />;
      case "image":
        return <Image className="w-8 h-8" style={{ color: '#9333EA' }} />;
      case "video":
        return <Video className="w-8 h-8" style={{ color: '#DC2626' }} />;
      case "audio":
        return <Music className="w-8 h-8" style={{ color: '#EAB308' }} />;
      case "pdf":
        return <FileText className="w-8 h-8" style={{ color: '#DC2626' }} />;
      case "code":
        return <FileCode className="w-8 h-8" style={{ color: '#10B981' }} />;
      case "archive":
        return <Archive className="w-8 h-8" style={{ color: '#F97316' }} />;
      default:
        return <File className="w-8 h-8" style={{ color: '#A3C5D9' }} />;
    }
  };

  const itemType = getFileType(renameValue);
  const typeLabel = renameType === "directory" ? "FOLDER" : getFileType(renameValue).toUpperCase();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn modal-backdrop">
      <div className="bg-card rounded-2xl shadow-strong max-w-md w-full animate-scaleIn overflow-hidden border border-border">
        {/* Header */}
        <div className="px-6 py-6 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white shadow-sm ring-1 ring-border">
              <Edit3 className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-main">
                Rename {renameType === "file" ? "File" : "Folder"}
              </h3>
              <p className="text-xs text-muted mt-0.5 font-medium">
                Give your {renameType === "file" ? "file" : "folder"} a descriptive name
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={onRenameSubmit}>
          <div className="px-6 py-8">
            {/* Current Item Info */}
            <div className="flex items-center gap-4 mb-8 p-4 bg-background border-2 border-border border-dashed rounded-xl">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-white shadow-sm ring-1 ring-border">
                {getIcon(itemType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-text-main truncate text-sm" title={renameValue}>
                  {renameValue}
                </div>
                <div className="text-[10px] font-bold text-primary bg-secondary inline-block px-2 py-0.5 rounded-lg mt-1 tracking-widest">
                  {typeLabel}
                </div>
              </div>
            </div>

            {/* Input Field */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-text-main mb-2.5 ml-1">
                New Name
              </label>
              <input
                ref={inputRef}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className={`w-full px-5 py-4 bg-background border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 text-text-main font-semibold ${
                  extensionError 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-100" 
                    : "border-border focus:border-primary focus:ring-primary/10"
                }`}
                placeholder={`Enter new name`}
              />
              {extensionError && (
                <div className="mt-3 text-[11px] font-bold text-red-600 flex items-center gap-1.5 px-3 py-2 bg-red-50 rounded-lg animate-fadeIn border border-red-100">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{extensionError}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 text-sm font-bold text-text-main bg-white border-2 border-border rounded-xl transition-all duration-300 hover:bg-secondary hover:border-primary/30"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!renameValue.trim() || !!extensionError || isProcessing}
                className="flex-1 px-6 py-4 text-sm font-bold text-white bg-button rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-button/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RenameModal;
