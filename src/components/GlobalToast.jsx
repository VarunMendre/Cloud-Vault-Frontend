import { useState, useEffect } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import "./GlobalToast.css";

const toastContent = {
  success: { title: "Success", Icon: CheckCircle2 },
  error: { title: "Something went wrong", Icon: AlertCircle },
  warning: { title: "Please note", Icon: AlertTriangle },
  info: { title: "Information", Icon: Info },
};

export default function GlobalToast() {
  const [toast, setToast] = useState({ show: false, message: "", type: "info", id: 0 });

  useEffect(() => {
    const handleGlobalToast = (event) => {
      setToast({
        show: true,
        message: typeof event.detail?.message === "string" ? event.detail.message : "",
        type: toastContent[event.detail?.type] ? event.detail.type : "info",
        id: Date.now() + Math.random(),
      });
    };

    window.addEventListener("global-toast", handleGlobalToast);
    return () => window.removeEventListener("global-toast", handleGlobalToast);
  }, []);

  useEffect(() => {
    if (!toast.show) return undefined;

    const timer = window.setTimeout(() => {
      setToast((current) => current.id === toast.id ? { ...current, show: false } : current);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [toast.id, toast.show]);

  if (!toast.show) return null;
  const { title, Icon } = toastContent[toast.type] || toastContent.info;

  return (
    <div
      key={toast.id}
      className={`global-toast global-toast-${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
      aria-live={toast.type === "error" ? "assertive" : "polite"}
    >
      <span className="global-toast-icon" aria-hidden="true"><Icon size={20} /></span>
      <div className="global-toast-copy">
        <p>{title}</p>
        <span>{toast.message}</span>
      </div>
      <button
        type="button"
        onClick={() => setToast((current) => ({ ...current, show: false }))}
        aria-label="Dismiss notification"
      >
        <X size={18} />
      </button>
      <span className="global-toast-progress" />
    </div>
  );
}
