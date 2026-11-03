import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import PropTypes from "prop-types";

function DeleteConfirmationModal({ item, onCancel, onConfirm }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  const itemType = item.isDirectory ? "folder" : "file";

  return (
    <dialog
      ref={dialogRef}
      className="drive-delete-dialog"
      aria-labelledby="drive-delete-title"
      aria-describedby="drive-delete-description"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className="drive-delete-card">
        <div className="drive-delete-heading">
          <span className="drive-delete-icon" aria-hidden="true">
            <AlertTriangle size={22} />
          </span>
          <div>
            <h2 id="drive-delete-title">Delete this {itemType}?</h2>
            <p>This action can’t be undone.</p>
          </div>
        </div>

        <div className="drive-delete-item" title={item.name}>
          <span>{item.name}</span>
        </div>

        <p id="drive-delete-description" className="drive-delete-description">
          {item.isDirectory
            ? "The folder and its contents will be removed from your drive."
            : "This file will be removed from your drive."}
        </p>

        <div className="drive-delete-actions">
          <button type="button" className="drive-delete-cancel" onClick={onCancel} autoFocus>
            Cancel
          </button>
          <button type="button" className="drive-delete-confirm" onClick={onConfirm}>
            Delete {itemType}
          </button>
        </div>
      </div>
    </dialog>
  );
}

DeleteConfirmationModal.propTypes = {
  item: PropTypes.shape({
    isDirectory: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default DeleteConfirmationModal;
