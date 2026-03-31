import { useEffect, useRef } from "react";
import { FolderPlus } from "lucide-react";

function CreateDirectoryModal({
  newDirname,
  setNewDirname,
  onClose,
  onCreateDirectory,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
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

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn modal-backdrop">
      <div className="bg-card rounded-2xl shadow-strong max-w-md w-full animate-scaleIn overflow-hidden border border-border">
        {/* Header */}
        <div className="px-6 py-6 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white shadow-sm ring-1 ring-border">
              <FolderPlus className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-main">Create New Folder</h3>
              <p className="text-xs text-muted mt-0.5 font-medium">Keep your files organized and secure</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={onCreateDirectory}>
          <div className="px-6 py-8">
            {/* Input Field */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-text-main mb-2.5 ml-1">
                Folder Name
              </label>
              <input
                ref={inputRef}
                type="text"
                value={newDirname}
                onChange={(e) => setNewDirname(e.target.value)}
                className="w-full px-5 py-4 bg-background border-2 border-border rounded-xl transition-all duration-300 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-text-main font-semibold placeholder:text-muted/50"
                placeholder="e.g. Work Documents"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-4 text-sm font-bold text-text-main bg-white border-2 border-border rounded-xl transition-all duration-300 hover:bg-secondary hover:border-primary/30"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newDirname.trim()}
                className="flex-1 px-6 py-4 text-sm font-bold text-white bg-accent rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-md"
              >
                Create Folder
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateDirectoryModal;
