import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BsLightningChargeFill, 
  BsInboxesFill, 
  BsShareFill, 
  BsPeopleFill, 
  BsCloudUploadFill,
  BsCalendar3,
  BsCreditCard,
  BsHddStack,
  BsStars
} from "react-icons/bs";
import { 
  Info, 
  AlertTriangle, 
  ShieldAlert, 
  Database, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight,
  Receipt,
  Trash2,
  X,
  ChevronRight
} from "lucide-react";
import { getSubscriptionDetails, getInvoiceUrl, cancelSubscription } from "./apis/subscriptionApi";
import { Alert, AlertDescription } from "./components/lightswind/alert";
import DirectoryHeader from "./components/DirectoryHeader";
import { useAuth } from "./context/AuthContext";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function SubscriptionDetails() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  async function handleViewInvoice() {
    try {
      setLoadingInvoice(true);
      const response = await getInvoiceUrl();
      if (response?.invoiceUrl) {
        window.open(response.invoiceUrl, "_blank");
      }
    } catch (err) {
      console.error("Failed to fetch invoice:", err);
      setErrorMessage(err.response?.data?.message || "Failed to load invoice. Please try again.");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setLoadingInvoice(false);
    }
  }

  async function handleCancelSubscription() {
    const limit500MB = 524288000;
    if (data.storage.usedInBytes > limit500MB) {
      setErrorMessage("Data volume exceeds 500MB. Please clear space before downgrading.");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }
    setShowCancelConfirm(true);
  }

  async function confirmCancellation() {
    try {
      setCancelling(true);
      const res = await cancelSubscription(data.activePlan.planId);
      if (res.success) {
        window.location.reload(); 
      }
    } catch (err) {
      console.error("Failed to cancel subscription:", err);
      setErrorMessage(err.response?.data?.message || "Failed to terminate subscription. Internal error.");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setCancelling(false);
      setShowCancelConfirm(false);
    }
  }

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        const res = await getSubscriptionDetails();
        if (res && res.activePlan && ["active", "past_due"].includes(res.activePlan.status)) {
          setData(res);
        } else {
          navigate("/plans", { replace: true });
        }
      } catch (err) {
        navigate("/plans", { replace: true });
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-16 border-4 border-secondary border-t-primary rounded-full animate-spin mb-6"></div>
        <p className="text-sm font-black text-text-main uppercase tracking-widest animate-pulse">Syncing Plan Details...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background">
      <DirectoryHeader
        userName={user?.name || "Guest User"}
        userEmail={user?.email || "guest@example.com"}
        userPicture={user?.picture || ""}
        userRole={user?.role || "User"}
        subscriptionId={user?.subscriptionId}
        subscriptionStatus={user?.subscriptionStatus || "active"}
      />
    <div className="mx-auto max-w-7xl px-4 py-20 pt-32 relative">

      {/* Custom Error Toast */}
      {errorMessage && (
        <div className="fixed top-12 right-6 z-[1000] max-w-sm w-full md:w-[400px] animate-slideIn">
          <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-5 flex items-start gap-4 shadow-strong backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
               <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-red-900 uppercase tracking-tighter mb-1">Authorization Error</h4>
              <p className="text-sm font-bold text-red-700 leading-snug">{errorMessage}</p>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-900 p-1"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-text-main/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-card rounded-[40px] shadow-strong p-10 border border-border animate-scaleIn overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500/20"></div>
            
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[24px] flex items-center justify-center mb-6 shadow-inner">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-text-main mb-3 tracking-tight">Terminate Subscription?</h3>
              <p className="text-muted text-sm font-bold max-w-[320px] leading-relaxed">
                Reverting to the free plan will permanently impact your workspace. Review the following changes:
              </p>
            </div>
            
            <div className="space-y-4 mb-10">
              {[
                { title: "Permanent Deletion", desc: "Files exceeding 500MB will be purged permanently.", icon: ShieldAlert, color: "red" },
                { title: "Storage Downgrade", desc: "Limit resets to the baseline capacity of 500MB.", icon: Database, color: "orange" },
                { title: "Upload Throttling", desc: "Max file size restricted to 100MB per upload.", icon: BsLightningChargeFill, color: "blue" },
                { title: "Connection Limits", desc: "Limited to 1 active device session at a time.", icon: BsPeopleFill, color: "purple" }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50 group hover:border-text-main/10 transition-colors">
                  <div className={classNames(
                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform",
                    item.color === "red" ? "bg-red-100 text-red-600" :
                    item.color === "orange" ? "bg-orange-100 text-orange-600" :
                    item.color === "blue" ? "bg-blue-100 text-blue-600" :
                    "bg-purple-100 text-purple-600"
                  )}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-text-main tracking-tight">{item.title}</h4>
                    <p className="text-xs font-bold text-muted mt-1 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmCancellation}
                disabled={cancelling}
                className="w-full px-8 py-5 bg-red-500 text-white rounded-3xl font-black text-base hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {cancelling ? (
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Confirm Termination"
                )}
              </button>
              <button 
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="w-full px-8 py-4 text-muted rounded-2xl font-black text-sm hover:bg-secondary hover:text-text-main transition-all disabled:opacity-50 uppercase tracking-widest"
              >
                Retain My Plan
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-main tracking-tighter leading-none mb-2">My <span className="text-primary">Workspace</span></h1>
          <p className="text-lg font-bold text-muted">Advanced infrastructure management and billing controls.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-2xl border border-border/50">
           <Clock className="w-4 h-4 text-primary" />
           <span className="text-[10px] font-black text-text-main uppercase tracking-widest">Active Status Since {data.activePlan.nextBillingDate}</span>
        </div>
      </header>

      {/* ⚠️ Auto-pay advisory banner */}
      <div className="group relative bg-white rounded-3xl p-6 mb-10 shadow-lg border-2 border-orange-100/50 hover:border-orange-200 transition-all duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
        <div className="flex items-start gap-5 relative z-10">
          <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-orange-900 tracking-tight leading-none mb-2 capitalize">Crucial Billing Advisory</h3>
            <p className="text-sm font-bold text-orange-800/80 leading-relaxed max-w-3xl">
              Maintain active mandate status in your banking application. Manual revocation of the <span className="text-orange-950 underline decoration-orange-300 decoration-2 underline-offset-4">auto-debit permission</span> results in immediate service termination and automated data archival.
            </p>
          </div>
        </div>
      </div>
      
      {/* Bonus Trial Banner */}
      {data.activePlan.isInTrial && (
        <div className="bg-card rounded-3xl p-8 mb-10 shadow-strong border-2 border-primary/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 transition-opacity opacity-50 group-hover:opacity-100"></div>
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-[24px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
              <BsStars className="w-10 h-10 animate-pulse" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-black text-text-main tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
                Premium Bonus Active
                <span className="text-[10px] bg-primary text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-md">Trial Mode</span>
              </h3>
              <p className="text-base font-bold text-muted leading-relaxed">
                Enjoy <strong>{data.activePlan.bonusDays} complementary days</strong> of high-performance access. Your first billing cycle commences automatically following this period's conclusion.
              </p>
            </div>
            <div className="px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-md border border-primary/20 shadow-sm min-w-[240px]">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-black text-muted uppercase tracking-wider">Termination Date</span>
                 <CheckCircle2 className="w-4 h-4 text-accent" />
              </div>
              <p className="text-lg font-black text-text-main tracking-tight">{data.activePlan.trialEndsAt}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Main Plan Card */}
        <div className="lg:col-span-2 bg-card rounded-[40px] border-2 border-border shadow-sm p-8 sm:p-10 relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-[120px] -z-0 group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-12 relative z-10">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {(() => {
                  const s = data.activePlan.status;
                  const cfg = {
                    active:   { bg: 'bg-accent/10',  text: 'text-accent',  dot: 'bg-accent' },
                    past_due: { bg: 'bg-orange-100',  text: 'text-orange-700',  dot: 'bg-orange-500' },
                    halted:   { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500' },
                  }[s] || { bg: 'bg-secondary', text: 'text-muted', dot: 'bg-muted' };
                  return (
                    <span className={classNames("inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm border border-black/5", cfg.bg, cfg.text)}>
                      <span className={classNames("w-2 h-2 rounded-full mr-2.5 shadow-sm animate-pulse", cfg.dot)}></span>
                      {s === 'past_due' ? 'Payment Pending' : s}
                    </span>
                  );
                })()}
                <span className="px-4 py-1.5 rounded-full bg-secondary text-text-main text-[10px] font-black uppercase tracking-widest border border-border">ID: #{data.activePlan.planId.slice(-6)}</span>
              </div>
              <div>
                 <h2 className="text-3xl sm:text-5xl font-black text-text-main tracking-tighter mb-2">{data.activePlan.name}</h2>
                 <p className="text-lg font-bold text-muted">{data.activePlan.tagline}</p>
              </div>
            </div>
            <div className="w-20 h-20 bg-secondary rounded-[28px] flex items-center justify-center text-primary shadow-inner group-hover:rotate-12 transition-transform duration-500">
              <BsStars className="w-10 h-10" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 relative z-10">
            <div className="bg-white rounded-3xl p-6 border-2 border-border/50 hover:border-primary/20 transition-all group/stat relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/stat:rotate-12 transition-transform capitalize">
                <BsCalendar3 className="w-12 h-12" />
              </div>
              <div className="flex items-center gap-3 text-muted mb-3">
                <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Renewal Schedule</span>
              </div>
              <div className="text-2xl font-black text-text-main tracking-tight mb-1">{data.activePlan.nextBillingDate}</div>
              <div className="text-xs font-bold text-accent uppercase tracking-tighter flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-accent animate-ping"></div>
                  {data.activePlan.daysLeft} days remaining
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border-2 border-border/50 hover:border-primary/20 transition-all group/stat relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/stat:rotate-12 transition-transform capitalize">
                <BsCreditCard className="w-12 h-12" />
              </div>
              <div className="flex items-center gap-3 text-muted mb-3">
                <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Vortex Fee</span>
              </div>
              <div className="text-2xl font-black text-text-main tracking-tight mb-1">₹{data.activePlan.billingAmount}</div>
              <div className="text-xs font-bold text-muted uppercase tracking-widest">{data.activePlan.billingPeriod} Cycle</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 relative z-10">
            <Link 
              to="/change-plan" 
              className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[20px] text-sm font-black hover:bg-button-hover transition-all shadow-lg shadow-primary/20 hover:-translate-y-1 active:translate-y-0"
            >
              Modify Infrastructure
              <ChevronRight className="w-4 h-4" />
            </Link>
            
            <div className="flex gap-2">
              <button 
                onClick={handleViewInvoice}
                disabled={loadingInvoice}
                className="w-14 h-14 bg-white text-muted border-2 border-border rounded-[20px] flex items-center justify-center hover:bg-secondary hover:text-text-main hover:border-primary/20 transition-all disabled:opacity-50 overflow-hidden relative group"
                title="View Invoice"
              >
                {loadingInvoice ? (
                  <div className="w-5 h-5 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Receipt className="w-6 h-6 transition-transform group-hover:scale-110" />
                )}
              </button>
              
              {!data.activePlan.cancelledAt && (
                <button 
                  onClick={handleCancelSubscription}
                  className="w-14 h-14 bg-white text-red-400 border-2 border-border rounded-[20px] flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all group"
                  title="Terminate Plan"
                >
                  <Trash2 className="w-6 h-6 transition-transform group-hover:scale-110" />
                </button>
              )}
            </div>

            {data.activePlan.cancelledAt && (
              <div className="flex items-center gap-4 px-6 py-4 bg-red-50 border-2 border-red-100 rounded-[24px] group animate-pulse">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-red-900 leading-tight uppercase tracking-tighter">Plan Decaying</p>
                  <p className="text-[10px] font-bold text-red-700/80 mt-0.5 leading-snug">Service terminates {data.activePlan.nextBillingDate}. Archive is non-recoverable post-expiry.</p>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Storage Dynamics Card */}
        <div className="bg-card rounded-[40px] border-2 border-border shadow-sm p-8 group hover:border-primary/20 transition-all duration-500">
          <div className="flex items-center justify-between mb-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">Grid Utilization</span>
              <h3 className="text-xl font-black text-text-main tracking-tight">Active Storage</h3>
            </div>
            <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center">
              <Database className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            </div>
          </div>

          <div className="space-y-6 mb-10">
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-4xl font-black text-text-main tracking-tighter">{data.storage.usedLabel}</span>
                <span className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">Allocated of {data.storage.totalLabel}</span>
              </div>
              <div className="text-right">
                <span className={classNames("text-sm font-black px-3 py-1 rounded-lg", data.storage.percentageUsed > 90 ? "bg-red-50 text-red-600" : "bg-primary/10 text-primary")}>
                  {data.storage.percentageUsed}%
                </span>
              </div>
            </div>
            
            <div className="w-full h-4 bg-secondary rounded-full overflow-hidden shadow-inner p-1">
              <div 
                className={classNames("h-full rounded-full transition-all duration-1000 ease-out shadow-sm", data.storage.percentageUsed > 90 ? "bg-red-500" : "bg-primary")}
                style={{ width: `${data.storage.percentageUsed || 0}%` }}
              >
                <div className="w-full h-full bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between p-5 bg-white border-2 border-border/50 rounded-3xl group/row hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover/row:scale-110 transition-transform">
                      <BsLightningChargeFill className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="text-sm font-black text-text-main">Vortex Speed</h4>
                      <p className="text-[10px] font-bold text-muted uppercase">Network Priority</p>
                   </div>
                </div>
                <span className="text-[10px] font-black px-3 py-1 bg-primary text-white rounded-lg uppercase tracking-widest shadow-md shadow-primary/15">{data.limits.prioritySpeed}</span>
             </div>

             <div className="flex items-center justify-between p-5 bg-white border-2 border-border/50 rounded-3xl group/row hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-secondary text-primary rounded-xl flex items-center justify-center group-hover/row:scale-110 transition-transform">
                      <Clock className="w-5 h-5" />
                   </div>
                   <div>
                      <h4 className="text-sm font-black text-text-main">File Threshold</h4>
                      <p className="text-[10px] font-bold text-muted uppercase">Size Limit / Upload</p>
                   </div>
                </div>
                <span className="text-sm font-black text-text-main tracking-tight">{data.limits.maxFileSize}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Intelligence Grid */}
      <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.4em] mb-8 text-center px-4 flex items-center gap-4 justify-center">
        <span className="w-12 h-px bg-border"></span>
        Operational Telemetry
        <span className="w-12 h-px bg-border"></span>
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          icon={<BsInboxesFill className="w-6 h-6 text-primary" />} 
          title="Total Payload" 
          value={data.stats.totalFiles} 
          subtitle="Files managed"
          bgColor="bg-primary/10"
        />
        <StatsCard 
          icon={<BsShareFill className="w-6 h-6 text-accent" />} 
          title="External Node" 
          value={data.stats.sharedFiles} 
          subtitle="Shared assets"
          bgColor="bg-accent/10"
        />
        <StatsCard 
          icon={<BsPeopleFill className="w-6 h-6 text-purple-600" />} 
          title="Active Nodes" 
          value={`${data.stats.devicesConnected} / ${data.stats.maxDevices || 3}`} 
          subtitle="Device sessions"
          bgColor="bg-purple-100/50"
        />
        <StatsCard 
          icon={<BsCloudUploadFill className="w-6 h-6 text-orange-600" />} 
          title="Ingress Traffic" 
          value={data.stats.uploadsDuringSubscription} 
          subtitle="Since activation"
          bgColor="bg-orange-100/50"
        />
      </div>
    </div>
    </div>
  );
}

function StatsCard({ icon, title, value, subtitle, bgColor }) {
  return (
    <div className="group bg-card rounded-3xl border-2 border-border shadow-sm p-7 hover:border-primary/30 transition-all duration-500 hover:-translate-y-1">
      <div className={classNames("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-500", bgColor)}>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-black text-text-main tracking-tighter mb-1">{value}</div>
        <div className="text-[10px] font-black text-muted uppercase tracking-widest leading-none mb-1">{title}</div>
        {subtitle && <div className="text-xs font-bold text-muted/60">{subtitle}</div>}
      </div>
    </div>
  );
}
