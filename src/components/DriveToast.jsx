import { useEffect } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  LoaderCircle,
  X,
} from "lucide-react";
import PropTypes from "prop-types";

const toastContent = {
  loading: {
    title: "Working",
    Icon: LoaderCircle,
  },
  success: {
    title: "Done",
    Icon: CheckCircle2,
  },
  error: {
    title: "Something went wrong",
    Icon: AlertCircle,
  },
  warning: {
    title: "Please note",
    Icon: AlertTriangle,
  },
  info: {
    title: "Information",
    Icon: Info,
  },
};

function DriveToast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast.show || toast.type === "loading") return undefined;

    const timer = window.setTimeout(() => onDismiss(toast.id), 5000);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.show, toast.type, onDismiss]);

  if (!toast.show) return null;

  const { title, Icon } = toastContent[toast.type] || toastContent.info;

  return (
    <div
      className={`drive-toast drive-toast-${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
      key={toast.id}
    >
      <span className="drive-toast-icon" aria-hidden="true">
        <Icon className={toast.type === "loading" ? "drive-toast-spinner" : ""} size={20} />
      </span>
      <div className="drive-toast-copy">
        <p>{title}</p>
        <span>{toast.message}</span>
      </div>
      {toast.type !== "loading" && (
        <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">
          <X size={18} />
        </button>
      )}
      <span className={`drive-toast-progress${toast.type === "loading" ? " is-indeterminate" : ""}`} />
    </div>
  );
}

DriveToast.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    message: PropTypes.string,
    show: PropTypes.bool,
    type: PropTypes.string,
  }).isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export default DriveToast;
