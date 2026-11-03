import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  File,
  LoaderCircle,
  X,
} from "lucide-react";
import PropTypes from "prop-types";

const formatSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

const statusLabels = {
  queued: "Waiting",
  uploading: "Uploading",
  importing: "Importing from Drive",
  success: "Complete",
  error: "Couldn’t upload",
};

function UploadToast({ uploadQueue = [], progressMap = {}, statusMap = {}, errorMap = {}, isUploading, onCancel }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const activeUploads = uploadQueue;

  const summary = useMemo(() => {
    let uploadedBytes = 0;
    let totalBytes = 0;
    let uploading = 0;
    let queued = 0;
    let completed = 0;
    let failed = 0;
    let importing = 0;

    activeUploads.forEach((item) => {
      const status = statusMap[item.id] || (isUploading ? "uploading" : "queued");
      if (item.isImport) {
        if (status === "importing") importing += 1;
        if (status === "success") completed += 1;
        if (status === "error") failed += 1;
        return;
      }

      totalBytes += item.size || 0;
      uploadedBytes += (item.size || 0) * ((progressMap[item.id] || 0) / 100);
      if (status === "uploading") uploading += 1;
      else if (status === "queued") queued += 1;
      else if (status === "success") completed += 1;
      else if (status === "error") failed += 1;
    });

    return {
      uploadedBytes,
      totalBytes,
      percent: totalBytes > 0 ? Math.min((uploadedBytes / totalBytes) * 100, 100) : 0,
      uploading,
      queued,
      completed,
      failed,
      importing,
      isActive: uploading > 0 || queued > 0 || importing > 0,
    };
  }, [activeUploads, isUploading, progressMap, statusMap]);

  if (activeUploads.length === 0) return null;

  const isActive = isUploading || summary.isActive;
  const title = isActive
    ? "File activity"
    : summary.failed > 0
      ? "Upload finished with errors"
      : "Uploads complete";
  const Subtitle = isActive
    ? summary.importing > 0
      ? "File transfer and Drive import status"
      : "Live transfer progress"
    : `${summary.completed} completed${summary.failed ? ` · ${summary.failed} failed` : ""}`;
  const HeaderIcon = isActive ? LoaderCircle : summary.failed ? CircleAlert : CheckCircle2;

  return (
    <section className="drive-upload-toast" aria-labelledby="drive-upload-toast-title">
      <header className="drive-upload-toast-header">
        <span className="drive-upload-toast-header-icon" aria-hidden="true">
          <HeaderIcon className={isActive ? "drive-toast-spinner" : ""} size={20} />
        </span>
        <div className="drive-upload-toast-heading">
          <h2 id="drive-upload-toast-title">{title}</h2>
          <p>{Subtitle}</p>
        </div>
        <div className="drive-upload-toast-controls">
          <button
            type="button"
            onClick={() => setIsMinimized((value) => !value)}
            aria-label={isMinimized ? "Expand upload activity" : "Minimize upload activity"}
            aria-expanded={!isMinimized}
          >
            {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </header>

      {summary.totalBytes > 0 && (
        <div className="drive-upload-overall">
          <div className="drive-upload-overall-copy">
            <span>{formatSize(summary.uploadedBytes)} of {formatSize(summary.totalBytes)}</span>
            <span>{summary.percent.toFixed(0)}%</span>
          </div>
          <div
            className="drive-upload-progress-track"
            role="progressbar"
            aria-label="Overall file upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(summary.percent)}
          >
            <span style={{ width: `${summary.percent}%` }} />
          </div>
        </div>
      )}

      {!isMinimized && (
        <ul className="drive-upload-list">
          {activeUploads.map((item) => {
            const progress = Math.max(0, Math.min(progressMap[item.id] || 0, 100));
            const status = statusMap[item.id] || (isUploading ? "uploading" : "queued");
            const isFinished = status === "success" || status === "error";
            const StatusIcon = status === "success" ? CheckCircle2 : status === "error" ? CircleAlert : File;

            return (
              <li className="drive-upload-item" key={item.id}>
                <span className={`drive-upload-file-icon is-${status}`} aria-hidden="true">
                  {status === "uploading" || status === "importing"
                    ? <LoaderCircle className="drive-toast-spinner" size={18} />
                    : <StatusIcon size={18} />}
                </span>
                <div className="drive-upload-file-body">
                  <div className="drive-upload-file-heading">
                    <p className="drive-upload-file-name" title={item.name}>{item.name}</p>
                    <span className={`drive-upload-status is-${status}`}>{statusLabels[status] || statusLabels.queued}</span>
                  </div>
                  {item.isImport ? (
                    <p className="drive-upload-file-meta">
                      {status === "success"
                        ? "Imported successfully"
                        : status === "error"
                          ? errorMap[item.id] || "Import failed"
                          : "Progress will update when the import completes"}
                    </p>
                  ) : (
                    <div className="drive-upload-file-meta">
                      <span>{formatSize((item.size || 0) * progress / 100)} of {formatSize(item.size || 0)}</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                  )}
                  {item.isImport && status === "importing" ? (
                    <div className="drive-upload-progress-track is-indeterminate" aria-label="Importing file">
                      <span />
                    </div>
                  ) : (
                    <div
                      className={`drive-upload-progress-track${status === "error" ? " is-error" : ""}`}
                      role="progressbar"
                      aria-label={`${item.name} upload progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(progress)}
                    >
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  )}
                  {status === "error" && errorMap[item.id] && (
                    <p className="drive-upload-error">{errorMap[item.id]}</p>
                  )}
                </div>
                {!item.isImport && !isFinished && isActive && (
                  <button
                    type="button"
                    className="drive-upload-cancel"
                    onClick={() => onCancel?.(item.id)}
                    aria-label={`Cancel ${item.name}`}
                  >
                    <X size={17} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

UploadToast.propTypes = {
  uploadQueue: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    size: PropTypes.number,
    isImport: PropTypes.bool,
  })),
  progressMap: PropTypes.objectOf(PropTypes.number),
  statusMap: PropTypes.objectOf(PropTypes.string),
  errorMap: PropTypes.objectOf(PropTypes.string),
  isUploading: PropTypes.bool,
  onCancel: PropTypes.func,
};

export default UploadToast;
