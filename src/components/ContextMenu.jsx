import { createPortal } from "react-dom";
import { Info, Download, Share2, Pencil, Trash2, X, ChevronRight, Shield } from "lucide-react";

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
  const MENU_W = 240;
  const MENU_H = !item.isDirectory ? 320 : 220; // Exact height for the sharp menu
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const cx = contextMenuPos.x;
  const cy = contextMenuPos.y;

  let top, left;

  // Horizontal: anchor near click, clamp to viewport
  left = cx - MENU_W / 2;
  if (left < 12) left = 12;
  if (left + MENU_W > vw - 12) left = vw - MENU_W - 12;

  // Vertical: smart flip with 10px buffer
  if (cy > vh / 2) {
    top = cy - MENU_H - 12; // open above
  } else {
    top = cy + 12; // open below
  }
  
  // Final clamp to ensure it's not starting behind header (header is ~80px)
  top = Math.max(90, Math.min(top, vh - MENU_H - 16));

  const menuStyle =
    typeof window !== "undefined" && window.innerWidth < 480
      ? {
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: 24,
          top: "auto",
          width: "calc(100vw - 32px)",
          maxWidth: 360,
          zIndex: 9999,
        }
      : { position: "fixed", top, left, zIndex: 9999 };

  /* ─── Item renderers ──────────────────────────────────────────────── */
  const Item = ({ icon, label, onClick, danger = false, disabled = false }) => (
    <button
      className={[
        "w-full flex items-center justify-between px-5 py-3.5 text-[13px] transition-all group/item",
        disabled
          ? "opacity-30 cursor-not-allowed"
          : danger
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-50",
      ].join(" ")}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
    >
      <div className="flex items-center gap-3.5">
        <span className={["shrink-0 w-4 h-4", danger ? "text-red-400" : "text-gray-400 group-hover/item:text-[#66B2D6] transition-colors"].join(" ")}>
          {icon}
        </span>
        <span className="font-bold tracking-tight">{label}</span>
      </div>
      {!disabled && !danger && <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover/item:translate-x-1 transition-transform" />}
    </button>
  );

  const SectionHeader = ({ title }) => (
    <div className="px-5 pt-5 pb-3">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
        {title}
      </p>
    </div>
  );

  const Divider = () => <div className="h-px bg-gray-100 my-1.5 mx-3 rounded-full" />;

  /* ─── Menu JSX ────────────────────────────────────────────────────── */
  const menuJsx = (
    <div
      style={menuStyle}
      className="bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden animate-scaleIn min-w-[240px]"
      onClick={(e) => e.stopPropagation()}
    >
      <SectionHeader title={item.isDirectory ? "Node Operations" : "Protocol Actions"} />

      <div className="py-1">
        {/* ── Directory ── */}
        {item.isDirectory && (
          <>
            <Item
              icon={<Info className="w-4 h-4" />}
              label="Inspect Cluster"
              onClick={() => openDetailsPopup(item)}
            />
            <Item
              icon={<Pencil className="w-4 h-4" />}
              label="Recode Index"
              onClick={() => openRenameModal("directory", item.id, item.name, item.__v)}
              disabled={isPaused}
            />
            <Divider />
            <Item
              icon={<Trash2 className="w-4 h-4" />}
              label="Purge Resources"
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
            label="Abort Uplink"
            onClick={() => handleCancelUpload(item.id)}
            danger
          />
        )}

        {/* ── Normal file ── */}
        {!item.isDirectory && !(isUploadingItem && item.isUploading) && (
          <>
            <Item
              icon={<Info className="w-4 h-4" />}
              label="Metadata Inspect"
              onClick={() => openDetailsPopup(item)}
            />
            <Item
              icon={<Download className="w-4 h-4" />}
              label="Secure Egress"
              onClick={() => {
                if (isPaused) { showToast("Protocol REJECTED: Upgrade required.", "warning"); return; }
                window.location.href = `${BASE_URL}/file/${item.id}?action=download`;
              }}
              disabled={isPaused}
            />
            <Item
              icon={<Share2 className="w-4 h-4" />}
              label="Broadcast Relay"
              onClick={() => handleShare("file", item.id, item.name)}
              disabled={isPaused}
            />
            <Item
              icon={<Pencil className="w-4 h-4" />}
              label="Re-Index Asset"
              onClick={() => openRenameModal("file", item.id, item.name, item.__v)}
              disabled={isPaused}
            />
            <Divider />
            <Item
              icon={<Trash2 className="w-4 h-4" />}
              label="Purge Asset"
              onClick={() => handleDeleteFile(item.id)}
              danger
              disabled={isPaused}
            />
          </>
        )}
      </div>

      {/* Footer Branding */}
      <div className="bg-gray-50/50 border-t border-gray-100 flex items-center justify-center gap-2 py-3">
         <Shield className="w-3 h-3 text-[#66B2D6]" />
         <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
           Vault Infrastructure Node
         </span>
      </div>
    </div>
  );

  return createPortal(menuJsx, document.body);
}

export default ContextMenu;