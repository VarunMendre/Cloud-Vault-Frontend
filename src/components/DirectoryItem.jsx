import { useState } from "react";
import { 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Archive, 
  FileCode, 
  File, 
  Download, 
  Info, 
  AlertTriangle,
  MoreVertical
} from "lucide-react";
import ContextMenu from "./ContextMenu";
import { formatSize } from "./DetailsPopup";

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
  const [isHovered, setIsHovered] = useState(false);



  // Simplified icon rendering since getFileIcon now returns the component
  const renderIcon = () => {
    if (item.isDirectory) {
      return <Folder className="w-6 h-6" style={{ color: '#66B2D6' }} />;
    }
    return getFileIcon(item);
  };

  const isUploadingItem = item.id.startsWith("temp-");

  const handleDownload = (e) => {
    e.stopPropagation();
    e.preventDefault(); 
    
    const statusStr = String(subscriptionStatus || "").toLowerCase().trim();
    if (["halted", "expired", "paused"].includes(statusStr)) {
      showToast("Access Restricted: Your subscription is currently paused.", "warning");
      return;
    }
    
    window.location.href = `${BASE_URL}/file/${item.id}?action=download`;
  };

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    openDetailsPopup(item);
  };

  // Helper to get file extension
  const getFileExtension = (filename) => {
    if (!filename || typeof filename !== 'string' || item.isDirectory) return null;
    const parts = filename.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1].toUpperCase();
    }
    return null;
  };

  // Helper to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const fileExtension = getFileExtension(item.name);

  return (
    <div
      className="flex flex-col relative border-2 border-border rounded-xl bg-card cursor-pointer group transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      onClick={() =>
        !(activeContextMenu || isUploading)
          ? handleRowClick(item.isDirectory ? "directory" : "file", item.id)
          : null
      }
      onContextMenu={(e) => handleContextMenu(e, item.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2.5 sm:gap-4 p-3 sm:p-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-secondary transition-all group-hover:bg-primary/10">
            {renderIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {/* Name and Type Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <span className="font-bold text-text-main truncate text-[13px] sm:text-base group-hover:text-primary transition-colors">{item.name}</span>
            {item.isDirectory ? (
              <span className="flex-shrink-0 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase rounded-md sm:rounded-lg bg-secondary text-primary border border-primary/10">
                Folder
              </span>
            ) : fileExtension ? (
              <span className="flex-shrink-0 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase rounded-md sm:rounded-lg bg-background text-muted border border-border">
                {fileExtension}
              </span>
            ) : null}
          </div>

          {/* Size and Modified Date */}
          <div className="flex items-center gap-2 sm:gap-4 text-[11px] sm:text-xs font-medium text-muted">
            <div className="flex items-center gap-1">
              <span className="opacity-60 uppercase tracking-tighter hidden sm:inline">Size:</span>
              <span className="text-text-main">{formatSize(item.size || 0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="opacity-60 uppercase tracking-tighter hidden sm:inline">Modified:</span>
              <span className="text-text-main whitespace-nowrap">{formatDate(item.updatedAt || item.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions & Menu */}
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          {/* Hover actions - hidden on mobile (no hover), visible on desktop hover */}
          <div className={`hidden sm:flex items-center gap-1 transition-all duration-300 ${isHovered && !isUploadingItem ? 'opacity-100' : 'opacity-0'}`}>
            {!item.isDirectory && (
              <button
                onClick={handleDownload}
                className="p-2.5 rounded-xl text-primary hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm hover:shadow-md"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={handleDetailsClick}
              className="p-2.5 rounded-xl text-primary hover:bg-primary hover:text-white transition-all active:scale-95 shadow-sm hover:shadow-md"
              title="Details"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Context Menu Trigger — always visible */}
          <button
            className="p-2 sm:p-2.5 rounded-xl text-muted hover:bg-secondary hover:text-text-main transition-all active:scale-95 ml-0.5 sm:ml-1"
            onClick={(e) => {
              e.stopPropagation();
              handleContextMenu(e, item.id);
            }}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Context menu overlay */}
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
