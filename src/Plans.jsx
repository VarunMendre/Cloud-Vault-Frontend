import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Check, 
  ShieldCheck, 
  Zap, 
  Clock, 
  CreditCard, 
  ChevronRight, 
  Loader2, 
  ArrowRight, 
  Star, 
  Database, 
  User, 
  X 
} from "lucide-react";
import { createSubscription, getSubscriptionDetails } from "./apis/subscriptionApi";
import SubscriptionAlert from "./components/SubscriptionAlert";
import DirectoryHeader from "./components/DirectoryHeader";
import { useAuth } from "./context/AuthContext";

const PLAN_CATALOG = {
  monthly: [
    {
      id: "free_monthly",
      name: "Free",
      tagline: "Starter Plan",
      description: "Personal users who want to try the platform",
      storage: "500 MB",
      price: 0,
      period: "/month",
      cta: "Current Plan",
      features: [
        "500 MB secure storage",
        "File upload limit: 100 MB per file",
        "Access from 1 device",
        "Standard download speed",
        "Basic email support",
      ],
      popular: false,
    },
    {
      id: "plan_Su5pQyZuvix08B",
      name: "Standard",
      tagline: "For Students & Freelancers",
      description: "Students, freelancers, or small teams who need more space",
      storage: "100 GB",
      price: 99,
      period: "/month",
      cta: "Subscribe Now",
      features: [
        "100 GB secure storage",
        "File upload limit: 1 GB per file",
        "Access from up to 2 devices",
        "Cloud Teams (up to 2 teams)",
        "Priority upload/download speed",
        "Email & chat support",
      ],
      popular: true,
    },
    {
      id: "plan_Su5sJ1cVn0sA3b",
      name: "Premium",
      tagline: "For Professionals & Creators",
      description: "Professionals and creators handling large media files",
      storage: "200 GB",
      price: 199,
      period: "/month",
      cta: "Subscribe Now",
      features: [
        "200 GB secure storage",
        "File upload limit: 2 GB per file",
        "Access from up to 3 devices",
        "Cloud Teams (up to 4 teams)",
        "Priority upload/download speed",
        "Priority customer support",
      ],
      popular: false,
    },
  ],
  yearly: [
    {
      id: "free_yearly",
      name: "Free",
      tagline: "Starter Plan",
      description: "Personal users who want to try the platform",
      storage: "500 MB",
      price: 0,
      period: "/year",
      cta: "Current Plan",
      features: [
        "500 MB secure storage",
        "File upload limit: 100 MB per file",
        "Access from 1 device",
        "Standard download speed",
        "Basic email support",
      ],
      popular: false,
    },
    {
      id: "plan_Su5qr7eEef1lwX",
      name: "Standard",
      tagline: "For Students & Freelancers",
      description: "Students, freelancers, or small teams who need more space",
      storage: "200 GB",
      price: 999,
      period: "/year",
      cta: "Subscribe Now",
      features: [
        "200 GB secure storage",
        "File upload limit: 1 GB per file",
        "Access from up to 2 devices",
        "Cloud Teams (up to 2 teams)",
        "Priority upload/download speed",
        "Email & chat support",
      ],
      popular: true,
    },
    {
      id: "plan_Su5t5DYChiXkwM",
      name: "Premium",
      tagline: "For Professionals & Creators",
      description: "Professionals and creators handling large media files",
      storage: "300 GB",
      price: 1999,
      period: "/year",
      cta: "Subscribe Now",
      features: [
        "300 GB secure storage",
        "File upload limit: 2 GB per file",
        "Access from up to 3 devices",
        "Cloud Teams (up to 4 teams)",
        "Priority upload/download speed",
        "Priority customer support",
      ],
      popular: false,
    },
  ],
};

function classNames(...cls) {
  return cls.filter(Boolean).join(" ");
}

function Price({ value }) {
  return (
    <div className="flex items-baseline gap-1.5">
      {value === 0 ? (
        <span className="text-5xl font-black tracking-tighter text-text-main group-hover:scale-105 transition-transform">
          Free
        </span>
      ) : (
        <>
          <span className="text-xl font-black text-muted mb-1 opacity-50">₹</span>
          <span className="text-5xl font-black tracking-tighter text-text-main group-hover:scale-105 transition-transform">
            {value}
          </span>
        </>
      )}
    </div>
  );
}

