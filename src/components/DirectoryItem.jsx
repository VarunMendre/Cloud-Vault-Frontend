import ContextMenu from "./ContextMenu";
import { formatSize } from "./DetailsPopup";
import { Folder } from "lucide-react";

function DirectoryItem({
  item,
  handleRowClick,
  activeContextMenu,
  contextMenuPos,
  handleContextMenu,
  getFileIcon,
  isUploading,
  uploadProgress,
  handleCancelUpload,
  handleDeleteFile,
  handleDeleteDirectory,
  openRenameModal,
  openDetailsPopup,
  handleShare,
  BASE_URL,
  subscriptionStatus,
  showToast,
}) {
  const isUploadingItem = item.id.startsWith("temp-");

  // File extension badge
  const getExt = (name) => {
    if (!name || item.isDirectory) return null;
    const parts = name.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : null;
  };
  const ext = getExt(item.name);

  // Short date + time
  const formatDate = (ds) => {
    if (!ds) return "";
    return new Date(ds).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderIcon = () => {
    if (item.isDirectory) return <Folder className="w-5 h-5" style={{ color: "#66B2D6" }} />;
    return getFileIcon(item);
  };

  return (
    <div
      className="relative flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl cursor-pointer group transition-all duration-150 hover:bg-gray-50 hover:border-gray-200"
      onClick={() =>
        !(activeContextMenu || isUploading)
          ? handleRowClick(item.isDirectory ? "directory" : "file", item.id)
          : null
      }
      onContextMenu={(e) => handleContextMenu(e, item.id)}
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
        {renderIcon()}
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-gray-800 text-sm truncate leading-snug">
            {item.name}
          </span>
          {ext && (
            <span className="flex-shrink-0 inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-gray-100 text-gray-500 tracking-wide">
              {ext}
            </span>
          )}
          {item.isDirectory && (
            <span className="flex-shrink-0 inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-blue-50 text-blue-500 tracking-wide">
              Folder
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <span>
            Size:{" "}
            <span className="text-gray-500">
              {item.isDirectory
                ? `${item.fileCount || 0} items`
                : formatSize(item.size || 0)}
            </span>
          </span>
          <span className="text-gray-300">•</span>
          <span>
            Modified:{" "}
            <span className="text-gray-500">
              {formatDate(item.updatedAt || item.createdAt)}
            </span>
          </span>
        </div>
      </div>

      {/* Upload progress bar (for uploading items) */}
      {isUploadingItem && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${uploadProgress || 0}%` }}
          />
        </div>
      )}

      {/* 3-dot menu – always visible */}
      <button
        className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-all active:scale-95"
        onClick={(e) => {
          e.stopPropagation();
          handleContextMenu(e, item.id);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {/* Context menu (portal renders to body) */}
      {activeContextMenu === item.id && (
        <ContextMenu
          item={item}
          contextMenuPos={contextMenuPos}
          isUploadingItem={isUploadingItem}
          handleCancelUpload={handleCancelUpload}
          handleDeleteFile={handleDeleteFile}
          handleDeleteDirectory={handleDeleteDirectory}
          openRenameModal={openRenameModal}
          handleShare={handleShare}
          openDetailsPopup={openDetailsPopup}
          BASE_URL={BASE_URL}
          subscriptionStatus={subscriptionStatus}
          showToast={showToast}
        />
      )}
    </div>
  );
}

export default DirectoryItem;
