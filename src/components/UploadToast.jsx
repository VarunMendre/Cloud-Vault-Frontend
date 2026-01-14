import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, CheckCircle2, Loader2, File } from "lucide-react";

const UploadToast = ({ uploadQueue, progressMap, isUploading, onCancel }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const [finishedCount, setFinishedCount] = useState(0);

  // Filter out items that are actually in the upload list or in progress
  // Note: DirectoryView adds items to filesList with isUploading: true
  // Then processes them one by one.
  
  const activeUploads = uploadQueue || [];
  const currentTotal = activeUploads.length;

  useEffect(() => {
    if (!isUploading && currentTotal === 0 && finishedCount > 0) {
      setShowFinished(true);
      const timer = setTimeout(() => {
        setShowFinished(false);
        setFinishedCount(0);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isUploading, currentTotal, finishedCount]);

  // Track finished count
  useEffect(() => {
    if (isUploading && currentTotal > 0) {
      // Logic to track when count decreases
    }
  }, [isUploading, currentTotal]);

  if (!isUploading && currentTotal === 0 && !showFinished) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[150] w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 transform translate-y-0">
      {/* Header */}
      <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isUploading ? (
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          )}
          <span className="text-sm font-semibold text-white">
            {isUploading ? `Uploading ${currentTotal} item${currentTotal !== 1 ? 's' : ''}` : "Uploads complete"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-slate-800 rounded transition-colors"
          >
            {isMinimized ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>
          {!isUploading && currentTotal === 0 && (
            <button 
              onClick={() => setShowFinished(false)}
              className="p-1 hover:bg-slate-800 rounded transition-colors"
            >
              <X size={16} className="text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="max-h-60 overflow-y-auto">
          {activeUploads.map((item) => {
            const progress = progressMap[item.id] || 0;
            return (
              <div key={item.id} className="p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                    <File size={16} className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate" title={item.name}>
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {progress < 100 ? `${Math.floor(progress)}% • Uploading...` : "Finishing..."}
                    </p>
                  </div>
                  {onCancel && progress < 100 && (
                    <button 
                      onClick={() => onCancel(item.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
          
          {!isUploading && currentTotal === 0 && showFinished && (
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                <CheckCircle2 size={24} className="text-green-500" />
              </div>
              <p className="text-sm font-semibold text-slate-800">All files uploaded!</p>
              <p className="text-xs text-slate-500 mt-1">Your files are now safe in your drive.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadToast;
