import { useEffect, useRef } from "react";
import { FolderPlus } from "lucide-react";
import PropTypes from "prop-types";
import "./DriveActionModals.css";

function CreateDirectoryModal({
  newDirname,
  setNewDirname,
  onClose,
  onCreateDirectory,
}) {
  const inputRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
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

  return (
    <div
      className="cv-rename-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="cv-rename-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cv-create-folder-title"
      >
        <header className="cv-rename-header">
          <span className="cv-rename-header-icon" aria-hidden="true">
            <FolderPlus size={21} />
          </span>
          <div>
            <p className="cv-rename-eyebrow">File organization</p>
            <h2 id="cv-create-folder-title">Create a folder</h2>
            <p>Give this folder a name that’s easy to recognize.</p>
          </div>
        </header>

        <form onSubmit={onCreateDirectory}>
          <div className="cv-rename-content">
            <div className="cv-rename-field">
              <label htmlFor="cv-create-folder-name">
                Folder Name
              </label>
              <input
                ref={inputRef}
                id="cv-create-folder-name"
                type="text"
                value={newDirname}
                onChange={(e) => setNewDirname(e.target.value)}
                required
                placeholder="e.g. Work Documents"
              />
            </div>

            <div className="cv-rename-actions">
              <button
                type="button"
                onClick={onClose}
                className="cv-rename-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newDirname.trim()}
                className="cv-rename-submit"
              >
                Create folder
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

CreateDirectoryModal.propTypes = {
  newDirname: PropTypes.string.isRequired,
  setNewDirname: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreateDirectory: PropTypes.func.isRequired,
};

export default CreateDirectoryModal;
