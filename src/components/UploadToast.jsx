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
  }, [isUploading, currentTotal, activeUploads.length]);

  if (activeUploads.length === 0 && !showFinished) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[1000] w-[calc(100vw-32px)] sm:w-[360px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#E2E8F0] overflow-hidden transition-all duration-500 transform translate-y-0 animate-slideUp">
      {/* Header */}
      <div className="bg-[#2D8B8B] px-5 py-4 flex flex-col relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-12 -mt-12"></div>
        
        <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    {isUploading ? (
                        <Activity className="w-5 h-5 text-white animate-pulse" />
                    ) : (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                    )}
                </div>
                <div>
                   <span className="text-[15px] font-bold text-white tracking-tight block leading-tight">
                      {isUploading ? `Uploading ${currentTotal} files` : "Upload Complete"}
                   </span>
                   {isUploading && <span className="text-[11px] font-medium text-white/80 block mt-0.5">Your files are being secured</span>}
                </div>
            </div>
            <div className="flex items-center gap-1">
                <button 
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors text-white"
                >
                    {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {!isUploading && (
                    <button 
                        onClick={() => setShowFinished(false)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors text-white"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
        </div>
        
        {/* Total Batch Progress Bar */}
        {isUploading && (
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden relative z-10 mt-4">
                <div 
                    className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${totalProgress}%` }}
                />
            </div>
        )}
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="max-h-[380px] overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white">
          {activeUploads.map((item) => {
            const progress = progressMap[item.id] || 0;
            const uploadedBytes = (item.size * progress) / 100;
            const isCompleted = progress >= 100;
            
            return (
              <div key={item.id} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] transition-all hover:border-[#2D8B8B]/30 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-[#F0FDF4]' : 'bg-[#F0F9FF]'}`}>
                    <File size={18} className={isCompleted ? 'text-[#10B981]' : 'text-[#2D8B8B]'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1A202C] truncate mb-0.5" title={item.name}>
                      {item.name}
                    </p>
                    <div className="flex justify-between items-center">
                        <p className="text-[11px] text-[#718096]">
                          {formatSize(uploadedBytes)} / {formatSize(item.size)}
                        </p>
                        <span className={`text-[11px] font-bold ${isCompleted ? 'text-[#10B981]' : 'text-[#2D8B8B]'}`}>
                           {progress.toFixed(0)}%
                        </span>
                    </div>
                  </div>
                  {onCancel && progress < 100 && isUploading && (
                    <button 
                      onClick={() => onCancel(item.id)}
                      className="w-7 h-7 flex items-center justify-center text-[#A0AEC0] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-md transition-all"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ease-out ${isCompleted ? 'bg-[#10B981]' : 'bg-[#2D8B8B]'}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
          
          {!isUploading && currentTotal === 0 && showFinished && (
            <div className="p-8 flex flex-col items-center text-center animate-fadeIn">
              <div className="w-16 h-16 bg-[#F0FDF4] text-[#10B981] rounded-full flex items-center justify-center mb-4 border border-[#DCFCE7]">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-[17px] font-bold text-[#1A202C] mb-1">All Sync Complete</h4>
              <p className="text-[13px] text-[#718096]">Your files are safely stored in your cloud drive.</p>
              <button 
                onClick={() => setShowFinished(false)}
                className="mt-5 px-6 py-2 bg-[#F0F2F5] text-[#1A202C] text-[13px] font-semibold rounded-lg hover:bg-[#E2E8F0] transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadToast;

