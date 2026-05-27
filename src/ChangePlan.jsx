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
  
  // Modals & Animation State
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
      }
      else if (lowerMsg.includes("upi subscriptions") || lowerMsg.includes("card mandate")) {
        tip = "Banking regulations fix mandate terms at creation. To change plans, please cancel current and purchase new.";
      }

      setErrorAlert({
        show: true,
        title: "Upgrade Restricted",
        message: msg,
        tip: tip
      });
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 gap-4">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#66B2D6] rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Scanning Grid...</p>
      </div>
    );
  }

  if (!currentPlan) return null;

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
      <div className="py-16 px-4 pt-32 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto relative">
          
          {errorAlert.show && (
            <div className="mb-10 animate-slideDown">
                <div className="bg-white rounded-2xl border border-red-100 shadow-xl overflow-hidden">
                    <div className="p-6 flex items-start gap-5">
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0 border border-red-100">
                            <ShieldCheck className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{errorAlert.title}</h3>
                            <p className="text-sm font-medium text-gray-500 mb-4">{errorAlert.message}</p>
                            {errorAlert.tip && (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 italic text-xs font-medium text-gray-400">
                                    Tip: {errorAlert.tip}
                                </div>
                            )}
                        </div>
                        <button onClick={() => setErrorAlert({ ...errorAlert, show: false })} className="text-gray-300 hover:text-gray-900">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
          )}
          
          <header className="mb-12">
            <button 
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 mb-6 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Return to Plans
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center">
                <Star className="w-6 h-6 text-[#66B2D6]" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Change Plan</h1>
            </div>
            <p className="text-sm font-medium text-gray-400 max-w-xl leading-relaxed">Adjust your plan nodes. We'll automatically prorate any remaining credit from your current billing cycle.</p>
          </header>

          {/* Current Plan Card */}
          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden mb-12 group">
            <div className="p-8 sm:p-12">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                           <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black bg-[#66B2D6]/10 text-[#66B2D6] uppercase tracking-[0.2em] border border-[#66B2D6]/20">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#66B2D6] animate-pulse"></div>
                              Current Plan
                           </span>
                           <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">ID: {currentPlan.activePlan.planId.slice(-6).toUpperCase()}</span>
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">{currentPlan.activePlan.name}</h2>
                            <p className="text-sm font-medium text-gray-400">{currentPlan.activePlan.tagline}</p>
                        </div>
                    </div>
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner group-hover:rotate-6 transition-transform">
                        <Zap className="w-8 h-8 text-[#66B2D6]" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                            <CreditCard className="w-4 h-4 text-[#66B2D6]" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Billing Rate</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900 tracking-tight">₹{currentPlan.activePlan.billingAmount}</span>
                            <span className="text-xs font-bold text-gray-400 uppercase">/{currentPlan.activePlan.billingPeriod}</span>
                        </div>
                    </div>
                    <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-[#66B2D6]" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Renewal</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 tracking-tight">{currentPlan.activePlan.nextBillingDate}</div>
                        <div className="text-[10px] font-black text-[#66B2D6] mt-2 bg-white w-fit px-2 py-0.5 rounded-md border border-gray-100">Terminating in {currentPlan.activePlan.daysLeft} days</div>
                    </div>
                </div>

                <div className="h-px bg-gray-100 mb-10" />

                <div className="space-y-4">
                    <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Active Privileges:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
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

          {/* Proration Alert */}
          <div className="bg-[#1A1C1E] rounded-3xl p-6 flex items-center gap-6 mb-16 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform"></div>
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 group-hover:rotate-12 transition-transform">
              <Info className="w-6 h-6 text-[#66B2D6]" />
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1">Prorated Upgrade Logic Active</h3>
                <p className="text-xs font-medium text-gray-500 leading-relaxed max-w-2xl">
                    Our system calculates the precise value of your remaining days. This credit is applied instantly at checkout, reducing the total upgrade cost.
                </p>
            </div>
            <div className="hidden sm:block text-[10px] font-black text-[#66B2D6] uppercase tracking-[0.2em] bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                Auto-Credit
            </div>
          </div>

          {/* Available Plans */}
          <div className="mb-24">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                  <div>
                      <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Available Plans</h3>
                      <p className="text-sm font-medium text-gray-400">{eligiblePlans.length} plans available for transition</p>
                  </div>
              </div>

              {eligiblePlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <div className="bg-white rounded-[2rem] border-2 border-dashed border-gray-200 p-20 text-center">
                      <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                          <Gem className="w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                          Ultimate Plan Reached
                      </h4>
                      <p className="text-sm font-medium text-gray-400 max-w-xs mx-auto">
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
        <div className="flex items-center gap-3 transition-colors">
            <div className="w-5 h-5 bg-green-50 text-green-500 rounded-full flex items-center justify-center border border-green-100 flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" />
            </div>
            <span className="text-sm font-bold text-gray-600">{label}</span>
        </div>
    );
}

function UpgradePlanCard({ plan, onUpgrade, isProcessing, disabled }) {
    const isPremium = plan.name.toLowerCase().includes('premium');
    
    return (
        <div
          className={classNames(
            "relative flex flex-col rounded-[2rem] border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
            isPremium ? "border-[#66B2D6] ring-1 ring-[#66B2D6]/10" : "border-gray-200"
          )}
        >
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
               <div className={classNames(
                 "w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner",
                 isPremium ? "bg-[#66B2D6]/10 border-[#66B2D6]/20 text-[#66B2D6]" : "bg-gray-50 border-gray-100 text-gray-400"
               )}>
                  {isPremium ? <Gem className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
               </div>
               <div>
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">{plan.name}</h3>
                  <div className="text-[10px] font-black text-[#66B2D6] uppercase tracking-[0.2em]">{plan.tagline}</div>
               </div>
            </div>
            
            <div className="flex items-baseline gap-1 mt-6">
                <span className="text-3xl font-bold text-gray-900 tracking-tighter">₹{plan.billingPeriod === "Yearly" ? Math.floor(plan.price / 12) : plan.price}</span>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">/mo</span>
            </div>
            
            {plan.cappedBonusDays > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
                        <Star className="w-3 h-3 fill-green-600" />
                        {plan.cappedBonusDays} Days Complementary Access
                    </div>
                </div>
            )}
          </div>

          <div className="h-px bg-gray-100 mb-6" />

          <ul className="space-y-3 mb-8 flex-1">
            {plan.features.slice(0, 5).map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-xs font-bold text-gray-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#66B2D6] mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
    
          <button
            onClick={() => onUpgrade(plan.id)}
            disabled={disabled}
            className={classNames(
              "w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold transition-all shadow-sm active:scale-[0.98]",
              isPremium ? "bg-[#66B2D6] text-white hover:bg-[#5aa0c1]" : "bg-gray-900 text-white hover:bg-black",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isProcessing ? (
              <Clock className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    Change to this plan
                    <ChevronRight className="w-4 h-4" />
                </>
            )}
          </button>
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center animate-scaleIn border border-slate-200 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 overflow-hidden">
           {activating && <div className="h-full bg-[#66B2D6] animate-progress-indeterminate opacity-80"></div>}
        </div>

        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl transition-all duration-500 ${activating ? 'bg-slate-50 border border-slate-100' : 'bg-green-50 border border-green-100'}`}>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm transition-colors duration-500`}
            style={{ backgroundColor: activating ? '#66B2D6' : '#10B981' }}>
            {activating ? (
               <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <CheckCircle2 className="w-6 h-6 animate-in zoom-in duration-500" />
            )}
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">
          {activating ? "Activating your plan..." : "You're All Set!"}
        </h2>
        <p className="text-sm font-medium text-slate-500 mb-8 max-w-[280px] mx-auto leading-relaxed">
          {activating 
            ? "Please wait while we set up your new workspace and apply your plan limits." 
            : "Your premium access is now live. Enjoy your new features."}
        </p>

        {!activating && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-2">
             <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
             <span className="text-xs font-semibold text-slate-600">Redirecting to Dashboard</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CountdownModal({ countdown, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-scaleIn border border-slate-200">
        <div className="p-8 text-center">
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white bg-[#66B2D6] shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Secure Checkout</h2>
          <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
            Connecting to our secure payment gateway...
          </p>
          
          {/* Countdown Container */}
          <div className="mb-8 relative flex justify-center items-center">
            <div className="text-6xl font-bold text-slate-900 relative z-10 animate-pulse">
              {countdown}
            </div>
          </div>

          <div className="flex flex-col gap-4 text-center">
            <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg w-fit mx-auto border border-slate-200">
               <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
               <span className="text-[11px] font-semibold">Secure connection established</span>
            </div>
            
            <button
              onClick={onCancel}
              className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
