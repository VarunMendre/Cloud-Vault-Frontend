import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { BsShieldLock, BsArrowRepeat } from "react-icons/bs";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const subscriptionId = searchParams.get("subscriptionId");
  const planName = searchParams.get("planName");
  const planDescription = searchParams.get("planDescription");
  const isUpgrade = searchParams.get("isUpgrade") === "true";
  const mainDomain = "https://cloudvault.cloud"; // Hardcoded for redirection back

  useEffect(() => {
    if (!subscriptionId) {
      setError("Missing Subscription ID");
      return;
    }

    // Load Razorpay Script
    const scriptId = "razorpay-checkout-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.id = scriptId;
      script.async = true;
      script.onload = () => initiatePayment();
      document.body.appendChild(script);
    } else {
      initiatePayment();
    }
  }, [subscriptionId]);

  const initiatePayment = () => {
    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        name: "CloudVault",
        description: `${planName} - ${planDescription}`,
        subscription_id: subscriptionId,
        theme: {
          color: "#66B2D6",
        },
        handler: function (response) {
          console.log("Payment successful!", response);
          // Redirect back to main domain to show success
          window.location.href = `${mainDomain}/subscription?status=success&subId=${subscriptionId}`;
        },
        modal: {
          ondismiss: function () {
            console.log("Checkout closed");
            // Redirect back to plans if cancelled
            window.location.href = `${mainDomain}/${isUpgrade ? 'change-plan' : 'plans'}?status=cancelled`;
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        window.location.href = `${mainDomain}/${isUpgrade ? 'change-plan' : 'plans'}?status=failed&reason=${encodeURIComponent(response.error.description)}`;
      });
      rzp.open();
      setLoading(false);
    } catch (err) {
      console.error("Failed to initialize Razorpay:", err);
      setError("Failed to initialize payment gateway.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Error</h2>
          <p className="text-slate-500 mb-8">{error}</p>
          <button 
            onClick={() => window.location.href = `${mainDomain}/plans`}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition"
          >
            Back to Plans
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center relative overflow-hidden border border-slate-100">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
          <div className="h-full bg-[#66B2D6] animate-progress-indeterminate"></div>
        </div>
        
        <div className="w-20 h-20 bg-blue-50 text-[#66B2D6] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
          <BsShieldLock className="w-10 h-10" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 mb-3">Secure Checkout</h2>
        <p className="text-slate-500 mb-10 leading-relaxed font-medium">
          Connecting to our secure payment gateway to finalize your <span className="text-slate-900 font-bold">{planName}</span> subscription.
        </p>
        
        <div className="flex items-center justify-center gap-3 text-xs font-bold text-[#66B2D6] uppercase tracking-widest">
          <BsArrowRepeat className="animate-spin w-4 h-4" />
          <span>Processing Redirect...</span>
        </div>
      </div>
    </div>
  );
}
