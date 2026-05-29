import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  ChevronRight,
  Zap,
  Star,
  HardDrive,
  Users,
  UploadCloud,
  ArrowLeft
} from "lucide-react";
import { getSubscriptionDetails, getInvoiceUrl, cancelSubscription } from "./apis/subscriptionApi";
import { useAuth } from "./context/AuthContext";
import DirectoryHeader from "./components/DirectoryHeader";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function SubscriptionDetails() {
  const { user, refreshUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(() => {
    return new URLSearchParams(window.location.search).get("status") === "success";
  });
  const [activating, setActivating] = useState(true);
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
      setErrorMessage("Storage exceeds 500MB limit. Please free up space before downgrading.");
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
      setErrorMessage(err.response?.data?.message || "Failed to terminate subscription.");
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
          refreshUser();
          
          if (showSuccessOverlay) {
            setActivating(false);
            setTimeout(() => {
              setShowSuccessOverlay(false);
              // Clean up the URL search params so refresh works nicely
              window.history.replaceState({}, document.title, window.location.pathname);
            }, 2500);
          }
        } else {
          // If we are in the middle of activation success overlay, don't boot them to /plans immediately
          // since the self-healing sync might take a second to reconcile.
          if (!showSuccessOverlay) {
            navigate("/plans", { replace: true });
          }
        }
      } catch (err) {
        if (!showSuccessOverlay) {
          navigate("/plans", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [navigate, refreshUser, showSuccessOverlay]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F0F2F5] gap-4">
        <div className="w-10 h-10 border-4 border-[#E2E8F0] border-t-[#3AAFA9] rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-[#64748B] uppercase tracking-widest animate-pulse">Syncing Plan...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <DirectoryHeader
        userName={user?.name || "Guest User"}
        userEmail={user?.email || "guest@example.com"}
        userPicture={user?.picture || ""}
        userRole={user?.role || "User"}
        subscriptionId={user?.subscriptionId}
        subscriptionStatus={user?.subscriptionStatus || "active"}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Error Notification */}
        {errorMessage && (
          <div className="fixed top-8 right-8 z-[100] max-w-sm w-full animate-slideInRight">
            <div className="bg-white border border-red-100 rounded-[16px] shadow-xl p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-[12px] bg-red-50 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#0F172A]">Billing Error</p>
                <p className="text-xs font-medium text-[#64748B] mt-1">{errorMessage}</p>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-[#64748B] hover:text-[#0F172A] p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Success / Activation Overlay */}
        {showSuccessOverlay && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/45 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-md bg-white rounded-[16px] shadow-2xl p-10 text-center border border-[#E2E8F0] overflow-hidden animate-scaleIn">
              {/* Top Progress bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-[#E2E8F0] overflow-hidden">
                {activating && <div className="h-full bg-[#3AAFA9] animate-pulse w-full"></div>}
              </div>

              {/* Icon Container */}
              <div className={`mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[16px] shadow-inner transition-all duration-700 ${activating ? 'bg-[#F0F2F5]' : 'bg-green-50 animate-bounce'}`}>
                <div className={`flex h-14 w-14 items-center justify-center rounded-[12px] text-white shadow-lg transition-colors duration-700 ${activating ? 'bg-[#3AAFA9]' : 'bg-[#22C55E]'}`}>
                  {activating ? (
                     <svg className="w-7 h-7 animate-spin" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                  ) : (
                    <svg className="w-8 h-8 animate-in zoom-in duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              </div>
              
              <h2 className="text-3xl font-black text-[#0F172A] mb-3 tracking-tight">
                {activating ? "Activating Plan..." : "You're All Set!"}
              </h2>
              <p className="text-sm font-bold text-[#64748B] mb-10 max-w-[280px] mx-auto leading-relaxed">
                {activating 
                  ? "We are synchronizing your workspace with our high-speed cloud clusters." 
                  : "Your premium access is now live. Prepare for a seamless cloud experience."}
              </p>

              {!activating && (
                <div className="p-4 rounded-[12px] bg-green-50 border-2 border-green-100 flex items-center justify-center gap-3">
                   <div className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping"></div>
                   <span className="text-xs font-black text-green-600 uppercase tracking-widest">Opening Dashboard</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancellation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-[16px] shadow-2xl border border-[#E2E8F0] overflow-hidden animate-scaleIn">
              <div className="p-8">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 bg-red-50 text-[#EF4444] rounded-[16px] flex items-center justify-center mb-6">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0F172A] mb-2">Downgrade to Free?</h3>
                  <p className="text-sm font-medium text-[#64748B] max-w-sm px-4">
                    Reverting to the free plan will limit your storage and features. 
                    Review the changes carefully.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {[
                    { title: "500MB Storage", icon: Database },
                    { title: "100MB Max Upload", icon: UploadCloud },
                    { title: "Single Session", icon: Users },
                    { title: "Archive Risk", icon: AlertTriangle }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-[8px] bg-[#F0F2F5] border border-[#E2E8F0]">
                      <item.icon className="w-4 h-4 text-[#64748B]" />
                      <span className="text-xs font-bold text-[#0F172A] tracking-tight">{item.title}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={confirmCancellation}
                    disabled={cancelling}
                    className="w-full py-4 bg-[#EF4444] text-white rounded-[8px] font-bold text-sm hover:bg-red-600 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                  >
                    {cancelling ? <Clock className="w-5 h-5 mx-auto animate-spin" /> : "Confirm Downgrade"}
                  </button>
                  <button 
                    onClick={() => setShowCancelConfirm(false)}
                    className="w-full py-3 text-sm font-bold text-[#64748B] hover:text-[#0F172A] transition-colors"
                  >
                    Keep Premium Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-[#3AAFA9]" />
              </div>
              <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">Plan Details</h1>
            </div>
            <p className="text-[14px] font-medium text-[#64748B]">Management for your CloudVault infrastructure and billing.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-[8px] border border-[#E2E8F0] shadow-sm">
             <Clock className="w-4 h-4 text-[#3AAFA9]" />
             <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Next bill: {data.activePlan.nextBillingDate}</span>
          </div>
        </header>

        {/* Advisory Banner */}
        <div className="bg-white rounded-[16px] p-5 mb-10 shadow-sm border border-orange-100 flex items-start gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/30 rounded-full blur-2xl -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
          <div className="flex-shrink-0 w-10 h-10 bg-orange-50 rounded-[12px] flex items-center justify-center border border-orange-100 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-orange-900 mb-1">Billing Advisory</h3>
            <p className="text-xs font-medium text-orange-700/80 leading-relaxed max-w-3xl">
              Maintain an active mandate in your banking app. Revoking auto-debit permission results in immediate service termination.
            </p>
          </div>
        </div>
        
        {/* Trial Status */}
        {data.activePlan.isInTrial && (
          <div className="bg-gradient-to-r from-[#3AAFA9]/5 to-[#3AAFA9]/10 rounded-[16px] p-6 mb-10 border border-[#3AAFA9]/20 flex flex-col md:flex-row items-center gap-6">
            <div className="w-14 h-14 bg-white rounded-[16px] border border-[#3AAFA9]/20 flex items-center justify-center shadow-sm">
              <Star className="w-7 h-7 text-[#3AAFA9] animate-pulse" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-1">
                <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">Bonus Trial Active</h3>
                <span className="text-[10px] font-black uppercase tracking-widest bg-[#3AAFA9] text-white px-2 py-0.5 rounded-[8px] shadow-sm">Complementary</span>
              </div>
              <p className="text-sm font-medium text-[#64748B]">
                You have <strong>{data.activePlan.bonusDays} days</strong> remaining in your premium trial.
              </p>
            </div>
            <div className="bg-white px-4 py-3 rounded-[12px] border border-[#E2E8F0] shadow-sm flex flex-col items-center">
              <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1">Valid Until</span>
              <span className="text-sm font-bold text-[#0F172A] tracking-tight">{data.activePlan.trialEndsAt}</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Main Context Card */}
          <div className="lg:col-span-2 bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-8 relative overflow-hidden group">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={classNames(
                    "px-3 py-1 rounded-[8px] text-[10px] font-black uppercase tracking-widest border",
                    data.activePlan.status === 'active' ? 'bg-green-50 text-[#22C55E] border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                  )}>
                    {data.activePlan.status}
                  </span>
                  <span className="px-3 py-1 rounded-[8px] bg-[#F0F2F5] text-[#64748B] text-[10px] font-black uppercase tracking-widest border border-[#E2E8F0]">ID: {data.activePlan.planId.slice(-6).toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight">{data.activePlan.name}</h2>
                  <p className="text-sm font-medium text-[#64748B] mt-1">{data.activePlan.tagline}</p>
                </div>
              </div>
              <div className="w-16 h-16 bg-[#F0F2F5] rounded-[16px] border border-[#E2E8F0] flex items-center justify-center text-[#3AAFA9] group-hover:rotate-12 transition-transform shadow-inner">
                <Zap className="w-8 h-8" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="p-5 rounded-[12px] bg-[#F0F2F5] border border-[#E2E8F0]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-white rounded-[8px] border border-[#E2E8F0] flex items-center justify-center shadow-sm">
                    <Clock className="w-4 h-4 text-[#3AAFA9]" />
                  </div>
                  <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Next Renewal</span>
                </div>
                <div className="text-xl font-bold text-[#0F172A] tracking-tight">{data.activePlan.nextBillingDate}</div>
                <div className="text-xs font-bold text-[#3AAFA9] mt-1">{data.activePlan.daysLeft} days left</div>
              </div>

              <div className="p-5 rounded-[12px] bg-[#F0F2F5] border border-[#E2E8F0]">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-white rounded-[8px] border border-[#E2E8F0] flex items-center justify-center shadow-sm">
                    <CreditCard className="w-4 h-4 text-[#3AAFA9]" />
                  </div>
                  <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Cycle Amount</span>
                </div>
                <div className="text-xl font-bold text-[#0F172A] tracking-tight">₹{data.activePlan.billingAmount}</div>
                <div className="text-xs font-bold text-[#64748B] mt-1 uppercase tracking-widest">{data.activePlan.billingPeriod}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => navigate("/change-plan")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#3AAFA9] text-white rounded-[8px] text-sm font-bold hover:bg-[#2D8B8B] transition-all shadow-sm active:scale-[0.98]"
              >
                Change Plan
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={handleViewInvoice}
                disabled={loadingInvoice}
                className="w-12 h-12 bg-white border border-[#E2E8F0] rounded-[8px] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:border-[#0F172A] transition-all disabled:opacity-50 shadow-sm"
                title="View Invoice"
              >
                {loadingInvoice ? <Clock className="w-5 h-5 animate-spin" /> : <Receipt className="w-5 h-5" />}
              </button>
              
              {!data.activePlan.cancelledAt && (
                <button 
                  onClick={handleCancelSubscription}
                  className="w-12 h-12 bg-white border border-[#E2E8F0] rounded-[8px] flex items-center justify-center text-[#64748B] hover:text-[#EF4444] hover:border-[#EF4444] transition-all shadow-sm"
                  title="Downgrade Plan"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}

              {data.activePlan.cancelledAt && (
                <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border border-red-100 rounded-[8px] animate-pulse">
                  <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
                  <span className="text-[10px] font-black text-red-900 uppercase">Decaying Post {data.activePlan.nextBillingDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Storage Snapshot */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-8 group">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-1 block">Current Storage</span>
                <h3 className="text-lg font-bold text-[#0F172A]">Storage Usage</h3>
              </div>
              <div className="w-10 h-10 bg-[#F0F2F5] rounded-[12px] border border-[#E2E8F0] flex items-center justify-center shadow-inner">
                <Database className="w-5 h-5 text-[#3AAFA9] group-hover:scale-110 transition-transform" />
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-4xl font-bold text-[#0F172A] tracking-tight">{data.storage.usedLabel}</div>
                  <div className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mt-1">Total {data.storage.totalLabel}</div>
                </div>
                <div className="text-[10px] font-black px-2 py-1 bg-[#F0F2F5] border border-[#E2E8F0] text-[#3AAFA9] rounded-[8px]">
                  {data.storage.percentageUsed}%
                </div>
              </div>
              
              <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden flex">
                <div 
                  className={classNames("h-full rounded-full transition-all duration-1000 ease-out", data.storage.percentageUsed > 90 ? "bg-[#EF4444]" : "bg-[#3AAFA9]")}
                  style={{ width: `${data.storage.percentageUsed || 0}%` }}
                >
                  <div className="w-full h-full bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center justify-between p-4 rounded-[12px] bg-[#F0F2F5]/50 border border-[#E2E8F0] group/row hover:border-[#3AAFA9]/20 transition-all">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-white border border-[#E2E8F0] rounded-[8px] flex items-center justify-center shadow-sm">
                        <Zap className="w-4 h-4 text-[#3AAFA9]" />
                     </div>
                     <span className="text-xs font-bold text-[#0F172A]">Download Speed</span>
                  </div>
                  <span className="text-[9px] font-black px-2 py-1 bg-[#3AAFA9] text-white rounded-[8px] tracking-widest uppercase">{data.limits.prioritySpeed}</span>
               </div>

               <div className="flex items-center justify-between p-4 rounded-[12px] bg-[#F0F2F5]/50 border border-[#E2E8F0] group/row hover:border-[#3AAFA9]/20 transition-all">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-white border border-[#E2E8F0] rounded-[8px] flex items-center justify-center shadow-sm">
                        <UploadCloud className="w-4 h-4 text-[#3AAFA9]" />
                     </div>
                     <span className="text-xs font-bold text-[#0F172A]">Max Upload</span>
                  </div>
                  <span className="text-xs font-bold text-[#0F172A]">{data.limits.maxFileSize}</span>
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-[#E2E8F0] flex-1"></div>
          <span className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.3em]">Usage Statistics</span>
          <div className="h-px bg-[#E2E8F0] flex-1"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            icon={<HardDrive className="w-5 h-5 text-[#3AAFA9]" />} 
            title="Total Files" 
            value={data.stats.totalFiles} 
          />
          <StatsCard 
            icon={<Info className="w-5 h-5 text-[#22C55E]" />} 
            title="Shared Files" 
            value={data.stats.sharedFiles} 
          />
          <StatsCard 
            icon={<Users className="w-5 h-5 text-purple-500" />} 
            title="Connected Devices" 
            value={`${data.stats.devicesConnected} / ${data.stats.maxDevices || 3}`} 
          />
          <StatsCard 
            icon={<ArrowRight className="w-5 h-5 text-orange-500" />} 
            title="Uploads this Cycle" 
            value={data.stats.uploadsDuringSubscription} 
          />
        </div>
      </div>
    </div>
  );
}

function StatsCard({ icon, title, value, subtitle }) {
  return (
    <div className="group bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm p-6 hover:shadow-md transition-all duration-300">
      <div className="w-12 h-12 rounded-[12px] bg-[#F0F2F5] flex items-center justify-center mb-6 shadow-inner ring-1 ring-[#E2E8F0] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-[#0F172A] tracking-tight leading-none mb-1">{value}</div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">{title}</span>
          <span className="text-[9px] font-bold text-[#3AAFA9] opacity-0 group-hover:opacity-100 transition-opacity">Live</span>
        </div>
        {subtitle && <div className="text-[10px] font-medium text-[#64748B] mt-2">{subtitle}</div>}
      </div>
    </div>
  );
}