function PlanCard({ plan, onSelect, isLoading, isDisabled }) {
  const isFree = plan.price === 0;
  const yearlyMonthly = plan.period === "/year" && plan.price !== 0 ? Math.floor(plan.price / 12) : plan.price;

  return (
    <div
      className={classNames(
        "relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md",
        plan.popular
          ? "ring-1"
          : isFree
          ? "border-green-500 ring-1 ring-green-500/20"
          : "ring-1"
      )}
      style={
        plan.popular
          ? { borderColor: "#66B2D6" }
          : isFree
          ? undefined
          : { borderColor: "#D4AF37", "--tw-ring-color": "rgba(212,175,55,0.25)" }
      }
    >
      {/* Popular badge */}
      {plan.popular && (
        <div
          className="absolute -top-2 right-4 select-none rounded-full px-2 py-0.5 text-xs font-medium text-white shadow"
          style={{ backgroundColor: "#66B2D6" }}
        >
          MOST POPULAR
        </div>
      )}
      {/* Free / current plan badge */}
      {isFree && (
        <div className="absolute -top-2 right-4 select-none rounded-sm bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
          CURRENT PLAN
        </div>
      )}

      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div
              className={classNames(
                "p-1.5 rounded-lg",
                isFree
                  ? "bg-green-50 text-green-600"
                  : plan.popular
                  ? "bg-blue-50 text-blue-600"
                  : "bg-slate-50 text-slate-600"
              )}
            >
              {isFree ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.912 5.886h6.188l-5.007 3.638 1.913 5.887-5.006-3.639-5.006 3.639 1.913-5.887-5.007-3.638h6.188L12 3z" /></svg>
              ) : plan.popular ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
          </div>
          <p className="text-xs font-semibold" style={{ color: "#66B2D6" }}>
            {plan.tagline}
          </p>
          <p className="text-[11px] text-slate-500 leading-tight">{plan.description}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-6 mt-2 flex flex-col gap-0.5">
        <div className="flex items-end gap-1">
          {yearlyMonthly === 0 ? (
            <span className="text-4xl font-bold tracking-tight text-slate-900">Free</span>
          ) : (
            <>
              <span className="text-lg font-semibold text-slate-700">₹</span>
              <span className="text-4xl font-bold tracking-tight text-slate-900">{yearlyMonthly}</span>
              <span className="mb-[6px] text-sm text-slate-500">/month</span>
            </>
          )}
        </div>
        {plan.period === "/year" && plan.price !== 0 && (
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500 font-medium">
              Billed annually at ₹{plan.price}
            </span>
            <span className="text-[11px] text-green-600 font-bold mt-0.5">
              Save ₹{(PLAN_CATALOG.monthly.find((p) => p.name === plan.name)?.price * 12) - plan.price} per year
            </span>
          </div>
        )}
      </div>

      <div className="h-px bg-slate-100 mb-6" />

      {/* CTA Button */}
      <button
        onClick={() => !isFree && !isDisabled && onSelect?.(plan)}
        disabled={isDisabled || isFree}
        className={classNames(
          "mb-6 cursor-pointer inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold transition focus:outline-none",
          isFree
            ? "bg-green-600 text-white hover:bg-green-700"
            : plan.popular
            ? "text-white hover:opacity-90"
            : "bg-slate-900 text-white hover:bg-slate-800"
        )}
        style={plan.popular && !isFree ? { backgroundColor: "#66B2D6" } : undefined}
      >
        {isFree ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Active Now
          </span>
        ) : isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Redirecting...
          </span>
        ) : (
          plan.cta
        )}
      </button>

      {/* Features list */}
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
        What's Included
      </div>
      <ul className="space-y-3 text-[13px] text-slate-600">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <svg
              className="mt-0.5 h-3.5 w-3.5 flex-none text-green-500"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="3.5"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Plans() {
  const { user } = useAuth();
  const [mode, setMode] = useState("monthly");
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCountdownModal, setShowCountdownModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [pendingPlan, setPendingPlan] = useState(null);
  const [createdSubscriptionId, setCreatedSubscriptionId] = useState(null);
  const [errorAlert, setErrorAlert] = useState({ show: false, title: "", message: "", tip: null });
  const navigate = useNavigate();
  const plans = PLAN_CATALOG[mode];

  useEffect(() => {
    async function checkExistingSubscription() {
      try {
        const res = await getSubscriptionDetails();
        if (res && res.activePlan && ["active", "past_due"].includes(res.activePlan.status)) {
          // User already has a plan, they should go to /change-plan instead
          navigate("/change-plan", { replace: true });
        }
      } catch (err) {
        // No subscription found (expected 404), stay on plans page
      }
    }
    checkExistingSubscription();
  }, [navigate]);

  useEffect(() => {
    const razorpayScript = document.querySelector("#razorpay-script");
    if (razorpayScript) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.id = "razorpay-script";
    document.body.appendChild(script);
  }, []);

  async function handleSelect(plan) {
    if (plan.price === 0 || showCountdownModal) return;
    
    // Show BOTH countdown modal AND processing state at the same time
    setLoadingPlanId(plan.id);  // ← Button shows "Processing..."
    setPendingPlan(plan);
    setShowCountdownModal(true);  // ← Modal appears
    setCountdown(3);
    
    // Start countdown
    let count = 3;
    const countdownInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      
      if (count === 0) {
        clearInterval(countdownInterval);
        // Close countdown modal and open Razorpay
        setShowCountdownModal(false);
        startSubscription(plan);
      }
    }, 1000);
  }
  
  async function startSubscription(plan) {
    try {
      console.log("Creating subscription for plan:", plan.id);
      const res = await createSubscription(plan.id);
      
      if (res.message) {
        setErrorAlert({
           show: true,
           title: "Subscription Required",
           message: res.message
        });
        setLoadingPlanId(null);
        return;
      }

      setCreatedSubscriptionId(res.subscriptionId);

      // Redirect to the Portfolio Bridge instead of opening local popup
      const bridgeUrl = new URL("https://cerulean-meringue-2d043b.netlify.app/checkout.html");
      bridgeUrl.searchParams.set("sub_id", res.subscriptionId);
      bridgeUrl.searchParams.set("plan", plan.name);
      bridgeUrl.searchParams.set("desc", `${plan.storage} Storage - ${plan.tagline}`);
      if (user?.email) bridgeUrl.searchParams.set("email", user.email);

      console.log("Redirecting to payment bridge:", bridgeUrl.toString());
      window.location.href = bridgeUrl.toString();
    } catch (error) {
      console.error("Failed to start subscription:", error);
      setErrorAlert({
        show: true,
        title: "Subscription error",
        message: error.response?.data?.message || "Something went wrong while initiating your subscription. Please try again."
      });
      setLoadingPlanId(null);
    }
  }

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
      {errorAlert.show && (
        <SubscriptionAlert 
          title={errorAlert.title}
          message={errorAlert.message}
          troubleshootingTip={errorAlert.tip}
          onClose={() => setErrorAlert({ ...errorAlert, show: false })}
        />
      )}
      {showCountdownModal && (
        <CountdownModal countdown={countdown} onCancel={() => {
          setShowCountdownModal(false);
          setLoadingPlanId(null);
          setPendingPlan(null);
        }} />
      )}
      {showSuccessModal && (
        <SuccessModal 
          subscriptionId={createdSubscriptionId} 
          onClose={() => window.location.href = "/subscription"} 
        />
      )}
      
      <header className="mb-16 text-center relative max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-6xl font-black text-text-main mb-6 tracking-tighter leading-tight animate-fadeIn">
          Select Your <span className="text-primary">Cloud Plan</span>
        </h1>
        <p className="text-lg font-bold text-muted leading-relaxed">
          Unlock unlimited potential with secure, high-speed storage tailored for your digital life.
        </p>
      </header>

      {/* Tabs */}
      <div className="mb-16 flex justify-center sticky top-28 z-30">
        <div className="inline-flex rounded-[24px] border-2 border-border bg-white p-2 shadow-lg backdrop-blur-xl animate-scaleIn">
          <button
            onClick={() => setMode("monthly")}
            className={classNames(
              "rounded-[18px] px-10 py-3.5 text-sm font-black transition-all duration-300 cursor-pointer",
              mode === "monthly" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted hover:text-text-main"
            )}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setMode("yearly")}
            className={classNames(
              "rounded-[18px] px-10 py-3.5 text-sm font-black transition-all duration-300 cursor-pointer flex items-center gap-3",
              mode === "yearly" ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted hover:text-text-main"
            )}
          >
            Yearly Billing
            <span className={classNames(
              "text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest",
              mode === "yearly" ? "bg-white text-primary" : "bg-accent/10 text-accent"
            )}>
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 animate-fadeIn">
        {plans.map((plan) => (
          <PlanCard
            key={`${mode}-${plan.id}`}
            plan={plan}
            onSelect={handleSelect}
            isLoading={loadingPlanId === plan.id}
            isDisabled={!!loadingPlanId}
          />
        ))}
      </div>

      {/* Small helper text */}
      <div className="mt-16 text-center">
        <div className="inline-block p-4 rounded-2xl bg-secondary/30 border border-border/50 max-w-xl">
          <p className="text-xs font-bold text-muted leading-relaxed">
            Note: All transactions are processed through highly secure payment gateways. Plan limits are refreshed at the beginning of each billing cycle. Need custom storage? <span className="text-primary cursor-pointer hover:underline">Contact Sales</span>.
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}

