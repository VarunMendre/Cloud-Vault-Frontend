import {
  Info,
  Download,
  Share2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ContextMenu({
  item,
  contextMenuPos,
  isUploadingItem,
  handleCancelUpload,
  handleDeleteFile,
  handleDeleteDirectory,
  openRenameModal,
  handleShare,
  openDetailsPopup,
  BASE_URL,
  subscriptionStatus,
  showToast,
}) {
  const isPaused = subscriptionStatus?.toLowerCase() === "paused";
  
  // Design system constants
  const itemBase = "flex items-center gap-3 px-4 py-3 cursor-pointer whitespace-nowrap transition-all duration-300 text-sm font-black tracking-tight group rounded-xl mx-1.5 my-0.5";
  const itemActive = "text-text-main hover:bg-secondary hover:text-primary";
  const itemDisabled = "text-muted hover:bg-secondary/50 cursor-not-allowed opacity-50";
  const itemDanger = "text-red-500 hover:bg-red-50";

  // Determine position style — mobile-safe
  const MENU_HEIGHT_ESTIMATE = 280; 
  const MENU_WIDTH_ESTIMATE = 220;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 480;
  const isNearBottom = typeof window !== 'undefined' && (contextMenuPos.y + MENU_HEIGHT_ESTIMATE > window.innerHeight);
  const isNearRight = typeof window !== 'undefined' && (contextMenuPos.x + MENU_WIDTH_ESTIMATE > window.innerWidth);

  // On mobile: center horizontally, anchor near bottom for thumb reach
  // On desktop: position at cursor with overflow protection
  const menuStyle = isMobile ? {
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 16,
    top: 'auto',
    width: 'calc(100vw - 32px)',
    maxWidth: 320,
  } : {
    left: isNearRight ? Math.max(8, contextMenuPos.x - MENU_WIDTH_ESTIMATE) : contextMenuPos.x,
    top: isNearBottom ? "auto" : contextMenuPos.y,
    bottom: isNearBottom ? (window.innerHeight - contextMenuPos.y) : "auto",
  };

  const renderItem = (icon, label, onClick, variant = "default", disabled = false) => (
    <div
      key={label}
      className={classNames(
        itemBase,
        disabled ? itemDisabled : variant === "danger" ? itemDanger : itemActive
      )}
      onClick={(e) => {
        if (!disabled) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <div className={classNames(
        "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
        disabled ? "bg-secondary" : variant === "danger" ? "bg-red-50" : "bg-secondary"
      )}>
        {icon}
      </div>
      <span className="flex-1 capitalize">{label}</span>
    </div>
  );

  const MenuContainer = ({ children }) => (
    <div
      className="fixed bg-white/95 backdrop-blur-xl shadow-strong rounded-2xl z-[1000] py-2 min-w-[220px] border border-border animate-scaleIn overflow-hidden"
      style={menuStyle}
    >
       <div className="px-5 py-2 mb-1 border-b border-border/50">
          <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">{item.isDirectory ? "Folder Actions" : "File Actions"}</p>
       </div>
       {children}
    </div>
  );

  // Directory context menu
  if (item.isDirectory) {
    return (
      <MenuContainer>
        {renderItem(
          <Pencil className="w-4 h-4 transition-colors group-hover:text-primary" />, 
          "rename", 
          () => openRenameModal("directory", item.id, item.name, item.__v),
          "default",
          isPaused
        )}
        {renderItem(
          <Trash2 className="w-4 h-4 transition-colors group-hover:text-red-600" />, 
          "delete", 
          () => handleDeleteDirectory(item.id),
          "danger",
          isPaused
        )}
        <div className="h-px bg-border/50 mx-4 my-1"></div>
        {renderItem(
          <Info className="w-4 h-4 transition-colors group-hover:text-primary" />, 
          "details", 
          () => openDetailsPopup(item)
        )}
      </MenuContainer>
    );
  } else {
    // File context menu
    if (isUploadingItem && item.isUploading) {
      return (
        <MenuContainer>
          {renderItem(
            <X className="w-4 h-4 transition-colors group-hover:text-red-600" />, 
            "cancel upload", 
            () => handleCancelUpload(item.id),
            "danger"
          )}
        </MenuContainer>
      );
    } else {
      // Normal file
      return (
        <MenuContainer>
          {renderItem(
            <Share2 className="w-4 h-4 transition-colors group-hover:text-primary" />, 
            "Share file", 
            () => handleShare("file", item.id, item.name),
            "default",
            isPaused
          )}
          {renderItem(
            <Download className="w-4 h-4 transition-colors group-hover:text-primary" />, 
            "download", 
            () => {
              if (isPaused) {
                showToast("Grid Access Paused: Upgrade required.", "warning");
                return;
              }
              window.location.href = `${BASE_URL}/file/${item.id}?action=download`;
            },
            "default",
            isPaused
          )}
          {renderItem(
            <Pencil className="w-4 h-4 transition-colors group-hover:text-primary" />, 
            "rename", 
            () => openRenameModal("file", item.id, item.name, item.__v),
            "default",
            isPaused
          )}
          {renderItem(
            <Trash2 className="w-4 h-4 transition-colors group-hover:text-red-600" />, 
            "delete", 
            () => handleDeleteFile(item.id),
            "danger",
            isPaused
          )}
          <div className="h-px bg-border/50 mx-4 my-1"></div>
          {renderItem(
            <Info className="w-4 h-4 transition-colors group-hover:text-primary" />, 
            "metaData", 
            () => openDetailsPopup(item)
          )}
        </MenuContainer>
      );
    }
  }
}

export default ContextMenu;