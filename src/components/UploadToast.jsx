import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, CheckCircle2, Loader2, File, Activity } from "lucide-react";

// Helper function to format file sizes
const formatSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const UploadToast = ({ uploadQueue, progressMap, isUploading, onCancel }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showFinished, setShowFinished] = useState(false);

  const activeUploads = uploadQueue || [];
  const currentTotal = activeUploads.length;

  const totalProgress = activeUploads.length > 0
    ? activeUploads.reduce((acc, file) => acc + (progressMap[file.id] || 0), 0) / activeUploads.length
    : 0;

  useEffect(() => {
    if (!isUploading && currentTotal === 0 && activeUploads.length === 0) {
        // null
    } else if (!isUploading && currentTotal > 0) {
        setShowFinished(true);
        const timer = setTimeout(() => {
          setShowFinished(false);
        }, 5000);
        return () => clearTimeout(timer);
    }
  }, [isUploading, currentTotal]);

  if (activeUploads.length === 0 && !showFinished) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[1000] w-[340px] bg-card rounded-[32px] shadow-strong border border-border overflow-hidden transition-all duration-500 transform translate-y-0 animate-slideIn">
      {/* Header */}
      <div className="bg-text-main px-6 py-4 flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
        <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                    {isUploading ? (
                        <Activity className="w-4 h-4 text-primary animate-pulse" />
                    ) : (
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                    )}
                </div>
                <div>
                   <span className="text-sm font-black text-white tracking-tight block leading-none">
                      {isUploading ? `Relaying ${currentTotal} Nodes` : "Grid Sync Complete"}
                   </span>
                   {isUploading && <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1 block">In-Transit</span>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all"
                >
                    {isMinimized ? <ChevronUp size={16} className="text-white/60" /> : <ChevronDown size={16} className="text-white/60" />}
                </button>
                {!isUploading && (
                    <button 
                        onClick={() => setShowFinished(false)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all"
                    >
                        <X size={16} className="text-white/60" />
                    </button>
                )}
            </div>
        </div>
        
        {/* Total Batch Progress Bar */}
        {isUploading && (
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden relative z-10 shadow-inner p-0.5">
                <div 
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_2px_rgba(var(--color-primary-rgb),0.3)]"
                    style={{ width: `${totalProgress}%` }}
                >
                   <div className="w-full h-full bg-white/20 animate-pulse"></div>
                </div>
            </div>
        )}
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {activeUploads.map((item) => {
            const progress = progressMap[item.id] || 0;
            const uploadedBytes = (item.size * progress) / 100;
            
            return (
              <div key={item.id} className="p-4 bg-white rounded-2xl border border-border/50 hover:border-primary/20 transition-all group/item shadow-sm hover:shadow-md">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform">
                    <File size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-text-main truncate tracking-tight mb-1" title={item.name}>
                      {item.name}
                    </p>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></div>
                           <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">
                            {formatSize(uploadedBytes)} / {formatSize(item.size)}
                           </p>
                        </div>
                        <p className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${progress === 100 ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                           {progress.toFixed(0)}%
                        </p>
                    </div>
                  </div>
                  {onCancel && progress < 100 && isUploading && (
                    <button 
                      onClick={() => onCancel(item.id)}
                      className="w-8 h-8 flex items-center justify-center text-muted hover:text-red-500 bg-secondary rounded-xl transition-all"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
          
          {!isUploading && currentTotal === 0 && showFinished && (
            <div className="p-10 flex flex-col items-center text-center animate-fadeIn">
              <div className="w-20 h-20 bg-accent/10 text-accent rounded-[24px] flex items-center justify-center mb-6 shadow-inner relative group/success">
                <div className="absolute inset-0 bg-accent/5 animate-ping rounded-[24px]"></div>
                <CheckCircle2 size={32} className="relative z-10 transition-transform group-hover/success:scale-110 duration-500" />
              </div>
              <h4 className="text-xl font-black text-text-main tracking-tight mb-2">Workspace Synced</h4>
              <p className="text-xs font-bold text-muted leading-relaxed px-4 uppercase tracking-[0.1em]">All nodes are secured and localized within your cloud grid.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadToast;