import { checkSubscriptionStatus } from "./apis/subscriptionApi";

// ... existing imports

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
          setTimeout(() => {
             onClose();
          }, 1500);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [subscriptionId, onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-text-main/60 backdrop-blur-md"></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-card rounded-[40px] shadow-strong p-10 text-center animate-scaleIn border border-border overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-secondary group overflow-hidden">
           {activating && <div className="h-full bg-primary animate-progress-indeterminate opacity-40"></div>}
        </div>

        {/* Icon Container */}
        <div className={`mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[24px] shadow-inner transition-all duration-700 ${activating ? 'bg-secondary' : 'bg-green-50 animate-bounce'}`}>
          <div className={`flex h-14 w-14 items-center justify-center rounded-[18px] text-white shadow-lg transition-colors duration-700`}
            style={{ backgroundColor: activating ? 'var(--color-primary)' : 'var(--color-accent)' }}>
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
        
        <h2 className="text-3xl font-black text-text-main mb-3 tracking-tight">
          {activating ? "Verifying..." : "You're All Set!"}
        </h2>
        <p className="text-sm font-bold text-muted mb-10 max-w-[280px] mx-auto leading-relaxed">
          {activating 
            ? "We are synchronizing your workspace with our high-speed cloud clusters." 
            : "Your premium access is now live. Prepare for a seamless cloud experience."}
        </p>

        {!activating && (
          <div className="p-4 rounded-2xl bg-accent/10 border-2 border-accent/20 flex items-center justify-center gap-3">
             <div className="w-2 h-2 rounded-full bg-accent animate-ping"></div>
             <span className="text-xs font-black text-accent uppercase tracking-widest">Redirecting to Dashboard</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CountdownModal({ countdown, onCancel }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(100);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-text-main/60 backdrop-blur-md"></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-[40px] shadow-strong overflow-hidden animate-scaleIn border border-border">
        {/* Progress Bar at Top */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-secondary">
          <div 
            className="h-full bg-primary transition-all ease-linear shadow-[0_0_10px_2px_rgba(var(--color-primary-rgb),0.3)]"
            style={{ 
              width: `${progress}%`, 
              transitionDuration: '3000ms'
            }}
          ></div>
        </div>

        <div className="p-10 text-center">
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-secondary/50 text-muted hover:text-text-main hover:bg-secondary rounded-2xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[24px] bg-secondary shadow-inner">
            <div className="flex h-14 w-14 items-center justify-center rounded-[18px] text-white bg-primary shadow-lg shadow-primary/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-text-main mb-3 tracking-tight">Security Handshake</h2>
          <p className="text-sm font-bold text-muted mb-10 leading-relaxed">
            Establishing a <span className="text-primary">secure tunnel</span> to our encrypted payment gateway...
          </p>
          
          {/* Countdown Container */}
          <div className="mb-10 relative">
            <div className="text-8xl font-black text-text-main opacity-5 select-none absolute inset-0 flex items-center justify-center">
              {countdown}
            </div>
            <div className="text-7xl font-black text-text-main relative z-10 animate-bounce">
              {countdown}
            </div>
            <div className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mt-2">Seconds remaining</div>
          </div>

          <div className="flex flex-col gap-4 text-center">
            <div className="flex items-center justify-center gap-2.5 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl w-fit mx-auto border border-emerald-100">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
               <span className="text-[10px] font-black uppercase tracking-widest">TLS 1.3 Encryption Active</span>
            </div>
            
            <button
              onClick={onCancel}
              className="mt-4 text-xs font-black text-muted hover:text-red-500 transition-colors uppercase tracking-widest border-b-2 border-transparent hover:border-red-100 pb-1 w-fit mx-auto"
            >
              Cancel Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Local Razorpay popup is disabled in favor of the Redirect Bridge workaround
// to bypass domain verification issues.
function openRazorPayPopup() {
  console.warn("openRazorPayPopup called directly, this should be handled by redirection logic.");
  return;
  // Previously:
  // console.log("Opening Razorpay for:", subscriptionId);
  const rzp = new window.Razorpay({
    key: import.meta.env.VITE_RAZORPAY_KEY,
    name: "Storage App",
    description: planName + " - " + planDescription,
    subscription_id: subscriptionId,
    theme: {
      color: "#2563eb",
    },
    handler: async function (response) {
      console.log("Payment successful!", response);
      onSuccess?.();
    },
    modal: {
      ondismiss: function() {
        console.log("Checkout modal closed");
        onClose?.(); // Reset loading state when modal is closed
      }
    }
  });

  rzp.on("payment.failed", function (response) {
    console.error("Payment failed:", response.error);
    onFailure?.("Payment failed: " + response.error.description);
  });

  rzp.open();
}