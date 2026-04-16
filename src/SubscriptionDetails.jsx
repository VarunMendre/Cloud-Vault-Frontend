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
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#66B2D6] rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Plan...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="bg-white border border-red-100 rounded-2xl shadow-xl p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Billing Error</p>
                <p className="text-xs font-medium text-gray-400 mt-1">{errorMessage}</p>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-gray-300 hover:text-gray-900 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Cancellation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-scaleIn">
              <div className="p-8">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Downgrade to Free?</h3>
                  <p className="text-sm font-medium text-gray-400 max-w-sm px-4">
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
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <item.icon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-600 tracking-tight">{item.title}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={confirmCancellation}
                    disabled={cancelling}
                    className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                  >
                    {cancelling ? <Clock className="w-5 h-5 mx-auto animate-spin" /> : "Confirm Downgrade"}
                  </button>
                  <button 
                    onClick={() => setShowCancelConfirm(false)}
                    className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
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
              <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-[#66B2D6]" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Plan Details</h1>
            </div>
            <p className="text-sm font-medium text-gray-400">Management for your CloudVault infrastructure and billing.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
             <Clock className="w-4 h-4 text-[#66B2D6]" />
             <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Next bill: {data.activePlan.nextBillingDate}</span>
          </div>
        </header>

        {/* Advisory Banner */}
        <div className="bg-white rounded-2xl p-5 mb-10 shadow-sm border border-orange-100 flex items-start gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/30 rounded-full blur-2xl -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
          <div className="flex-shrink-0 w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100 shadow-sm">
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
          <div className="bg-gradient-to-r from-[#66B2D6]/5 to-[#66B2D6]/10 rounded-2xl p-6 mb-10 border border-[#66B2D6]/20 flex flex-col md:flex-row items-center gap-6">
            <div className="w-14 h-14 bg-white rounded-2xl border border-[#66B2D6]/20 flex items-center justify-center shadow-sm">
              <Star className="w-7 h-7 text-[#66B2D6] animate-pulse" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 justify-center md:justify-start mb-1">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Bonus Trial Active</h3>
                <span className="text-[10px] font-black uppercase tracking-widest bg-[#66B2D6] text-white px-2 py-0.5 rounded-lg shadow-sm">Complementary</span>
              </div>
              <p className="text-sm font-medium text-gray-500">
                You have <strong>{data.activePlan.bonusDays} days</strong> remaining in your premium trial.
              </p>
            </div>
            <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Valid Until</span>
              <span className="text-sm font-bold text-gray-900 tracking-tight">{data.activePlan.trialEndsAt}</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Main Context Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm p-8 relative overflow-hidden group">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={classNames(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                    data.activePlan.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                  )}>
                    {data.activePlan.status}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border border-gray-100">ID: {data.activePlan.planId.slice(-6).toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{data.activePlan.name}</h2>
                  <p className="text-sm font-medium text-gray-400 mt-1">{data.activePlan.tagline}</p>
                </div>
              </div>
              <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center text-[#66B2D6] group-hover:rotate-12 transition-transform shadow-inner">
                <Zap className="w-8 h-8" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
                    <Clock className="w-4 h-4 text-[#66B2D6]" />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Renewal</span>
                </div>
                <div className="text-xl font-bold text-gray-900 tracking-tight">{data.activePlan.nextBillingDate}</div>
                <div className="text-xs font-bold text-[#66B2D6] mt-1">{data.activePlan.daysLeft} days left</div>
              </div>

              <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
                    <CreditCard className="w-4 h-4 text-[#66B2D6]" />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cycle Amount</span>
                </div>
                <div className="text-xl font-bold text-gray-900 tracking-tight">₹{data.activePlan.billingAmount}</div>
                <div className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{data.activePlan.billingPeriod}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => navigate("/change-plan")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#66B2D6] text-white rounded-xl text-sm font-bold hover:bg-[#5aa0c1] transition-all shadow-sm active:scale-[0.98]"
              >
                Change Plan
                <ChevronRight className="w-4 h-4" />
              </button>
              
              <button 
                onClick={handleViewInvoice}
                disabled={loadingInvoice}
                className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-all disabled:opacity-50 shadow-sm"
                title="View Invoice"
              >
                {loadingInvoice ? <Clock className="w-5 h-5 animate-spin" /> : <Receipt className="w-5 h-5" />}
              </button>
              
              {!data.activePlan.cancelledAt && (
                <button 
                  onClick={handleCancelSubscription}
                  className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm"
                  title="Downgrade Plan"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}

              {data.activePlan.cancelledAt && (
                <div className="flex items-center gap-3 px-4 py-2 bg-red-50 border border-red-100 rounded-xl animate-pulse">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  <span className="text-[10px] font-black text-red-900 uppercase">Decaying Post {data.activePlan.nextBillingDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Storage Snapshot */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 group">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Live Utilization</span>
                <h3 className="text-lg font-bold text-gray-900">Storage Grid</h3>
              </div>
              <div className="w-10 h-10 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center shadow-inner">
                <Database className="w-5 h-5 text-[#66B2D6] group-hover:scale-110 transition-transform" />
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-4xl font-bold text-gray-900 tracking-tight">{data.storage.usedLabel}</div>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total {data.storage.totalLabel}</div>
                </div>
                <div className="text-[10px] font-black px-2 py-1 bg-gray-50 border border-gray-100 text-[#66B2D6] rounded-lg">
                  {data.storage.percentageUsed}%
                </div>
              </div>
              
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner flex">
                <div 
                  className={classNames("h-full rounded-full transition-all duration-1000 ease-out", data.storage.percentageUsed > 90 ? "bg-red-500" : "bg-[#66B2D6]")}
                  style={{ width: `${data.storage.percentageUsed || 0}%` }}
                >
                  <div className="w-full h-full bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 group/row hover:border-[#66B2D6]/20 transition-all">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                        <Zap className="w-4 h-4 text-[#66B2D6]" />
                     </div>
                     <span className="text-xs font-bold text-gray-600">Vortex Speed</span>
                  </div>
                  <span className="text-[9px] font-black px-2 py-1 bg-[#66B2D6] text-white rounded-md tracking-widest uppercase">{data.limits.prioritySpeed}</span>
               </div>

               <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 group/row hover:border-[#66B2D6]/20 transition-all">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                        <UploadCloud className="w-4 h-4 text-[#66B2D6]" />
                     </div>
                     <span className="text-xs font-bold text-gray-600">Max Upload</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{data.limits.maxFileSize}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Operational Grid */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Operational Telemetry</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            icon={<HardDrive className="w-5 h-5 text-[#66B2D6]" />} 
            title="Total Assets" 
            value={data.stats.totalFiles} 
            subtitle="Payload"
          />
          <StatsCard 
            icon={<Info className="w-5 h-5 text-green-500" />} 
            title="External Links" 
            value={data.stats.sharedFiles} 
            subtitle="Public Node"
          />
          <StatsCard 
            icon={<Users className="w-5 h-5 text-purple-500" />} 
            title="Sessions" 
            value={`${data.stats.devicesConnected} / ${data.stats.maxDevices || 3}`} 
            subtitle="Live Nodes"
          />
          <StatsCard 
            icon={<ArrowRight className="w-5 h-5 text-orange-500" />} 
            title="Ingress Count" 
            value={data.stats.uploadsDuringSubscription} 
            subtitle="Lifecycle"
          />
        </div>
      </div>
    </div>
  );
}

function StatsCard({ icon, title, value, subtitle }) {
  return (
    <div className="group bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-6 shadow-inner ring-1 ring-gray-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 tracking-tight leading-none mb-1">{value}</div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</span>
          <span className="text-[9px] font-bold text-[#66B2D6] opacity-0 group-hover:opacity-100 transition-opacity">Live</span>
        </div>
        {subtitle && <div className="text-[10px] font-medium text-gray-400 mt-2">{subtitle}</div>}
      </div>
    </div>
  );
}
