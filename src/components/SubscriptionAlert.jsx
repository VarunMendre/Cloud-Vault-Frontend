import { useState } from "react";
import { 
  ShieldAlert, 
  HelpCircle, 
  Mail, 
  ChevronDown, 
  ChevronUp, 
  Info,
  CreditCard,
  X
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "./lightswind/alert";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function SubscriptionAlert({
  title = "Infrastructure Alert",
  message,
  onClose,
  showSafetyNotice = true,
  troubleshootingTip = null
}) {
  const [showTechnical, setShowTechnical] = useState(false);
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-text-main/60 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Alert Container */}
      <div className="relative w-full max-w-2xl bg-card rounded-[40px] shadow-strong border border-border overflow-hidden animate-scaleIn">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500/20"></div>
        
        <div className="p-8 sm:p-10">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Icon Section */}
            <div className="flex-shrink-0 flex justify-center md:block">
              <div className="w-16 h-16 bg-red-50 rounded-[20px] flex items-center justify-center text-red-500 shadow-inner border border-red-100">
                <CreditCard className="w-8 h-8" />
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-black text-text-main tracking-tight leading-none mb-1">{title}</h3>
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Gateway Disruption Detected</p>
                </div>
                <button 
                  onClick={onClose} 
                  className="w-10 h-10 flex items-center justify-center text-muted hover:text-text-main bg-secondary rounded-[14px] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-base font-bold text-muted leading-relaxed mb-8">
                {message}
              </p>

              {/* Troubleshooting Tip (NEW) */}
              {troubleshootingTip && (
                <div className="bg-primary/5 rounded-2xl p-5 mb-6 border border-primary/10 group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-2.5 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                    <Info className="w-4 h-4" />
                    Strategic Recovery
                  </div>
                  <p className="text-text-main/90 text-sm font-bold leading-relaxed">
                    {troubleshootingTip}
                  </p>
                </div>
              )}

              {/* Support Box */}
              <div className="bg-secondary/50 rounded-2xl p-5 mb-6 border border-border/50 group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm border border-border group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-0.5">Concierge Support</p>
                      <p className="text-sm font-bold text-text-main">
                        Contact us at <a href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL}`} className="text-primary hover:underline underline-offset-4">{import.meta.env.VITE_SUPPORT_EMAIL}</a>
                      </p>
                   </div>
                </div>
              </div>

              {/* Safety Notice */}
              {showSafetyNotice && (
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 mb-8">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-emerald-900/80 leading-relaxed">
                    <strong>Infrastructure Integrity Guaranteed:</strong> Your stored assets remain immutable and encrypted during this synchronization period. Service state will refresh upon resolution.
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-border/50">
                <button
                  onClick={() => setShowTechnical(!showTechnical)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted hover:text-text-main transition-colors"
                >
                  {showTechnical ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showTechnical ? "Minimize Telemetry" : "Examine Telemetry Details"}
                </button>

                {showTechnical && (
                  <div className="mt-4 p-4 bg-text-main text-white/80 rounded-xl font-mono text-[10px] shadow-inner break-all border border-white/5 animate-slideDown">
                    <span className="text-primary mr-2">LOG_LEVEL:CRITICAL</span> 
                    Context: razorpay_payment_failed_event_tracking | Node: edge-relay-vx-01
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
