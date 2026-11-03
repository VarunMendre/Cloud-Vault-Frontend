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
import PropTypes from "prop-types";
import "./DriveActionModals.css";
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
  const initialRenameValueRef = useRef(renameValue);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();

      const dotIndex = initialRenameValueRef.current.lastIndexOf(".");
      if (dotIndex > 0) {
        inputRef.current.setSelectionRange(0, dotIndex);
      } else {
        inputRef.current.select();
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCloseRef.current();
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
        return <Folder />;
      case "image":
        return <Image />;
      case "video":
        return <Video />;
      case "audio":
        return <Music />;
      case "pdf":
        return <FileText />;
      case "code":
        return <FileCode />;
      case "archive":
        return <Archive />;
      default:
        return <File />;
    }
  };

  const itemType = getFileType(renameValue);
  const typeLabel = renameType === "directory" ? "FOLDER" : getFileType(renameValue).toUpperCase();

  return (
    <div className="cv-rename-overlay">
      <section
        className="cv-rename-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-rename-title"
      >
        <header className="cv-rename-header">
          <span className="cv-rename-header-icon" aria-hidden="true">
            <Edit3 size={21} />
          </span>
          <div>
            <p className="cv-rename-eyebrow">File organization</p>
            <h2 id="cv-rename-title">
              Rename {renameType === "file" ? "file" : "folder"}
            </h2>
            <p>Choose a clear name that’s easy to find later.</p>
          </div>
        </header>

        <form onSubmit={onRenameSubmit}>
          <div className="cv-rename-content">
            <div className="cv-rename-current">
              <span className="cv-rename-file-icon" aria-hidden="true">
                {getIcon(itemType)}
              </span>
              <div className="cv-rename-current-copy">
                <span>Current name</span>
                <p title={renameValue}>
                  {renameValue}
                </p>
              </div>
              <span className="cv-rename-type">{typeLabel}</span>
            </div>

            <div className="cv-rename-field">
              <label htmlFor="cv-rename-input">
                New Name
              </label>
              <input
                ref={inputRef}
                id="cv-rename-input"
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className={extensionError ? "has-error" : ""}
                aria-invalid={Boolean(extensionError)}
                aria-describedby={extensionError ? "cv-rename-error" : undefined}
                placeholder="Enter a new name"
              />
              {extensionError && (
                <p id="cv-rename-error" className="cv-rename-error" role="alert">
                  <AlertCircle size={16} aria-hidden="true" />
                  <span>{extensionError}</span>
                </p>
              )}
            </div>

            <div className="cv-rename-actions">
              <button
                type="button"
                onClick={onClose}
                className="cv-rename-cancel"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!renameValue.trim() || !!extensionError || isProcessing}
                className="cv-rename-submit"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={17} className="cv-rename-spinner" />
                    <span>Saving…</span>
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

RenameModal.propTypes = {
  renameType: PropTypes.oneOf(["file", "directory"]).isRequired,
  renameValue: PropTypes.string.isRequired,
  setRenameValue: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onRenameSubmit: PropTypes.func.isRequired,
  extensionError: PropTypes.string,
  isProcessing: PropTypes.bool,
};

export default RenameModal;
