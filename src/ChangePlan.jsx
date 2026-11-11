import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Info,
  Gem,
  Star,
  ArrowLeft,
  Clock,
  X,
  CreditCard,
  ChevronRight
} from "lucide-react";
import { getSubscriptionDetails, getEligiblePlans, upgradeSubscription, checkSubscriptionStatus } from "./apis/subscriptionApi";
import SubscriptionAlert from "./components/SubscriptionAlert";
import DirectoryHeader from "./components/DirectoryHeader";
import { useAuth } from "./context/AuthContext";
import "./ChangePlan.css";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ChangePlan() {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [eligiblePlans, setEligiblePlans] = useState([]);
  const [emptyMessage, setEmptyMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [createdSubscriptionId, setCreatedSubscriptionId] = useState(null);
  const [errorAlert, setErrorAlert] = useState({ show: false, title: "", message: "", tip: null });
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [details, eligible] = await Promise.all([
          getSubscriptionDetails(),
          getEligiblePlans()
        ]);
        if (details && details.activePlan && ["active", "past_due", "created", "authenticated", "pending"].includes(details.activePlan.status)) {
          setCurrentPlan(details);
          setEligiblePlans(eligible?.eligiblePlans || []);
          setEmptyMessage(eligible?.message || "");
        } else {
          navigate("/plans", { replace: true });
        }
      } catch (err) {
        navigate("/plans");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [navigate]);

  async function handleUpgrade(planId) {
    if (showCountdownModal) return;
    const plan = eligiblePlans.find(p => p.id === planId);
    setPendingPlan(plan);
    setProcessingId(planId);
    setShowCountdownModal(true);
    setCountdown(3);
    let count = 3;
    const countdownInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownInterval);
        setShowCountdownModal(false);
        startUpgrade(plan);
      }
    }, 1000);
  }

  async function startUpgrade(plan) {
    try {
      const res = await upgradeSubscription(plan.id);
      if (res.subscriptionId) {
        setCreatedSubscriptionId(res.subscriptionId);
        const bridgeUrl = new URL("https://cerulean-meringue-2d043b.netlify.app/checkout.html");
        bridgeUrl.searchParams.set("sub_id", res.subscriptionId);
        if (res.razorpayKeyId) {
          bridgeUrl.searchParams.set("key_id", res.razorpayKeyId);
        }
        bridgeUrl.searchParams.set("plan", plan.name);
        bridgeUrl.searchParams.set("desc", `${plan.storage} Storage - ${plan.tagline}`);
        if (user?.email) bridgeUrl.searchParams.set("email", user.email);
        window.location.href = bridgeUrl.toString();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to initiate plan change. Please try again later.";
      let tip = null;
      const lowerMsg = msg.toLowerCase();
      if (lowerMsg.includes("wait") && lowerMsg.includes("day") && lowerMsg.includes("bonus")) {
        tip = "Your current plan credit is too low to upgrade today. Please wait until tomorrow.";
      } else if (lowerMsg.includes("upi subscriptions") || lowerMsg.includes("card mandate")) {
        tip = "Banking regulations fix mandate terms at creation. To change plans, please cancel current and purchase new.";
      }
      setErrorAlert({ show: true, title: "Upgrade Restricted", message: msg, tip });
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div className="change-plan-page flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--cv-background)]">
        <div className="w-8 h-8 border-2 border-[var(--cv-border)] border-t-[var(--cv-primary)] rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-[var(--cv-text-muted)]">Scanning Grid...</p>
      </div>
    );
  }

  if (!currentPlan) return null;

  return (
    <div className="change-plan-page min-h-screen bg-[var(--cv-background)]">
      <DirectoryHeader
        userName={user?.name || "Guest User"}
        userEmail={user?.email || "guest@example.com"}
        userPicture={user?.picture || ""}
        userRole={user?.role || "User"}
        subscriptionId={user?.subscriptionId || currentPlan?.activePlan?.planId}
        subscriptionStatus={user?.subscriptionStatus || "active"}
      />

      <main className="change-plan-content px-4 pb-16 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Error Alert */}
          {errorAlert.show && (
            <div className="mb-8" role="alert" aria-live="polite">
              <div className="bg-white rounded-2xl border border-[var(--cv-border)] shadow-sm overflow-hidden">
                <div className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-[var(--cv-danger-background)] rounded-xl flex items-center justify-center shrink-0 border border-[color-mix(in_srgb,var(--cv-danger)_18%,white)]">
                    <ShieldCheck className="w-4 h-4 text-[var(--cv-danger)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[var(--cv-text)] mb-1">{errorAlert.title}</h3>
                    <p className="text-sm text-[var(--cv-text-muted)] leading-relaxed">{errorAlert.message}</p>
                    {errorAlert.tip && (
                      <div className="mt-3 p-3 bg-[var(--cv-background)] rounded-xl border border-[var(--cv-border)] text-sm text-[var(--cv-text-muted)] italic leading-relaxed">
                        Tip: {errorAlert.tip}
                      </div>
                    )}
                  </div>
                  <button type="button" aria-label="Dismiss upgrade error" onClick={() => setErrorAlert({ ...errorAlert, show: false })} className="h-11 w-11 rounded-xl p-2 text-[var(--cv-text-muted)] transition-colors hover:bg-[var(--cv-background)] hover:text-[var(--cv-text)]">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Page Header */}
          <header className="change-plan-header mb-8 sm:mb-10">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="group mb-4 flex min-h-11 items-center gap-2 rounded-lg pr-2 text-sm font-medium text-[var(--cv-text-muted)] transition-colors hover:text-[var(--cv-text)] sm:mb-5"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Return to Plans
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-white rounded-xl border border-[var(--cv-border)] shadow-sm flex items-center justify-center">
                <Star className="w-4 h-4 text-[var(--cv-primary)]" />
              </div>
              <h1 className="text-2xl font-semibold leading-tight tracking-tight text-[var(--cv-text)] sm:text-3xl">Change Plan</h1>
            </div>
            <p className="ml-12 max-w-xl text-base leading-relaxed text-[var(--cv-text-muted)]">
              Adjust your plan nodes. We'll automatically prorate any remaining credit from your current billing cycle.
            </p>
          </header>

          {/* Current Plan Card */}
          <section className="change-plan-current-card mb-8 overflow-hidden rounded-2xl border border-l-4 border-[var(--cv-border)] border-l-[var(--cv-primary)] bg-white shadow-sm" aria-labelledby="current-plan-heading">
            <div className="p-5 sm:p-8 lg:p-9">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-9">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--cv-surface-muted)] text-[var(--cv-primary)] uppercase tracking-wider border border-[var(--cv-primary)]/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--cv-primary)]"></div>
                      Current Plan
                    </span>
                    <span className="text-xs font-medium text-[var(--cv-text-muted)] uppercase tracking-wider">
                      ID: {currentPlan.activePlan.planId.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 id="current-plan-heading" className="text-3xl font-semibold text-[var(--cv-text)] tracking-tight mb-1">{currentPlan.activePlan.name}</h2>
                    <p className="text-sm text-[var(--cv-text-muted)]">{currentPlan.activePlan.tagline}</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-[var(--cv-background)] rounded-xl border border-[var(--cv-border)] flex items-center justify-center text-[var(--cv-primary)]">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-9">
                <div className="bg-[var(--cv-background)] rounded-xl p-4 border border-[var(--cv-border)]">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-3.5 h-3.5 text-[var(--cv-primary)]" />
                    <span className="text-xs font-semibold text-[var(--cv-text-muted)] uppercase tracking-wider">Billing Rate</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-[var(--cv-text)] tracking-tight">₹{currentPlan.activePlan.billingAmount}</span>
                    <span className="text-xs font-medium text-[var(--cv-text-muted)] uppercase">/{currentPlan.activePlan.billingPeriod}</span>
                  </div>
                </div>
                <div className="bg-[var(--cv-background)] rounded-xl p-4 border border-[var(--cv-border)]">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-3.5 h-3.5 text-[var(--cv-primary)]" />
                    <span className="text-xs font-semibold text-[var(--cv-text-muted)] uppercase tracking-wider">Next Renewal</span>
                  </div>
                  <div className="text-2xl font-semibold text-[var(--cv-text)] tracking-tight">
                    {["created", "pending"].includes(currentPlan.activePlan.status) ? "Pending" : currentPlan.activePlan.nextBillingDate}
                  </div>
                  <span className="inline-block mt-2 text-xs font-semibold text-[var(--cv-text)] bg-[color-mix(in_srgb,var(--cv-accent)_8%,white)] border border-[color-mix(in_srgb,var(--cv-accent)_24%,white)] px-2 py-1 rounded-lg">
                    {["created", "pending"].includes(currentPlan.activePlan.status) ? "Awaiting Activation" : `Terminating in ${currentPlan.activePlan.daysLeft} days`}
                  </span>
                </div>
              </div>

              <div className="h-px bg-[var(--cv-border)] mb-7" />

              <div>
                <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--cv-text-muted)]">Active Privileges</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
                  <FeatureItem label={`${currentPlan.storage.totalLabel} Secure Grid`} />
                  <FeatureItem label={`Max Payload: ${currentPlan.limits.maxFileSize}`} />
                  <FeatureItem label="Encrypted Link Access" />
                  <FeatureItem label={`${currentPlan.stats.maxDevices || 3} Concurrent Hubs`} />
                  <FeatureItem label="Vortex Network Speed" />
                  <FeatureItem label="Live Engineer Support" />
                </div>
              </div>
            </div>
          </section>

          {/* Proration Banner */}
          <aside className="mb-8 flex items-start gap-3 rounded-2xl border border-[var(--cv-primary)]/20 bg-[var(--cv-surface-muted)] p-4 sm:mb-10 sm:items-center sm:gap-4">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 border border-[var(--cv-primary)]/20 shadow-sm">
              <Info className="w-4 h-4 text-[var(--cv-primary)]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[var(--cv-text)] mb-0.5">Prorated Upgrade Logic Active</h3>
              <p className="text-sm text-[var(--cv-text-muted)] leading-relaxed max-w-2xl">
                Our system calculates the precise value of your remaining days. This credit is applied instantly at checkout, reducing the total upgrade cost.
              </p>
            </div>
            <span className="hidden sm:block text-xs font-semibold text-[var(--cv-primary)] uppercase tracking-wider bg-white px-3 py-1.5 rounded-xl border border-[var(--cv-primary)]/20 shadow-sm">
              Auto-Credit
            </span>
          </aside>

          {/* Available Plans */}
          <section className="mb-12 sm:mb-20" aria-labelledby="available-plans-heading">
            <div className="mb-7">
              <h2 id="available-plans-heading" className="text-xl font-semibold tracking-tight text-[var(--cv-text)] sm:text-2xl">Available Plans</h2>
              <p className="text-base text-[var(--cv-text-muted)]">{eligiblePlans.length} plans available for transition</p>
            </div>

            {eligiblePlans.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {eligiblePlans.map((plan) => (
                  <UpgradePlanCard
                    key={plan.id}
                    plan={plan}
                    onUpgrade={handleUpgrade}
                    isProcessing={processingId === plan.id}
                    disabled={!!processingId}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-[var(--cv-border)] bg-white p-8 text-center sm:p-12">
                <div className="w-16 h-16 bg-[var(--cv-background)] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[var(--cv-border)]">
                  <Gem className="w-7 h-7 text-[var(--cv-text-muted)]" />
                </div>
                <h4 className="text-base font-semibold text-[var(--cv-text)] mb-2">Ultimate Plan Reached</h4>
                <p className="text-sm text-[var(--cv-text-muted)] max-w-xs mx-auto leading-relaxed">
                  {emptyMessage || "You are currently running the standard max configuration. No further upgrades are required at this time."}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Modals */}
        {showCountdownModal && (
          <CountdownModal
            countdown={countdown}
            onCancel={() => {
              setShowCountdownModal(false);
              setProcessingId(null);
              setPendingPlan(null);
            }}
          />
        )}

        {showSuccessModal && (
          <SuccessModal
            subscriptionId={createdSubscriptionId}
            onClose={() => navigate("/subscription")}
          />
        )}
      </main>
    </div>
  );
}

function calculateNextBillingDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function FeatureItem({ label }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--cv-success)_18%,white)] bg-[var(--cv-success-background)] text-[var(--cv-success)]">
        <CheckCircle2 className="w-2.5 h-2.5" />
      </div>
      <span className="text-sm font-medium text-[var(--cv-text)]">{label}</span>
    </div>
  );
}

