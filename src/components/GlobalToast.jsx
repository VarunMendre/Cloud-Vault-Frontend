import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function GlobalToast() {
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  useEffect(() => {
    const handleGlobalToast = (event) => {
      setToast({ show: true, message: event.detail.message, type: event.detail.type || "info" });
      setTimeout(() => setToast({ show: false, message: "", type: "info" }), 5000);
    };

    window.addEventListener("global-toast", handleGlobalToast);
    return () => window.removeEventListener("global-toast", handleGlobalToast);
  }, []);

  if (!toast.show) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[200] max-w-sm w-full animate-slideInRight">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 flex items-start gap-4 backdrop-blur-md">
        <div className={classNames(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner",
          toast.type === 'error' ? 'bg-red-50 text-red-500 border border-red-100' :
          toast.type === 'success' ? 'bg-green-50 text-green-500 border border-green-100' :
          'bg-[#66B2D6]/10 text-[#66B2D6] border border-[#66B2D6]/20'
        )}>
          {toast.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : 
           toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
           <Info className="w-5 h-5" />}
        </div>
        <div className="flex-1 pt-1">
          <p className="text-sm font-bold text-gray-900 leading-tight">
             {toast.type === 'error' ? 'Error' : toast.type === 'success' ? 'Success' : 'Notification'}
          </p>
          <p className="text-xs font-medium text-gray-400 mt-1">{toast.message}</p>
        </div>
        <button onClick={() => setToast({ ...toast, show: false })} className="text-gray-300 hover:text-gray-900 transition-colors p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
