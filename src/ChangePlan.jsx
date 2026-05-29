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
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F0F2F5] gap-4">
        <div className="w-10 h-10 border-4 border-[#E2E8F0] border-t-[#3AAFA9] rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-[#64748B] uppercase tracking-widest animate-pulse">Scanning Grid...</p>
      </div>
    );
  }

  if (!currentPlan) return null;

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
      <div className="py-16 px-4 pt-32 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto relative">
          
          {errorAlert.show && (
            <div className="mb-10 animate-slideDown">
                <div className="bg-white rounded-[16px] border border-red-100 shadow-xl overflow-hidden">
                    <div className="p-6 flex items-start gap-5">
                        <div className="w-12 h-12 bg-red-50 rounded-[12px] flex items-center justify-center shrink-0 border border-red-100">
                            <ShieldCheck className="w-6 h-6 text-[#EF4444]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-[#0F172A] mb-1">{errorAlert.title}</h3>
                            <p className="text-sm font-medium text-[#64748B] mb-4">{errorAlert.message}</p>
                            {errorAlert.tip && (
                                <div className="p-4 bg-[#F0F2F5] rounded-[8px] border border-[#E2E8F0] italic text-xs font-medium text-[#64748B]">
                                    Tip: {errorAlert.tip}
                                </div>
                            )}
                        </div>
                        <button onClick={() => setErrorAlert({ ...errorAlert, show: false })} className="text-[#64748B] hover:text-[#0F172A]">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
          )}
          
          <header className="mb-12">
            <button 
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 mb-6 text-sm font-bold text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Return to Plans
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-[12px] border border-[#E2E8F0] shadow-sm flex items-center justify-center">
                <Star className="w-6 h-6 text-[#3AAFA9]" />
              </div>
              <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight">Change Plan</h1>
            </div>
            <p className="text-[14px] font-medium text-[#64748B] max-w-xl leading-relaxed">Adjust your plan nodes. We'll automatically prorate any remaining credit from your current billing cycle.</p>
          </header>

          {/* Current Plan Card */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] shadow-sm overflow-hidden mb-12 group">
            <div className="p-8 sm:p-12">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                           <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[10px] font-black bg-[#3AAFA9]/10 text-[#3AAFA9] uppercase tracking-[0.2em] border border-[#3AAFA9]/20">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#3AAFA9] animate-pulse"></div>
                              Current Plan
                           </span>
                           <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">ID: {currentPlan.activePlan.planId.slice(-6).toUpperCase()}</span>
                        </div>
                        <div>
                            <h2 className="text-4xl font-bold text-[#0F172A] tracking-tight mb-1">{currentPlan.activePlan.name}</h2>
                            <p className="text-sm font-medium text-[#64748B]">{currentPlan.activePlan.tagline}</p>
                        </div>
                    </div>
                    <div className="w-16 h-16 bg-[#F0F2F5] rounded-[16px] flex items-center justify-center border border-[#E2E8F0] shadow-inner group-hover:rotate-6 transition-transform">
                        <Zap className="w-8 h-8 text-[#3AAFA9]" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-[#F0F2F5]/50 rounded-[12px] p-6 border border-[#E2E8F0]">
                        <div className="flex items-center gap-2 mb-3">
                            <CreditCard className="w-4 h-4 text-[#3AAFA9]" />
                            <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Billing Rate</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-[#0F172A] tracking-tight">₹{currentPlan.activePlan.billingAmount}</span>
                            <span className="text-xs font-bold text-[#64748B] uppercase">/{currentPlan.activePlan.billingPeriod}</span>
                        </div>
                    </div>
                    <div className="bg-[#F0F2F5]/50 rounded-[12px] p-6 border border-[#E2E8F0]">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-[#3AAFA9]" />
                            <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Next Renewal</span>
                        </div>
                        <div className="text-2xl font-bold text-[#0F172A] tracking-tight">{currentPlan.activePlan.nextBillingDate}</div>
                        <div className="text-[10px] font-black text-[#3AAFA9] mt-2 bg-white w-fit px-2 py-0.5 rounded-[8px] border border-[#E2E8F0]">Terminating in {currentPlan.activePlan.daysLeft} days</div>
                    </div>
                </div>

                <div className="h-px bg-[#E2E8F0] mb-10" />

                <div className="space-y-4">
                    <div className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">Active Privileges:</div>
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
          <div className="bg-[#1A1C1E] rounded-[16px] p-6 flex items-center gap-6 mb-16 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-0 group-hover:scale-110 transition-transform"></div>
            <div className="w-12 h-12 bg-white/5 rounded-[16px] flex items-center justify-center shrink-0 border border-white/10 group-hover:rotate-12 transition-transform">
              <Info className="w-6 h-6 text-[#3AAFA9]" />
            </div>
            <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1">Prorated Upgrade Logic Active</h3>
                <p className="text-xs font-medium text-gray-500 leading-relaxed max-w-2xl">
                    Our system calculates the precise value of your remaining days. This credit is applied instantly at checkout, reducing the total upgrade cost.
                </p>
            </div>
            <div className="hidden sm:block text-[10px] font-black text-[#3AAFA9] uppercase tracking-[0.2em] bg-white/5 px-3 py-1.5 rounded-[8px] border border-white/10">
                Auto-Credit
            </div>
          </div>

          {/* Available Plans */}
          <div className="mb-24">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                  <div>
                      <h3 className="text-2xl font-bold text-[#0F172A] tracking-tight">Available Plans</h3>
                      <p className="text-sm font-medium text-[#64748B]">{eligiblePlans.length} plans available for transition</p>
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
                  <div className="bg-white rounded-[16px] border-2 border-dashed border-[#E2E8F0] p-20 text-center">
                      <div className="w-20 h-20 bg-[#F0F2F5] text-[#E2E8F0] rounded-[16px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                          <Gem className="w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-bold text-[#0F172A] mb-2">
                          Ultimate Plan Reached
                      </h4>
                      <p className="text-sm font-medium text-[#64748B] max-w-xs mx-auto">
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
            <div className="w-5 h-5 bg-green-50 text-[#22C55E] rounded-full flex items-center justify-center border border-green-100 flex-shrink-0">
                <CheckCircle2 className="w-3 h-3" />
            </div>
            <span className="text-sm font-bold text-[#0F172A]">{label}</span>
        </div>
    );
}

function UpgradePlanCard({ plan, onUpgrade, isProcessing, disabled }) {
    const isPremium = plan.name.toLowerCase().includes('premium');
    
    return (
        <div
          className={classNames(
            "relative flex flex-col rounded-[16px] border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
            isPremium ? "border-[#3AAFA9] ring-1 ring-[#3AAFA9]/10" : "border-[#E2E8F0]"
          )}
        >
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
               <div className={classNames(
                 "w-10 h-10 rounded-[12px] flex items-center justify-center border shadow-inner",
                 isPremium ? "bg-[#3AAFA9]/10 border-[#3AAFA9]/20 text-[#3AAFA9]" : "bg-[#F0F2F5] border-[#E2E8F0] text-[#64748B]"
               )}>
                  {isPremium ? <Gem className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
               </div>
               <div>
                  <h3 className="text-lg font-bold text-[#0F172A] tracking-tight">{plan.name}</h3>
                  <div className="text-[10px] font-black text-[#3AAFA9] uppercase tracking-[0.2em]">{plan.tagline}</div>
               </div>
            </div>
            
            <div className="flex items-baseline gap-1 mt-6">
                <span className="text-3xl font-bold text-[#0F172A] tracking-tighter">₹{plan.billingPeriod === "Yearly" ? Math.floor(plan.price / 12) : plan.price}</span>
                <span className="text-sm font-bold text-[#64748B] uppercase tracking-widest">/mo</span>
            </div>
            
            {plan.cappedBonusDays > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-[8px] border border-green-100">
                    <div className="text-[10px] font-black text-[#22C55E] uppercase tracking-widest flex items-center gap-2">
                        <Star className="w-3 h-3 fill-[#22C55E]" />
                        {plan.cappedBonusDays} Days Complementary Access
                    </div>
                </div>
            )}
          </div>

          <div className="h-px bg-[#E2E8F0] mb-6" />

          <ul className="space-y-3 mb-8 flex-1">
            {plan.features.slice(0, 5).map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-xs font-bold text-[#64748B]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3AAFA9] mt-0.5 shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
    
          <button
            onClick={() => onUpgrade(plan.id)}
            disabled={disabled}
            className={classNames(
              "w-full flex items-center justify-center gap-2 py-4 rounded-[8px] text-sm font-bold transition-all shadow-sm active:scale-[0.98]",
              isPremium ? "bg-[#3AAFA9] text-white hover:bg-[#2D8B8B]" : "bg-[#0F172A] text-white hover:bg-black",
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
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-[16px] shadow-2xl p-10 text-center animate-scaleIn border border-[#E2E8F0] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#E2E8F0] overflow-hidden">
           {activating && <div className="h-full bg-[#3AAFA9] animate-progressIndeterminate opacity-80"></div>}
        </div>

        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[16px] transition-all duration-500 ${activating ? 'bg-[#F0F2F5] border border-[#E2E8F0]' : 'bg-green-50 border border-green-100'}`}>
          <div className={`flex h-12 w-12 items-center justify-center rounded-[12px] text-white shadow-sm transition-colors duration-500`}
            style={{ backgroundColor: activating ? '#3AAFA9' : '#22C55E' }}>
            {activating ? (
               <Clock className="w-6 h-6 animate-spin" />
            ) : (
              <CheckCircle2 className="w-6 h-6 animate-in zoom-in duration-500" />
            )}
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-[#0F172A] mb-3 tracking-tight">
          {activating ? "Activating your plan..." : "You're All Set!"}
        </h2>
        <p className="text-sm font-medium text-[#64748B] mb-8 max-w-[280px] mx-auto leading-relaxed">
          {activating 
            ? "Please wait while we set up your new workspace and apply your plan limits." 
            : "Your premium access is now live. Enjoy your new features."}
        </p>

        {!activating && (
          <div className="p-3 rounded-[8px] bg-[#F0F2F5] border border-[#E2E8F0] flex items-center justify-center gap-2">
             <Clock className="w-4 h-4 text-[#64748B] animate-spin" />
             <span className="text-xs font-semibold text-[#0F172A]">Redirecting to Dashboard</span>
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
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-[16px] shadow-xl overflow-hidden animate-scaleIn border border-[#E2E8F0]">
        <div className="p-8 text-center">
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F0F2F5] rounded-full transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-[16px] bg-[#3AAFA9]/10 border border-[#3AAFA9]/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] text-white bg-[#3AAFA9] shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2 tracking-tight">Secure Checkout</h2>
          <p className="text-sm font-medium text-[#64748B] mb-8 leading-relaxed">
            Connecting to our secure payment gateway...
          </p>
          
          {/* Countdown Container */}
          <div className="mb-8 relative flex justify-center items-center">
            <div className="text-6xl font-bold text-[#0F172A] relative z-10 animate-pulse">
              {countdown}
            </div>
          </div>

          <div className="flex flex-col gap-4 text-center">
            <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-[#F0F2F5] text-[#0F172A] rounded-[8px] w-fit mx-auto border border-[#E2E8F0]">
               <ShieldCheck className="w-3.5 h-3.5 text-[#64748B]" />
               <span className="text-[11px] font-semibold">Secure connection established</span>
            </div>
            
            <button
              onClick={onCancel}
              className="mt-2 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              Cancel Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
