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
        if (res && res.activePlan && ["active", "past_due", "created", "authenticated", "pending"].includes(res.activePlan.status)) {
          setData(res);
          refreshUser();
          if (showSuccessOverlay) {
            setActivating(false);
            setTimeout(() => {
              setShowSuccessOverlay(false);
              window.history.replaceState({}, document.title, window.location.pathname);
            }, 2500);
          }
        } else {
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA] gap-3">
        <div className="w-8 h-8 border-2 border-[#E5E7EB] border-t-[#2B8B8F] rounded-full animate-spin"></div>
        <p className="text-xs font-medium text-[#6B7280] tracking-widest uppercase">Syncing Plan...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
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
          <div className="fixed top-6 right-6 z-[100] max-w-sm w-full">
            <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-lg p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4 text-[#E53E3E]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1D1D1D]">Billing Error</p>
                <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-[#6B7280] hover:text-[#1D1D1D] transition-colors p-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Success / Activation Overlay */}
        {showSuccessOverlay && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-10 text-center border border-[#E5E7EB] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#E5E7EB] overflow-hidden">
                {activating && <div className="h-full bg-[#2B8B8F] animate-pulse w-full"></div>}
              </div>
              <div className={`mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-700 ${activating ? 'bg-[#F8F9FA]' : 'bg-green-50'}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white transition-colors duration-700 ${activating ? 'bg-[#2B8B8F]' : 'bg-[#22C55E]'}`}>
                  {activating ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-[#1D1D1D] mb-2 tracking-tight">
                {activating ? "Activating Plan..." : "You're All Set!"}
              </h2>
              <p className="text-sm text-[#6B7280] mb-8 max-w-[260px] mx-auto leading-relaxed">
                {activating
                  ? "Synchronizing your workspace with our cloud infrastructure."
                  : "Your premium access is now live."}
              </p>
              {!activating && (
                <div className="p-3 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping"></div>
                  <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">Opening Dashboard</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancellation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
                    <Trash2 className="w-6 h-6 text-[#E53E3E]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1D1D1D] mb-2">Downgrade to Free?</h3>
                  <p className="text-sm text-[#6B7280] max-w-xs leading-relaxed">
                    Reverting to the free plan will limit your storage and features.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-8">
                  {[
                    { title: "500MB Storage", icon: Database },
                    { title: "100MB Max Upload", icon: UploadCloud },
                    { title: "Single Session", icon: Users },
                    { title: "Archive Risk", icon: AlertTriangle }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB]">
                      <item.icon className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                      <span className="text-xs font-medium text-[#1D1D1D]">{item.title}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={confirmCancellation}
                    disabled={cancelling}
                    className="w-full py-3 bg-[#E53E3E] text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {cancelling ? <Clock className="w-4 h-4 mx-auto animate-spin" /> : "Confirm Downgrade"}
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="w-full py-3 text-sm font-medium text-[#6B7280] hover:text-[#1D1D1D] transition-colors"
                  >
                    Keep Premium Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl border border-[#E5E7EB] flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-4 h-4 text-[#2B8B8F]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#1D1D1D] tracking-tight">Plan Details</h1>
              <p className="text-xs text-[#6B7280]">Management for your CloudVault infrastructure and billing.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-[#E5E7EB] shadow-sm self-start md:self-auto">
            <Clock className="w-3.5 h-3.5 text-[#2B8B8F]" />
            <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Next bill: {data.activePlan.nextBillingDate}</span>
          </div>
        </header>

        {/* Advisory Banner */}
        <div className="bg-white rounded-2xl p-4 mb-8 border border-orange-100 flex items-start gap-3">
          <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 border border-orange-100">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-orange-900 mb-0.5">Billing Advisory</h3>
            <p className="text-xs text-orange-700/80 leading-relaxed max-w-3xl">
              Maintain an active mandate in your banking app. Revoking auto-debit permission results in immediate service termination.
            </p>
          </div>
        </div>

        {/* Trial Status */}
        {data.activePlan.isInTrial && (
          <div className="bg-white rounded-2xl p-5 mb-8 border border-[#E5E7EB] flex flex-col md:flex-row items-center gap-5">
            <div className="w-12 h-12 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] flex items-center justify-center">
              <Star className="w-5 h-5 text-[#2B8B8F]" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                <h3 className="text-sm font-semibold text-[#1D1D1D]">Bonus Trial Active</h3>
                <span className="text-[10px] font-semibold uppercase tracking-widest bg-[#2B8B8F] text-white px-2 py-0.5 rounded-lg">Complementary</span>
              </div>
              <p className="text-xs text-[#6B7280]">
                You have <strong className="text-[#1D1D1D]">{data.activePlan.bonusDays} days</strong> remaining in your premium trial.
              </p>
            </div>
            <div className="bg-[#F8F9FA] px-4 py-2.5 rounded-xl border border-[#E5E7EB] flex flex-col items-center">
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">Valid Until</span>
              <span className="text-sm font-semibold text-[#1D1D1D]">{data.activePlan.trialEndsAt}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Plan Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border-l-4 border-l-[#2B8B8F] border border-[#E5E7EB] shadow-sm p-7">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-5 mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={classNames(
                    "px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider",
                    data.activePlan.status === 'active'
                      ? 'bg-[#E0F5F3] text-[#2B8B8F]'
                      : 'bg-orange-50 text-orange-600'
                  )}>
                    {data.activePlan.status}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#F8F9FA] text-[#6B7280] text-[10px] font-medium border border-[#E5E7EB]">
                    ID: {data.activePlan.planId.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-[#1D1D1D] tracking-tight">{data.activePlan.name}</h2>
                  <p className="text-sm text-[#6B7280] mt-1">{data.activePlan.tagline}</p>
                </div>
              </div>
              <div className="w-12 h-12 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] flex items-center justify-center text-[#2B8B8F]">
                <Zap className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB]">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-3.5 h-3.5 text-[#2B8B8F]" />
                  <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Next Renewal</span>
                </div>
                <div className="text-lg font-semibold text-[#1D1D1D] tracking-tight">{data.activePlan.nextBillingDate}</div>
                <span className="inline-block mt-2 text-[10px] font-semibold text-[#2B8B8F] bg-[#E0F5F3] px-2 py-0.5 rounded-lg">
                  {data.activePlan.daysLeft} days left
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB]">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-3.5 h-3.5 text-[#2B8B8F]" />
                  <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Cycle Amount</span>
                </div>
                <div className="text-lg font-semibold text-[#1D1D1D] tracking-tight">₹{data.activePlan.billingAmount}</div>
                <div className="text-[10px] font-medium text-[#6B7280] mt-2 uppercase tracking-wider">{data.activePlan.billingPeriod}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => navigate("/change-plan")}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2B8B8F] text-white rounded-xl text-sm font-medium hover:bg-[#237375] transition-colors shadow-sm"
              >
                Change Plan
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleViewInvoice}
                disabled={loadingInvoice}
                className="w-10 h-10 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-center text-[#6B7280] hover:text-[#1D1D1D] hover:border-[#1D1D1D] transition-all disabled:opacity-50 shadow-sm"
                title="View Invoice"
              >
                {loadingInvoice ? <Clock className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
              </button>

              {!data.activePlan.cancelledAt && (
                <button
                  onClick={handleCancelSubscription}
                  className="w-10 h-10 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-center text-[#6B7280] hover:text-[#E53E3E] hover:border-[#E53E3E] transition-all shadow-sm"
                  title="Downgrade Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {data.activePlan.cancelledAt && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#E53E3E]" />
                  <span className="text-[10px] font-semibold text-red-800 uppercase tracking-wider">Decaying Post {data.activePlan.nextBillingDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Storage Card */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider block mb-1">Current Storage</span>
                <h3 className="text-base font-semibold text-[#1D1D1D]">Storage Usage</h3>
              </div>
              <div className="w-9 h-9 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] flex items-center justify-center">
                <Database className="w-4 h-4 text-[#2B8B8F]" />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <div className="text-3xl font-semibold text-[#1D1D1D] tracking-tight">{data.storage.usedLabel}</div>
                  <div className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mt-1">Total {data.storage.totalLabel}</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-1 bg-[#F8F9FA] border border-[#E5E7EB] text-[#2B8B8F] rounded-lg">
                  {data.storage.percentageUsed}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className={classNames(
                    "h-full rounded-full transition-all duration-1000",
                    data.storage.percentageUsed > 90 ? "bg-[#E53E3E]" : "bg-[#2B8B8F]"
                  )}
                  style={{ width: `${data.storage.percentageUsed || 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#2B8B8F]/30 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-white border border-[#E5E7EB] rounded-lg flex items-center justify-center shadow-sm">
                    <Zap className="w-3.5 h-3.5 text-[#2B8B8F]" />
                  </div>
                  <span className="text-xs font-medium text-[#1D1D1D]">Download Speed</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-1 bg-[#2B8B8F] text-white rounded-lg uppercase tracking-wider">{data.limits.prioritySpeed}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#2B8B8F]/30 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-white border border-[#E5E7EB] rounded-lg flex items-center justify-center shadow-sm">
                    <UploadCloud className="w-3.5 h-3.5 text-[#2B8B8F]" />
                  </div>
                  <span className="text-xs font-medium text-[#1D1D1D]">Max Upload</span>
                </div>
                <span className="text-xs font-semibold text-[#1D1D1D]">{data.limits.maxFileSize}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px bg-[#E5E7EB] flex-1"></div>
          <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-[0.25em]">Usage Statistics</span>
          <div className="h-px bg-[#E5E7EB] flex-1"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={<HardDrive className="w-4 h-4 text-[#2B8B8F]" />}
            title="Total Files"
            value={data.stats.totalFiles}
          />
          <StatsCard
            icon={<Info className="w-4 h-4 text-[#22C55E]" />}
            title="Shared Files"
            value={data.stats.sharedFiles}
          />
          <StatsCard
            icon={<Users className="w-4 h-4 text-purple-500" />}
            title="Connected Devices"
            value={`${data.stats.devicesConnected} / ${data.stats.maxDevices || 3}`}
          />
          <StatsCard
            icon={<ArrowRight className="w-4 h-4 text-orange-500" />}
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
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5 hover:border-[#2B8B8F]/30 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="text-2xl font-semibold text-[#1D1D1D] tracking-tight mb-1">{value}</div>
      <div className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-widest">{title}</div>
      {subtitle && <div className="text-[10px] text-[#6B7280] mt-1">{subtitle}</div>}
    </div>
  );
}