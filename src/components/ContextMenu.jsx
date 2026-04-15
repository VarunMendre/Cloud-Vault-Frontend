import { createPortal } from "react-dom";
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
  const itemBase =
    "flex items-center gap-3 px-4 py-3 cursor-pointer whitespace-nowrap transition-all duration-300 text-sm font-black tracking-tight group rounded-xl mx-1.5 my-0.5";
  const itemActive = "text-text-main hover:bg-secondary hover:text-primary";
  const itemDisabled =
    "text-muted hover:bg-secondary/50 cursor-not-allowed opacity-50";
  const itemDanger = "text-red-500 hover:bg-red-50";

  // --- Smart positioning: keep menu fully inside viewport ---
  const MENU_HEIGHT = 300;
  const MENU_WIDTH = 230;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const isMobile = vw < 480;

  let menuStyle;
  if (isMobile) {
    // On mobile: center horizontally near the bottom for thumb reach
    menuStyle = {
      position: "fixed",
      left: "50%",
      transform: "translateX(-50%)",
      bottom: 16,
      top: "auto",
      width: "calc(100vw - 32px)",
      maxWidth: 320,
      zIndex: 9999,
    };
  } else {
    // Desktop: anchor to click point with overflow clamping
    let left = contextMenuPos.x;
    let top = contextMenuPos.y;

    // Clamp so menu never goes off-screen
    if (left + MENU_WIDTH > vw - 8) left = vw - MENU_WIDTH - 8;
    if (left < 8) left = 8;
    if (top + MENU_HEIGHT > vh - 8) top = vh - MENU_HEIGHT - 8;
    if (top < 8) top = 8;

    menuStyle = {
      position: "fixed",
      left,
      top,
      zIndex: 9999,
    };
  }

  const renderItem = (
    icon,
    label,
    onClick,
    variant = "default",
    disabled = false
  ) => (
    <div
      key={label}
      className={classNames(
        itemBase,
        disabled
          ? itemDisabled
          : variant === "danger"
          ? itemDanger
          : itemActive
      )}
      onClick={(e) => {
        if (!disabled) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <div
        className={classNames(
          "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
          disabled
            ? "bg-secondary"
            : variant === "danger"
            ? "bg-red-50"
            : "bg-secondary"
        )}
      >
        {icon}
      </div>
      <span className="flex-1 capitalize">{label}</span>
    </div>
  );

  const menuJsx = (
    <div
      className="bg-white/95 backdrop-blur-xl shadow-strong rounded-2xl py-2 min-w-[220px] border border-border animate-scaleIn overflow-hidden"
      style={menuStyle}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-5 py-2 mb-1 border-b border-border/50">
        <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">
          {item.isDirectory ? "Folder Actions" : "File Actions"}
        </p>
      </div>

      {/* Directory */}
      {item.isDirectory && (
        <>
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
          <div className="h-px bg-border/50 mx-4 my-1" />
          {renderItem(
            <Info className="w-4 h-4 transition-colors group-hover:text-primary" />,
            "details",
            () => openDetailsPopup(item)
          )}
        </>
      )}

      {/* Uploading file */}
      {!item.isDirectory && isUploadingItem && item.isUploading && (
        <>
          {renderItem(
            <X className="w-4 h-4 transition-colors group-hover:text-red-600" />,
            "cancel upload",
            () => handleCancelUpload(item.id),
            "danger"
          )}
        </>
      )}

      {/* Normal file */}
      {!item.isDirectory && !(isUploadingItem && item.isUploading) && (
        <>
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
                showToast("Access Paused: Upgrade required.", "warning");
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
          <div className="h-px bg-border/50 mx-4 my-1" />
          {renderItem(
            <Info className="w-4 h-4 transition-colors group-hover:text-primary" />,
            "MetaData",
            () => openDetailsPopup(item)
          )}
        </>
      )}
    </div>
  );

  return createPortal(menuJsx, document.body);
}

export default ContextMenu;