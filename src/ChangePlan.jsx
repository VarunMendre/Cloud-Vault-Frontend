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
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Modify Infrastructure</h1>
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
                              Active Base
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
                      <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Scaling Targets</h3>
                      <p className="text-sm font-medium text-gray-400">{eligiblePlans.length} plans available for immediate transition</p>
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
                    Initiate Migration
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md">
      <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl p-8 text-center animate-scaleIn border border-gray-200">
        <div className={classNames(
            "w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center border shadow-inner transition-colors duration-500",
            activating ? "bg-gray-50 border-gray-100 text-[#66B2D6]" : "bg-green-50 border-green-100 text-green-500"
        )}>
           {activating ? <Clock className="w-10 h-10 animate-spin" /> : <CheckCircle2 className="w-10 h-10" />}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
          {activating ? "Processing Nodes" : "Sync Complete"}
        </h2>
        <p className="text-sm font-medium text-gray-400 mb-8 leading-relaxed">
          {activating 
            ? "Verifying payment confirmation and updating account attributes..." 
            : "Your infrastructure has been upgraded. Returning to dashboard..."}
        </p>
        {activating && (
           <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full bg-[#66B2D6] animate-progress-indeterminate"></div>
           </div>
        )}
      </div>
    </div>
  );
}

function CountdownModal({ countdown, onCancel }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md">
      <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-scaleIn border border-gray-200 relative">
        <div className="p-8 text-center">
          <button onClick={onCancel} className="absolute top-6 right-6 text-gray-300 hover:text-gray-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#66B2D6]/10 flex items-center justify-center text-[#66B2D6] border border-[#66B2D6]/20 shadow-inner">
             <Zap className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Preparing Bridge</h2>
          <p className="text-sm font-medium text-gray-400 mb-10 leading-relaxed">Redirecting to secure payment gateway in</p>
          
          <div className="mb-10">
            <div className="text-6xl font-bold text-gray-900 tracking-tighter animate-pulse">{countdown}</div>
          </div>
          
          <div className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-[#66B2D6]" /> Standard Security Protocol
              </div>
              <button onClick={onCancel} className="text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors uppercase tracking-widest">Stop Migration</button>
          </div>
        </div>
      </div>
    </div>
  );
}