function UpgradePlanCard({ plan, onUpgrade, isProcessing, disabled }) {
  const isPremium = plan.name.toLowerCase().includes('premium');

  return (
    <div className={classNames(
      "change-plan-plan-card relative flex min-w-0 flex-col overflow-hidden rounded-2xl bg-white transition-all duration-200 hover:shadow-md",
      isPremium
        ? "border-2 border-[var(--cv-primary)] shadow-sm"
        : "border border-[var(--cv-border)] shadow-sm"
    )}>
      {/* Card top accent for recommended */}
      {isPremium && (
        <div className="h-1 w-full bg-[var(--cv-primary)]" />
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={classNames(
              "w-9 h-9 rounded-xl flex items-center justify-center border shrink-0",
              isPremium
                ? "bg-[var(--cv-surface-muted)] border-[var(--cv-primary)]/20 text-[var(--cv-primary)]"
                : "bg-[var(--cv-background)] border-[var(--cv-border)] text-[var(--cv-text-muted)]"
            )}>
              {isPremium ? <Gem className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold leading-tight tracking-tight text-[var(--cv-text)]">{plan.name}</h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--cv-text-muted)]">{plan.tagline}</p>
            </div>
          </div>
          {isPremium && (
            <span className="text-xs font-semibold uppercase tracking-wider bg-[var(--cv-surface-muted)] text-[var(--cv-primary)] px-2.5 py-1 rounded-lg border border-[var(--cv-primary)]/20 shrink-0">
              Recommended
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-semibold text-[var(--cv-text)] tracking-tight">
            ₹{plan.billingPeriod === "Yearly" ? Math.floor(plan.price / 12) : plan.price}
          </span>
          <span className="text-base font-medium text-[var(--cv-text-muted)]">/mo</span>
        </div>

        {/* Bonus days */}
        {plan.cappedBonusDays > 0 && (
          <div className="flex items-center gap-1.5 p-2.5 bg-[var(--cv-success-background)] rounded-xl border border-[color-mix(in_srgb,var(--cv-success)_18%,white)] mb-4">
            <Star className="w-3 h-3 text-[var(--cv-success)] fill-[var(--cv-success)] shrink-0" />
            <span className="text-xs font-semibold text-[var(--cv-success)] uppercase tracking-wider">
              {plan.cappedBonusDays} Days Complementary Access
            </span>
          </div>
        )}

        <div className="h-px bg-[var(--cv-border)] mb-4" />

        {/* Features */}
        <ul className="space-y-2 mb-6 flex-1">
          {plan.features.slice(0, 5).map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-[var(--cv-text-muted)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--cv-primary)] shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={() => onUpgrade(plan.id)}
          disabled={disabled}
          className={classNames(
            "change-plan-plan-action flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
            isPremium
              ? "bg-[var(--cv-primary)] text-white hover:bg-[var(--cv-primary-hover)]"
              : "bg-[var(--cv-background)] text-[var(--cv-text)] border border-[var(--cv-border)] hover:bg-[var(--cv-border)]",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isProcessing ? (
            <Clock className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Change to this plan
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function SuccessModal({ subscriptionId, onClose }) {
  const [activating, setActivating] = useState(true);

  useEffect(() => {
    if (!subscriptionId) return;
    const interval = setInterval(async () => {
      try {
        const status = await checkSubscriptionStatus(subscriptionId);
        if (status && (status.active || status.status === 'active')) {
          clearInterval(interval);
          setActivating(false);
          setTimeout(() => onClose(), 1500);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [subscriptionId, onClose]);

  return (
    <div className="change-plan-overlay fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="change-plan-success-title">
      <div className="absolute inset-0 bg-[var(--cv-text)]/40 backdrop-blur-sm" aria-hidden="true"></div>
      <div className="change-plan-dialog relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--cv-border)] bg-white p-6 text-center shadow-xl sm:p-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--cv-border)] overflow-hidden">
          {activating && <div className="h-full bg-[var(--cv-primary)] animate-pulse w-full"></div>}
        </div>
        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500 ${activating ? 'bg-[var(--cv-background)] border border-[var(--cv-border)]' : 'bg-[var(--cv-success-background)] border border-[color-mix(in_srgb,var(--cv-success)_18%,white)]'}`}>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm transition-colors duration-500 ${activating ? 'bg-[var(--cv-primary)]' : 'bg-[var(--cv-success)]'}`}>
            {activating ? (
              <Clock className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
        </div>
        <h2 id="change-plan-success-title" className="mb-2 text-xl font-semibold tracking-tight text-[var(--cv-text)]">
          {activating ? "Activating your plan..." : "You're All Set!"}
        </h2>
        <p className="text-sm text-[var(--cv-text-muted)] mb-8 max-w-[260px] mx-auto leading-relaxed">
          {activating
            ? "Please wait while we set up your new workspace and apply your plan limits."
            : "Your premium access is now live. Enjoy your new features."}
        </p>
        {!activating && (
          <div className="p-3 rounded-xl bg-[var(--cv-background)] border border-[var(--cv-border)] flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-[var(--cv-text-muted)] animate-spin" />
            <span className="text-xs font-medium text-[var(--cv-text)]">Redirecting to Dashboard</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CountdownModal({ countdown, onCancel }) {
  return (
    <div className="change-plan-overlay fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="change-plan-checkout-title">
      <div className="absolute inset-0 bg-[var(--cv-text)]/40 backdrop-blur-sm" aria-hidden="true"></div>
      <div className="change-plan-dialog relative w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--cv-border)] bg-white shadow-xl">
        <div className="p-8 text-center">
          <button
            onClick={onCancel}
            type="button"
            aria-label="Close secure checkout"
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl text-[var(--cv-text-muted)] transition-colors hover:bg-[var(--cv-background)] hover:text-[var(--cv-text)] sm:right-4 sm:top-4"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--cv-surface-muted)] border border-[var(--cv-primary)]/20">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white bg-[var(--cv-primary)]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <h2 id="change-plan-checkout-title" className="mb-1.5 text-xl font-semibold tracking-tight text-[var(--cv-text)]">Secure Checkout</h2>
          <p className="text-sm text-[var(--cv-text-muted)] mb-7 leading-relaxed">
            Connecting to our secure payment gateway...
          </p>

          <div className="mb-7 flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--cv-background)] border border-[var(--cv-border)] flex items-center justify-center">
              <span className="text-3xl font-semibold text-[var(--cv-text)]">{countdown}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--cv-background)] text-[var(--cv-text)] rounded-xl border border-[var(--cv-border)]">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--cv-text-muted)]" />
              <span className="text-sm font-medium">Secure connection established</span>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="min-h-11 rounded-lg px-3 text-sm font-medium text-[var(--cv-text-muted)] transition-colors hover:text-[var(--cv-text)]"
            >
              Cancel Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}