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
        if (details && details.activePlan && details.activePlan.status === "active") {
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8F9FA] gap-3">
        <div className="w-8 h-8 border-2 border-[#E5E7EB] border-t-[#2B8B8F] rounded-full animate-spin"></div>
        <p className="text-xs font-medium text-[#6B7280] tracking-widest uppercase">Scanning Grid...</p>
      </div>
    );
  }

  if (!currentPlan) return null;

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

      <div className="py-16 px-4 pt-32 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">

          {/* Error Alert */}
          {errorAlert.show && (
            <div className="mb-8">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                <div className="p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0 border border-red-100">
                    <ShieldCheck className="w-4 h-4 text-[#E53E3E]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-[#1D1D1D] mb-1">{errorAlert.title}</h3>
                    <p className="text-xs text-[#6B7280] leading-relaxed">{errorAlert.message}</p>
                    {errorAlert.tip && (
                      <div className="mt-3 p-3 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] text-xs text-[#6B7280] italic leading-relaxed">
                        Tip: {errorAlert.tip}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setErrorAlert({ ...errorAlert, show: false })} className="text-[#6B7280] hover:text-[#1D1D1D] transition-colors p-0.5">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Page Header */}
          <header className="mb-10">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 mb-5 text-sm font-medium text-[#6B7280] hover:text-[#1D1D1D] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              Return to Plans
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-white rounded-xl border border-[#E5E7EB] shadow-sm flex items-center justify-center">
                <Star className="w-4 h-4 text-[#2B8B8F]" />
              </div>
              <h1 className="text-xl font-semibold text-[#1D1D1D] tracking-tight">Change Plan</h1>
            </div>
            <p className="text-sm text-[#6B7280] leading-relaxed max-w-xl ml-12">
              Adjust your plan nodes. We'll automatically prorate any remaining credit from your current billing cycle.
            </p>
          </header>

          {/* Current Plan Card */}
          <div className="bg-white rounded-2xl border-l-4 border-l-[#2B8B8F] border border-[#E5E7EB] shadow-sm overflow-hidden mb-8">
            <div className="p-7 sm:p-9">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-9">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#E0F5F3] text-[#2B8B8F] uppercase tracking-wider border border-[#2B8B8F]/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2B8B8F] animate-pulse"></div>
                      Current Plan
                    </span>
                    <span className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider">
                      ID: {currentPlan.activePlan.planId.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold text-[#1D1D1D] tracking-tight mb-1">{currentPlan.activePlan.name}</h2>
                    <p className="text-sm text-[#6B7280]">{currentPlan.activePlan.tagline}</p>
                  </div>
                </div>
                <div className="w-12 h-12 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] flex items-center justify-center text-[#2B8B8F]">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-9">
                <div className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E5E7EB]">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-3.5 h-3.5 text-[#2B8B8F]" />
                    <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Billing Rate</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold text-[#1D1D1D] tracking-tight">₹{currentPlan.activePlan.billingAmount}</span>
                    <span className="text-xs font-medium text-[#6B7280] uppercase">/{currentPlan.activePlan.billingPeriod}</span>
                  </div>
                </div>
                <div className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E5E7EB]">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-3.5 h-3.5 text-[#2B8B8F]" />
                    <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">Next Renewal</span>
                  </div>
                  <div className="text-2xl font-semibold text-[#1D1D1D] tracking-tight">{currentPlan.activePlan.nextBillingDate}</div>
                  <span className="inline-block mt-2 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg">
                    Terminating in {currentPlan.activePlan.daysLeft} days
                  </span>
                </div>
              </div>

              <div className="h-px bg-[#E5E7EB] mb-7" />

              <div>
                <div className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-4">Active Privileges</div>
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
          </div>

          {/* Proration Banner */}
          <div className="bg-[#E0F5F3] rounded-2xl p-4 flex items-center gap-4 mb-10 border border-[#2B8B8F]/20">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shrink-0 border border-[#2B8B8F]/20 shadow-sm">
              <Info className="w-4 h-4 text-[#2B8B8F]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[#1D1D1D] mb-0.5">Prorated Upgrade Logic Active</h3>
              <p className="text-xs text-[#6B7280] leading-relaxed max-w-2xl">
                Our system calculates the precise value of your remaining days. This credit is applied instantly at checkout, reducing the total upgrade cost.
              </p>
            </div>
            <span className="hidden sm:block text-[10px] font-semibold text-[#2B8B8F] uppercase tracking-wider bg-white px-3 py-1.5 rounded-xl border border-[#2B8B8F]/20 shadow-sm">
              Auto-Credit
            </span>
          </div>

          {/* Available Plans */}
          <div className="mb-20">
            <div className="mb-7">
              <h3 className="text-lg font-semibold text-[#1D1D1D] tracking-tight">Available Plans</h3>
              <p className="text-sm text-[#6B7280]">{eligiblePlans.length} plans available for transition</p>
            </div>

            {eligiblePlans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <div className="bg-white rounded-2xl border-2 border-dashed border-[#E5E7EB] p-16 text-center">
                <div className="w-16 h-16 bg-[#F8F9FA] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-[#E5E7EB]">
                  <Gem className="w-7 h-7 text-[#6B7280]" />
                </div>
                <h4 className="text-base font-semibold text-[#1D1D1D] mb-2">Ultimate Plan Reached</h4>
                <p className="text-sm text-[#6B7280] max-w-xs mx-auto leading-relaxed">
                  {emptyMessage || "You are currently running the standard max configuration. No further upgrades are required at this time."}
                </p>
              </div>
            )}
          </div>
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
      </div>
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
      <div className="w-4 h-4 bg-green-50 text-[#22C55E] rounded-full flex items-center justify-center border border-green-100 shrink-0">
        <CheckCircle2 className="w-2.5 h-2.5" />
      </div>
      <span className="text-sm font-medium text-[#1D1D1D]">{label}</span>
    </div>
  );
}

function UpgradePlanCard({ plan, onUpgrade, isProcessing, disabled }) {
  const isPremium = plan.name.toLowerCase().includes('premium');

  return (
    <div className={classNames(
      "relative flex flex-col rounded-2xl bg-white transition-all duration-200 hover:shadow-md overflow-hidden",
      isPremium
        ? "border-2 border-[#2B8B8F] shadow-sm"
        : "border border-[#E5E7EB] shadow-sm"
    )}>
      {/* Card top accent for recommended */}
      {isPremium && (
        <div className="h-1 w-full bg-[#2B8B8F]" />
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={classNames(
              "w-9 h-9 rounded-xl flex items-center justify-center border shrink-0",
              isPremium
                ? "bg-[#E0F5F3] border-[#2B8B8F]/20 text-[#2B8B8F]"
                : "bg-[#F8F9FA] border-[#E5E7EB] text-[#6B7280]"
            )}>
              {isPremium ? <Gem className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1D1D1D] tracking-tight leading-tight">{plan.name}</h3>
              <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider mt-0.5">{plan.tagline}</p>
            </div>
          </div>
          {isPremium && (
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#E0F5F3] text-[#2B8B8F] px-2.5 py-1 rounded-lg border border-[#2B8B8F]/20 shrink-0">
              Recommended
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-3xl font-semibold text-[#1D1D1D] tracking-tight">
            ₹{plan.billingPeriod === "Yearly" ? Math.floor(plan.price / 12) : plan.price}
          </span>
          <span className="text-sm font-medium text-[#6B7280]">/mo</span>
        </div>

        {/* Bonus days */}
        {plan.cappedBonusDays > 0 && (
          <div className="flex items-center gap-1.5 p-2.5 bg-green-50 rounded-xl border border-green-100 mb-4">
            <Star className="w-3 h-3 text-[#22C55E] fill-[#22C55E] shrink-0" />
            <span className="text-[10px] font-semibold text-[#22C55E] uppercase tracking-wider">
              {plan.cappedBonusDays} Days Complementary Access
            </span>
          </div>
        )}

        <div className="h-px bg-[#E5E7EB] mb-4" />

        {/* Features */}
        <ul className="space-y-2 mb-6 flex-1">
          {plan.features.slice(0, 5).map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-[#6B7280]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2B8B8F] shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={() => onUpgrade(plan.id)}
          disabled={disabled}
          className={classNames(
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors",
            isPremium
              ? "bg-[#2B8B8F] text-white hover:bg-[#237375]"
              : "bg-[#F8F9FA] text-[#1D1D1D] border border-[#E5E7EB] hover:bg-[#E5E7EB]",
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1D1D1D]/40 backdrop-blur-sm"></div>
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-10 text-center border border-[#E5E7EB] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#E5E7EB] overflow-hidden">
          {activating && <div className="h-full bg-[#2B8B8F] animate-pulse w-full"></div>}
        </div>
        <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500 ${activating ? 'bg-[#F8F9FA] border border-[#E5E7EB]' : 'bg-green-50 border border-green-100'}`}>
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm transition-colors duration-500 ${activating ? 'bg-[#2B8B8F]' : 'bg-[#22C55E]'}`}>
            {activating ? (
              <Clock className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
          </div>
        </div>
        <h2 className="text-xl font-semibold text-[#1D1D1D] mb-2 tracking-tight">
          {activating ? "Activating your plan..." : "You're All Set!"}
        </h2>
        <p className="text-sm text-[#6B7280] mb-8 max-w-[260px] mx-auto leading-relaxed">
          {activating
            ? "Please wait while we set up your new workspace and apply your plan limits."
            : "Your premium access is now live. Enjoy your new features."}
        </p>
        {!activating && (
          <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-[#6B7280] animate-spin" />
            <span className="text-xs font-medium text-[#1D1D1D]">Redirecting to Dashboard</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CountdownModal({ countdown, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1D1D1D]/40 backdrop-blur-sm"></div>
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E5E7EB]">
        <div className="p-8 text-center">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#6B7280] hover:text-[#1D1D1D] hover:bg-[#F8F9FA] rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E0F5F3] border border-[#2B8B8F]/20">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white bg-[#2B8B8F]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <h2 className="text-xl font-semibold text-[#1D1D1D] mb-1.5 tracking-tight">Secure Checkout</h2>
          <p className="text-sm text-[#6B7280] mb-7 leading-relaxed">
            Connecting to our secure payment gateway...
          </p>

          <div className="mb-7 flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F8F9FA] border border-[#E5E7EB] flex items-center justify-center">
              <span className="text-3xl font-semibold text-[#1D1D1D]">{countdown}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F8F9FA] text-[#1D1D1D] rounded-xl border border-[#E5E7EB]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6B7280]" />
              <span className="text-xs font-medium">Secure connection established</span>
            </div>
            <button
              onClick={onCancel}
              className="text-xs font-medium text-[#6B7280] hover:text-[#1D1D1D] transition-colors"
            >
              Cancel Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}