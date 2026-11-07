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
import "./SubscriptionDetails.css";

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
      <div className="subscription-page flex min-h-screen flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--cv-border)] border-t-[var(--cv-primary)]"></div>
        <p className="text-sm font-medium text-[var(--cv-text-muted)]">Syncing plan...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="subscription-page min-h-screen">
      <DirectoryHeader
        userName={user?.name || "Guest User"}
        userEmail={user?.email || "guest@example.com"}
        userPicture={user?.picture || ""}
        userRole={user?.role || "User"}
        subscriptionId={user?.subscriptionId || data?.activePlan?.planId}
        subscriptionStatus={user?.subscriptionStatus || "active"}
      />

      <main className="subscription-content mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">

        {/* Error Notification */}
        {errorMessage && (
          <div className="subscription-error fixed right-4 top-20 z-[100] w-[calc(100%-2rem)] max-w-sm sm:right-6" role="alert" aria-live="polite">
            <div className="subscription-notice bg-white border border-[var(--cv-border)] rounded-2xl shadow-lg p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--cv-danger-background)] flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4 text-[var(--cv-danger)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--cv-text)]">Billing Error</p>
                <p className="text-xs text-[var(--cv-text-muted)] mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
              <button type="button" onClick={() => setErrorMessage(null)} aria-label="Dismiss billing error" className="min-h-11 min-w-11 rounded-lg p-2 text-[var(--cv-text-muted)] transition-colors hover:bg-[var(--cv-surface-muted)] hover:text-[var(--cv-text)]">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Success / Activation Overlay */}
        {showSuccessOverlay && (
          <div className="subscription-overlay fixed inset-0 z-[1000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="subscription-success-title">
            <div className="subscription-dialog relative w-full max-w-md bg-white rounded-2xl shadow-xl p-10 text-center border border-[var(--cv-border)] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--cv-border)] overflow-hidden">
                {activating && <div className="h-full bg-[var(--cv-primary)] animate-pulse w-full"></div>}
              </div>
              <div className={`mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-700 ${activating ? 'bg-[var(--cv-surface-muted)]' : 'bg-[var(--cv-success-background)]'}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white transition-colors duration-700 ${activating ? 'bg-[var(--cv-primary)]' : 'bg-[var(--cv-success)]'}`}>
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
              <h2 id="subscription-success-title" className="text-2xl font-semibold text-[var(--cv-text)] mb-2 tracking-tight">
                {activating ? "Activating Plan..." : "You're All Set!"}
              </h2>
              <p className="text-sm text-[var(--cv-text-muted)] mb-8 max-w-[260px] mx-auto leading-relaxed">
                {activating
                  ? "Synchronizing your workspace with our cloud infrastructure."
                  : "Your premium access is now live."}
              </p>
              {!activating && (
                <div className="p-3 rounded-xl bg-[var(--cv-success-background)] border border-[var(--cv-border)] flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--cv-success)] animate-ping"></div>
                  <span className="text-xs font-semibold text-[var(--cv-success)] uppercase tracking-wider">Opening Dashboard</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cancellation Modal */}
        {showCancelConfirm && (
          <div className="subscription-overlay fixed inset-0 z-[1000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="subscription-cancel-title">
            <div className="subscription-dialog w-full max-w-md bg-white rounded-2xl shadow-xl border border-[var(--cv-border)] overflow-hidden">
              <div className="p-8">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--cv-danger-background)]">
                    <Trash2 className="w-6 h-6 text-[var(--cv-danger)]" />
                  </div>
                  <h3 id="subscription-cancel-title" className="text-xl font-semibold text-[var(--cv-text)] mb-2">Downgrade to Free?</h3>
                  <p className="text-sm text-[var(--cv-text-muted)] max-w-xs leading-relaxed">
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
                    <div key={idx} className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--cv-surface-muted)] border border-[var(--cv-border)]">
                      <item.icon className="w-3.5 h-3.5 text-[var(--cv-text-muted)] shrink-0" />
                      <span className="text-xs font-medium text-[var(--cv-text)]">{item.title}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={confirmCancellation}
                    disabled={cancelling}
                    className="subscription-danger-action w-full py-3 bg-[var(--cv-danger)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--cv-danger)] transition-colors disabled:opacity-50"
                  >
                    {cancelling ? <Clock className="w-4 h-4 mx-auto animate-spin" /> : "Confirm Downgrade"}
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="subscription-secondary-action w-full py-3 text-sm font-medium text-[var(--cv-text-muted)] hover:text-[var(--cv-text)] transition-colors"
                  >
                    Keep Premium Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <header className="subscription-page-heading mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl border border-[var(--cv-border)] flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-4 h-4 text-[var(--cv-primary)]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[var(--cv-text)] tracking-tight">Plan Details</h1>
              <p className="text-xs text-[var(--cv-text-muted)]">Management for your CloudVault infrastructure and billing.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-[var(--cv-border)] shadow-sm self-start md:self-auto">
            <Clock className="w-3.5 h-3.5 text-[var(--cv-primary)]" />
            <span className="text-xs font-medium text-[var(--cv-text-muted)] uppercase tracking-wider">Next bill: {["created", "pending"].includes(data.activePlan.status) ? "Pending" : data.activePlan.nextBillingDate}</span>
          </div>
        </header>

        {/* Advisory Banner */}
        <div className="subscription-advisory bg-white rounded-2xl p-4 mb-8 border border-amber-200 flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-[var(--cv-accent)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--cv-text)] mb-0.5">Billing Advisory</h3>
            <p className="text-xs text-[var(--cv-text-muted)] leading-relaxed max-w-3xl">
              Maintain an active mandate in your banking app. Revoking auto-debit permission results in immediate service termination.
            </p>
          </div>
        </div>

        {/* Trial Status */}
        {data.activePlan.isInTrial && (
          <div className="subscription-trial bg-white rounded-2xl p-5 mb-8 border border-[var(--cv-border)] flex flex-col md:flex-row items-center gap-5">
            <div className="w-12 h-12 bg-[var(--cv-surface-muted)] rounded-xl border border-[var(--cv-border)] flex items-center justify-center">
              <Star className="w-5 h-5 text-[var(--cv-primary)]" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-1">
                <h3 className="text-sm font-semibold text-[var(--cv-text)]">Bonus Trial Active</h3>
                <span className="text-[10px] font-semibold uppercase tracking-widest bg-[var(--cv-primary)] text-white px-2 py-0.5 rounded-lg">Complementary</span>
              </div>
              <p className="text-xs text-[var(--cv-text-muted)]">
                You have <strong className="text-[var(--cv-text)]">{data.activePlan.bonusDays} days</strong> remaining in your premium trial.
              </p>
            </div>
            <div className="bg-[var(--cv-surface-muted)] px-4 py-2.5 rounded-xl border border-[var(--cv-border)] flex flex-col items-center">
              <span className="text-[10px] font-semibold text-[var(--cv-text-muted)] uppercase tracking-wider mb-1">Valid Until</span>
              <span className="text-sm font-semibold text-[var(--cv-text)]">{data.activePlan.trialEndsAt}</span>
            </div>
          </div>
        )}

        <div className="subscription-plan-grid grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Plan Card */}
          <div className="subscription-plan-card lg:col-span-2 bg-white rounded-2xl border-l-4 border-l-[var(--cv-primary)] border border-[var(--cv-border)] shadow-sm p-7">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-5 mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={classNames(
                    "px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider",
                    data.activePlan.status === 'active'
                      ? 'bg-[var(--cv-success-background)] text-[var(--cv-success)]'
                      : 'bg-amber-50 text-amber-900'
                  )}>
                    {data.activePlan.status}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[var(--cv-surface-muted)] text-[var(--cv-text-muted)] text-[10px] font-medium border border-[var(--cv-border)]">
                    ID: {data.activePlan.planId.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-[var(--cv-text)] tracking-tight">{data.activePlan.name}</h2>
                  <p className="text-sm text-[var(--cv-text-muted)] mt-1">{data.activePlan.tagline}</p>
                </div>
              </div>
              <div className="w-12 h-12 bg-[var(--cv-surface-muted)] rounded-xl border border-[var(--cv-border)] flex items-center justify-center text-[var(--cv-primary)]">
                <Zap className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-[var(--cv-surface-muted)] border border-[var(--cv-border)]">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-3.5 h-3.5 text-[var(--cv-primary)]" />
                  <span className="text-[10px] font-semibold text-[var(--cv-text-muted)] uppercase tracking-wider">Next Renewal</span>
                </div>
                <div className="text-lg font-semibold text-[var(--cv-text)] tracking-tight">
                  {["created", "pending"].includes(data.activePlan.status) ? "Pending" : data.activePlan.nextBillingDate}
                </div>
                <span className="inline-block mt-2 text-[10px] font-semibold text-[var(--cv-primary)] bg-[var(--cv-success-background)] px-2 py-0.5 rounded-lg">
                  {["created", "pending"].includes(data.activePlan.status) ? "Awaiting Activation" : `${data.activePlan.daysLeft} days left`}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[var(--cv-surface-muted)] border border-[var(--cv-border)]">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-3.5 h-3.5 text-[var(--cv-primary)]" />
                  <span className="text-[10px] font-semibold text-[var(--cv-text-muted)] uppercase tracking-wider">Cycle Amount</span>
                </div>
                <div className="text-lg font-semibold text-[var(--cv-text)] tracking-tight">₹{data.activePlan.billingAmount}</div>
                <div className="text-[10px] font-medium text-[var(--cv-text-muted)] mt-2 uppercase tracking-wider">{data.activePlan.billingPeriod}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => navigate("/change-plan")}
                className="subscription-primary-action inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--cv-primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--cv-primary-hover)] transition-colors shadow-sm"
              >
                Change Plan
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleViewInvoice}
                disabled={loadingInvoice}
                aria-label="View invoice"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--cv-border)] bg-white text-[var(--cv-text-muted)] shadow-sm transition-colors hover:border-[var(--cv-primary)] hover:text-[var(--cv-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                title="View Invoice"
              >
                {loadingInvoice ? <Clock className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
              </button>

              {!data.activePlan.cancelledAt && (
                <button
                  onClick={handleCancelSubscription}
                  aria-label="Downgrade plan"
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--cv-border)] bg-white text-[var(--cv-text-muted)] shadow-sm transition-colors hover:border-[var(--cv-danger)] hover:text-[var(--cv-danger)]"
                  title="Downgrade Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {data.activePlan.cancelledAt && (
                <div className="flex items-center gap-2 px-3 py-2 bg-[var(--cv-danger-background)] border border-red-200 rounded-xl">
                  <ShieldAlert className="w-3.5 h-3.5 text-[var(--cv-danger)]" />
                          <span className="text-[10px] font-semibold text-[var(--cv-danger)] uppercase tracking-wider">Decaying Post {data.activePlan.nextBillingDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Storage Card */}
          <div className="subscription-storage-card bg-white rounded-2xl border border-[var(--cv-border)] shadow-sm p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-semibold text-[var(--cv-text-muted)] uppercase tracking-wider block mb-1">Current Storage</span>
                <h3 className="text-base font-semibold text-[var(--cv-text)]">Storage Usage</h3>
              </div>
              <div className="w-9 h-9 bg-[var(--cv-surface-muted)] rounded-xl border border-[var(--cv-border)] flex items-center justify-center">
                <Database className="w-4 h-4 text-[var(--cv-primary)]" />
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-end justify-between mb-2">
                <div>
                  <div className="text-3xl font-semibold text-[var(--cv-text)] tracking-tight">{data.storage.usedLabel}</div>
                  <div className="text-[10px] font-medium text-[var(--cv-text-muted)] uppercase tracking-wider mt-1">Total {data.storage.totalLabel}</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-1 bg-[var(--cv-surface-muted)] border border-[var(--cv-border)] text-[var(--cv-primary)] rounded-lg">
                  {data.storage.percentageUsed}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-[var(--cv-border)] rounded-full overflow-hidden">
                <div
                  className={classNames(
                    "h-full rounded-full transition-all duration-1000",
                    data.storage.percentageUsed > 90 ? "bg-[var(--cv-danger)]" : "bg-[var(--cv-primary)]"
                  )}
                  style={{ width: `${data.storage.percentageUsed || 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--cv-surface-muted)] border border-[var(--cv-border)] hover:border-[var(--cv-primary)]/30 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-white border border-[var(--cv-border)] rounded-lg flex items-center justify-center shadow-sm">
                    <Zap className="w-3.5 h-3.5 text-[var(--cv-primary)]" />
                  </div>
                  <span className="text-xs font-medium text-[var(--cv-text)]">Download Speed</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-1 bg-[var(--cv-primary)] text-white rounded-lg uppercase tracking-wider">{data.limits.prioritySpeed}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--cv-surface-muted)] border border-[var(--cv-border)] hover:border-[var(--cv-primary)]/30 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-white border border-[var(--cv-border)] rounded-lg flex items-center justify-center shadow-sm">
                    <UploadCloud className="w-3.5 h-3.5 text-[var(--cv-primary)]" />
                  </div>
                  <span className="text-xs font-medium text-[var(--cv-text)]">Max Upload</span>
                </div>
                <span className="text-xs font-semibold text-[var(--cv-text)]">{data.limits.maxFileSize}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="subscription-section-heading flex items-center gap-4 mb-6">
          <div className="h-px bg-[var(--cv-border)] flex-1"></div>
          <span className="text-[10px] font-semibold text-[var(--cv-text-muted)] uppercase tracking-[0.25em]">Usage Statistics</span>
          <div className="h-px bg-[var(--cv-border)] flex-1"></div>
        </div>

        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            icon={<HardDrive className="w-4 h-4 text-[var(--cv-primary)]" />}
            title="Total Files"
            value={data.stats.totalFiles}
          />
          <StatsCard
            icon={<Info className="w-4 h-4 text-[var(--cv-success)]" />}
            title="Shared Files"
            value={data.stats.sharedFiles}
          />
          <StatsCard
            icon={<Users className="w-4 h-4 text-[var(--cv-primary)]" />}
            title="Connected Devices"
            value={`${data.stats.devicesConnected} / ${data.stats.maxDevices || 3}`}
          />
          <StatsCard
            icon={<ArrowRight className="w-4 h-4 text-[var(--cv-accent)]" />}
            title="Uploads this Cycle"
            value={data.stats.uploadsDuringSubscription}
          />
        </div>
        </main>
    </div>
  );
}

function StatsCard({ icon, title, value, subtitle }) {
  return (
    <div className="subscription-stat-card bg-white rounded-2xl border border-[var(--cv-border)] shadow-sm p-5 hover:border-[var(--cv-primary)]/30 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-[var(--cv-surface-muted)] border border-[var(--cv-border)] flex items-center justify-center mb-4">
        {icon}
      </div>
      <div className="text-2xl font-semibold text-[var(--cv-text)] tracking-tight mb-1">{value}</div>
      <div className="text-[10px] font-semibold text-[var(--cv-text-muted)] uppercase tracking-widest">{title}</div>
      {subtitle && <div className="text-[10px] text-[var(--cv-text-muted)] mt-1">{subtitle}</div>}
    </div>
  );
}