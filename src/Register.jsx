import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import DOMPurify from "dompurify";
import { CheckCircle, Cloud, Loader2 } from "lucide-react";
import { loginWithGoogle } from "./apis/loginWithGoogle";
import { Alert, AlertDescription } from "./components/lightswind/alert";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./components/lightswind/input-otp";
import { PasswordStrengthIndicator } from "./components/lightswind/password-strength-indicator";
import "./AuthPages.css";

const Register = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [serverError, setServerError] = useState("");
  const [notification, setNotification] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const oauthContainerRef = useRef(null);
  const [googleBtnWidth, setGoogleBtnWidth] = useState(300);

  useEffect(() => {
    const element = oauthContainerRef.current;
    if (!element) return undefined;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setGoogleBtnWidth(Math.floor(entry.contentRect.width));
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const loginWithGitHubHandler = () => {
    setIsGithubLoading(true);
    const CLIENT_ID = "Ov23lifBnGMie0EjK9Zz";
    window.location.assign(
      `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${window.location.origin}/github-callback&scope=read:user user:email`
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "email") {
      setServerError("");
      setOtpError("");
      setOtpSent(false);
      setOtpVerified(false);
      setCountdown(0);
    }
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    const { email, name, password } = formData;
    if (!email || !name || !password) {
      setOtpError("Please fill in all fields first.");
      return;
    }

    try {
      setIsSending(true);
      const response = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setCountdown(60);
        setOtpError("");
        setCurrentStep(2);
      } else {
        setOtpError(data.error || "Failed to send OTP.");
      }
    } catch (error) {
      console.error(error);
      setOtpError("Something went wrong sending OTP.");
    } finally {
      setIsSending(false);
    }
  };

  const handleFinalSubmit = async (isVerifiedOverride = false) => {
    setServerError("");

    if (!otpVerified && !isVerifiedOverride) {
      setOtpError("Please verify your email with OTP before registering.");
      return;
    }

    try {
      const sanitizedData = {
        name: DOMPurify.sanitize(formData.name),
        email: DOMPurify.sanitize(formData.email),
        password: DOMPurify.sanitize(formData.password),
        otp: DOMPurify.sanitize(otp),
      };

      const response = await fetch(`${BASE_URL}/user/register`, {
        method: "POST",
        body: JSON.stringify(sanitizedData),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.error || !response.ok) {
        setServerError(typeof data.error === "string" ? data.error : "Registration failed. Please try again.");
        setCurrentStep(1);
        setOtpSent(false);
        setOtpVerified(false);
      } else {
        setNotification("Registration successful! Redirecting to login...");
        window.setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      console.error(error);
      setServerError("Something went wrong. Please try again.");
      setCurrentStep(1);
    }
  };

  const handleVerifyOtp = async () => {
    const { email } = formData;
    if (!otp) {
      setOtpError("Please enter OTP.");
      return;
    }

    try {
      setIsVerifying(true);
      const sanitizedOtp = DOMPurify.sanitize(otp);
      const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: sanitizedOtp }),
      });
      const data = await response.json();

      if (response.ok) {
        setOtpVerified(true);
        setOtpError("");
        setNotification("Email verified successfully!");
        window.setTimeout(() => handleFinalSubmit(true), 1500);
      } else {
        setOtpError(data.error || "Invalid or expired OTP.");
      }
    } catch (error) {
      console.error(error);
      setOtpError("Something went wrong verifying OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

  const isProviderDisabled = isGoogleLoading || isGithubLoading || isSending || isVerifying;

  return (
    <div className="auth-page">
      <a className="auth-skip-link" href="#register-form">Skip to create account</a>

      {notification && (
        <div className="auth-toast-position">
          <Alert
            variant="success"
            withIcon
            duration={4000}
            dismissible
            onDismiss={() => setNotification("")}
            className="auth-alert auth-alert-success"
          >
            <AlertDescription>{notification}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="auth-layout">
        <aside className="auth-aside">
          <div className="auth-aside-copy">
            <p className="auth-eyebrow">A workspace that grows with you</p>
            <h1>Bring your files together.</h1>
            <p>Start with free storage, add the files you need, and decide how you share them.</p>
          </div>

          <Link className="auth-brand" to="/landing" aria-label="CloudVault home">
            <span className="auth-brand-mark"><Cloud size={23} aria-hidden="true" /></span>
            <span>CloudVault</span>
          </Link>

          <ul className="auth-benefits" aria-label="CloudVault features">
            <li><span className="auth-benefit-icon"><CheckCircle size={18} aria-hidden="true" /></span>Start with 500 MB of free storage</li>
            <li><span className="auth-benefit-icon"><CheckCircle size={18} aria-hidden="true" /></span>Import files from Google Drive when you choose</li>
            <li><span className="auth-benefit-icon"><CheckCircle size={18} aria-hidden="true" /></span>Share with viewer or editor permissions</li>
          </ul>
        </aside>

        <main className="auth-main" id="register-form">
          <section className="auth-card" aria-labelledby="register-title">
            <header className="auth-card-heading">
              <h2 id="register-title">{currentStep === 1 ? "Create your account" : "Verify your email"}</h2>
              <p>{currentStep === 1 ? "A few details, then your files have a new home." : "Enter the code we sent to finish creating your account."}</p>
            </header>

            <div className="auth-stepper" aria-label={`Registration step ${currentStep} of 2`}>
              <span className={`auth-step${currentStep === 1 ? " is-current" : " is-complete"}`} aria-current={currentStep === 1 ? "step" : undefined}>Your details</span>
              <span className={`auth-step${currentStep === 2 ? " is-current" : ""}`} aria-current={currentStep === 2 ? "step" : undefined}>Email verification</span>
            </div>

            {currentStep === 1 && (
              <>
                <form className="auth-form" onSubmit={(event) => { event.preventDefault(); handleSendOtp(); }}>
                  <div className="auth-field">
                    <label htmlFor="name">Full name</label>
                    <input
                      className="auth-input"
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label htmlFor="email">Email address</label>
                    <input
                      className="auth-input"
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      aria-invalid={Boolean(serverError)}
                      aria-describedby={serverError ? "register-error" : undefined}
                      required
                    />
                    {serverError && (
                      <Alert id="register-error" variant="destructive" withIcon className="auth-alert auth-alert-error">
                        <AlertDescription>{serverError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="auth-password-field">
                    <PasswordStrengthIndicator
                      value={formData.password}
                      onChange={(value) => setFormData((previous) => ({ ...previous, password: value }))}
                      label="Password"
                      placeholder="Create a password"
                      showScore
                      showScoreNumber={false}
                      showVisibilityToggle
                      className="w-full"
                      inputProps={{ autoComplete: "new-password", required: true }}
                    />
                  </div>

                  {otpError && <p className="auth-error-message" role="alert">{otpError}</p>}

                  <button className="auth-primary-button" type="submit" disabled={isSending}>
                    {isSending ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" />Sending code…</> : "Continue with email"}
                  </button>
                </form>

                <div className="auth-divider"><span>Or sign up with</span></div>

                <div className="auth-provider-list" ref={oauthContainerRef}>
                  <div className="auth-google-wrap">
                    <div className={`auth-provider-button auth-google-visual${isProviderDisabled ? " is-disabled" : ""}`} aria-hidden="true">
                      {isGoogleLoading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <GoogleMark />}
                      {isGoogleLoading ? "Signing in…" : "Continue with Google"}
                    </div>
                    {!isProviderDisabled && (
                      <div className="auth-google-capture">
                        <GoogleLogin
                          onSuccess={async (credentialResponse) => {
                            setIsGoogleLoading(true);
                            try {
                              const data = await loginWithGoogle(credentialResponse.credential);
                              if (data && data.error) {
                                console.error("Google login error:", data.error);
                                setServerError(typeof data.error === "string" ? data.error : "Google login failed");
                                setIsGoogleLoading(false);
                                return;
                              }
                              if (data && data.success) navigate("/");
                            } catch (error) {
                              console.error("Google login error:", error);
                              setServerError("Google login failed");
                              setIsGoogleLoading(false);
                            }
                          }}
                          shape="rectangular"
                          theme="outline"
                          text="continue_with"
                          size="large"
                          width={googleBtnWidth}
                          onError={() => setIsGoogleLoading(false)}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    className="auth-provider-button"
                    type="button"
                    onClick={loginWithGitHubHandler}
                    disabled={isProviderDisabled}
                  >
                    {isGithubLoading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <GitHubMark />}
                    {isGithubLoading ? "Redirecting…" : "Continue with GitHub"}
                  </button>
                </div>

                <p className="auth-switch-copy">
                  Already have an account? <Link className="auth-inline-link" to="/login">Sign in</Link>
                </p>
                <p className="auth-legal-copy">
                  By creating an account, you agree to our <Link className="auth-inline-link" to="/terms-of-service">Terms</Link> and <Link className="auth-inline-link" to="/privacy-policy">Privacy Policy</Link>.
                </p>
              </>
            )}

            {currentStep === 2 && (
              <div className="auth-form">
                <p className="auth-otp-message" role="status">
                  {otpSent ? <>We sent a verification code to <strong>{formData.email}</strong>.</> : <>Enter the verification code sent to <strong>{formData.email}</strong>.</>}
                </p>

                <div>
                  <label className="auth-otp-label" id="otp-label">Verification code</label>
                  <InputOTP
                    maxLength={4}
                    value={otp}
                    onChange={setOtp}
                    aria-labelledby="otp-label"
                    className="auth-otp-input"
                    autoComplete="one-time-code"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {otpError && <p className="auth-error-message" role="alert">{otpError}</p>}

                <button className="auth-primary-button" type="button" onClick={handleVerifyOtp} disabled={isVerifying || otpVerified}>
                  {isVerifying ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" />Verifying…</> : otpVerified ? <><CheckCircle size={18} aria-hidden="true" />Verified</> : "Verify code"}
                </button>

                <div className="auth-resend-copy">
                  {countdown > 0 ? (
                    <p className="auth-resend-copy">Resend code in {countdown}s</p>
                  ) : (
                    <button className="auth-back-button" type="button" onClick={handleSendOtp} disabled={isSending}>
                      {isSending ? "Sending…" : "Resend verification code"}
                    </button>
                  )}
                </div>

                <button
                  className="auth-back-button"
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setOtp("");
                    setOtpError("");
                    setOtpVerified(false);
                  }}
                >
                  Back to your details
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.31-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.05.14 3.01.4c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.93.43.37.82 1.1.82 2.22v3.29c0 .32.19.69.8.58A12 12 0 0 0 24 12C24 5.37 18.63 0 12 0Z" />
    </svg>
  );
}

export default Register;
