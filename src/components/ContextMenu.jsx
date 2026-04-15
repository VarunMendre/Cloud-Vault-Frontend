import { createPortal } from "react-dom";
import { Info, Download, Share2, Pencil, Trash2, X } from "lucide-react";

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

  /* ─── Smart positioning ──────────────────────────────────────────────
     Prefer opening ABOVE the click point so it doesn't go off-screen.
     Falls back to below if there's not enough room above.             */
  const MENU_W = 220;
  const MENU_H = 300; // generous estimate
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const cx = contextMenuPos.x;
  const cy = contextMenuPos.y;

  let top, left;

  // Horizontal: prefer to the left of click, clamp to viewport
  left = cx - MENU_W + 24; // anchor right edge near click
  if (left < 8) left = 8;
  if (left + MENU_W > vw - 8) left = vw - MENU_W - 8;

  // Vertical: prefer ABOVE, fall back to below
  if (cy - MENU_H >= 8) {
    top = cy - MENU_H; // open above
  } else if (cy + MENU_H <= vh - 8) {
    top = cy; // open below
  } else {
    // clamp so it's fully visible
    top = Math.max(8, Math.min(cy - MENU_H / 2, vh - MENU_H - 8));
  }

  const menuStyle =
    typeof window !== "undefined" && window.innerWidth < 480
      ? {
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: 16,
          top: "auto",
          width: "calc(100vw - 32px)",
          maxWidth: 320,
          zIndex: 9999,
        }
      : { position: "fixed", top, left, zIndex: 9999 };

  /* ─── Item renderers ──────────────────────────────────────────────── */
  const Item = ({ icon, label, onClick, danger = false, disabled = false }) => (
    <button
      className={[
        "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors",
        disabled
          ? "text-gray-300 cursor-not-allowed"
          : danger
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-50",
      ].join(" ")}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
    >
      <span
        className={[
          "flex-shrink-0 w-4 h-4",
          danger ? "text-red-400" : "text-gray-400",
        ].join(" ")}
      >
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );

  const Divider = () => <div className="h-px bg-gray-100 my-1 mx-3" />;

  /* ─── Menu JSX ────────────────────────────────────────────────────── */
  const menuJsx = (
    <div
      style={menuStyle}
      className="bg-white rounded-2xl shadow-xl border border-gray-150 overflow-hidden animate-scaleIn min-w-[200px]"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header label */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          {item.isDirectory ? "Folder Actions" : "File Actions"}
        </p>
      </div>

      <Divider />

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
          <Divider />
          <Item
            icon={<Trash2 className="w-4 h-4" />}
            label="Delete"
            onClick={() => handleDeleteDirectory(item.id)}
            danger
            disabled={isPaused}
          />
        </>
      )}

      {/* ── Uploading file ── */}
      {!item.isDirectory && isUploadingItem && item.isUploading && (
        <Item
          icon={<X className="w-4 h-4" />}
          label="Cancel Upload"
          onClick={() => handleCancelUpload(item.id)}
          danger
        />
      )}

      {/* ── Normal file ── */}
      {!item.isDirectory && !(isUploadingItem && item.isUploading) && (
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
              if (isPaused) { showToast("Access Paused: Upgrade required.", "warning"); return; }
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
          <Divider />
          <Item
            icon={<Trash2 className="w-4 h-4" />}
            label="Delete"
            onClick={() => handleDeleteFile(item.id)}
            danger
            disabled={isPaused}
          />
        </>
      )}

      <div className="h-2" />
    </div>
  );

  return createPortal(menuJsx, document.body);
}

export default ContextMenu;