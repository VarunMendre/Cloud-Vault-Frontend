import { createPortal } from "react-dom";
import { Info, Download, Share2, Pencil, Trash2 } from "lucide-react";

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

  /* ─── Smart positioning ────────────────────────────────────────────── */
  const MENU_W = 180;
  const MENU_H = !item.isDirectory ? 240 : 160; 
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const cx = contextMenuPos.x;
  const cy = contextMenuPos.y;

  let top, left;

  // Horizontal: anchor near click, clamp to viewport
  left = cx - MENU_W + 20; 
  if (left < 12) left = 12;
  if (left + MENU_W > vw - 12) left = vw - MENU_W - 12;

  // Vertical: always open above the click point since the tail is at the bottom in the image
  top = cy - MENU_H - 15; 
  
  // If it goes off top, flip it
  let isUpsideDown = false;
  if (top < 10) {
    top = cy + 15;
    isUpsideDown = true;
  }

  const menuStyle = {
    position: "fixed",
    top,
    left,
    zIndex: 9999,
  };

  /* ─── Item renderer ──────────────────────────────────────────────── */
  const Item = ({ icon, label, onClick, danger = false, disabled = false }) => (
    <button
      className={[
        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all text-left",
        disabled
          ? "opacity-30 cursor-not-allowed"
          : danger
          ? "text-red-500 hover:bg-red-50"
          : "text-[#344767] hover:bg-gray-50",
      ].join(" ")}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
    >
      <span className={["shrink-0", danger ? "text-red-500" : "text-gray-500"].join(" ")}>
        {icon}
      </span>
      <span className="font-medium tracking-tight">{label}</span>
    </button>
  );

  /* ─── Menu JSX ────────────────────────────────────────────────────── */
  const menuJsx = (
    <div
      style={menuStyle}
      className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-visible animate-scaleIn animate-fadeIn min-w-[180px] py-2"
      onClick={(e) => e.stopPropagation()}
    >
      {/* ── Directory ── */}
      {item.isDirectory && (
        <>
          <Item
            icon={<Info className="w-4 h-4" />}
            label="Details"
            onClick={() => openDetailsPopup(item)}
          />
          <Item
            icon={<Pencil className="w-4 h-4" />}
            label="Rename"
            onClick={() => openRenameModal("directory", item.id, item.name, item.__v)}
            disabled={isPaused}
          />
          <Item
            icon={<Trash2 className="w-4 h-4" />}
            label="Delete"
            onClick={() => handleDeleteDirectory(item.id)}
            danger
            disabled={isPaused}
          />
        </>
      )}

      {/* ── Normal file ── */}
      {!item.isDirectory && (
        <>
          <Item
            icon={<Info className="w-4 h-4" />}
            label="Details"
            onClick={() => openDetailsPopup(item)}
          />
          <Item
            icon={<Download className="w-4 h-4" />}
            label="Download"
            onClick={() => {
              const statusStr = String(subscriptionStatus || "").toLowerCase().trim();
              if (["halted", "expired", "paused"].includes(statusStr)) {
                showToast("Access Restricted: Your subscription is currently paused.", "warning");
                return;
              }
              window.location.href = `${BASE_URL}/file/${item.id}?action=download`;
            }}
            disabled={isPaused}
          />
          <Item
            icon={<Share2 className="w-4 h-4" />}
            label="Share"
            onClick={() => handleShare("file", item.id, item.name)}
            disabled={isPaused}
          />
          <Item
            icon={<Pencil className="w-4 h-4" />}
            label="Rename"
            onClick={() => openRenameModal("file", item.id, item.name, item.__v)}
            disabled={isPaused}
          />
          <Item
            icon={<Trash2 className="w-4 h-4" />}
            label="Delete"
            onClick={() => handleDeleteFile(item.id)}
            danger
            disabled={isPaused}
          />
        </>
      )}

      {/* Tail / Arrow */}
      <div 
        className={[
          "absolute w-3 h-3 bg-white border-r border-b border-gray-100 transform rotate-45 rotate-[-135deg]",
          isUpsideDown ? "-top-1.5" : "-bottom-1.5",
          "shadow-[3px_3px_5px_rgba(0,0,0,0.02)]"
        ].join(" ")}
        style={{ 
          left: cx - left - 6,
          borderLeft: isUpsideDown ? "1px solid #f3f4f6" : "none",
          borderTop: isUpsideDown ? "1px solid #f3f4f6" : "none",
          borderRight: !isUpsideDown ? "1px solid #f3f4f6" : "none",
          borderBottom: !isUpsideDown ? "1px solid #f3f4f6" : "none",
          transform: isUpsideDown ? "rotate(225deg)" : "rotate(45deg)",
          zIndex: -1
        }}
      />
    </div>
  );

  return createPortal(menuJsx, document.body);
}

export default ContextMenu;