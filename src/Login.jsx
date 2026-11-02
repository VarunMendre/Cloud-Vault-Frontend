import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import DOMPurify from "dompurify";
import { Cloud, Folder, Loader2, LockKeyhole, Share2 } from "lucide-react";
import { loginWithGoogle } from "./apis/loginWithGoogle";
import { Alert, AlertDescription } from "./components/lightswind/alert";
import { useAuth } from "./context/AuthContext";
import "./AuthPages.css";

const Login = () => {
  const { refreshUser, evictionReason, clearEviction } = useAuth();
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [serverError, setServerError] = useState("");
  const [notification, setNotification] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
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

  useEffect(() => {
    if (!evictionReason) return;
    setNotification("Logged out due to login on another device");
    const timer = window.setTimeout(() => clearEviction(), 100);
    return () => window.clearTimeout(timer);
  }, [evictionReason, clearEviction]);

  const loginWithGitHubHandler = () => {
    setIsGithubLoading(true);
    const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
    window.location.assign(
      `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${window.location.origin}/github-callback&scope=read:user user:email`
    );
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (serverError) setServerError("");
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const sanitizedBody = {
        email: DOMPurify.sanitize(formData.email),
        password: DOMPurify.sanitize(formData.password),
      };

      const response = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        body: JSON.stringify(sanitizedBody),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.status === 403) {
        setNotification(
          "This account has been deleted. Please contact support for assistance."
        );
        window.setTimeout(() => setNotification(""), 5000);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (data.error) {
        setServerError(data.error);
        setIsLoading(false);
      } else {
        await refreshUser();
        navigate("/");
      }
    } catch (error) {
      console.error("Error:", error);
      setServerError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const hasError = Boolean(serverError);
  const isProviderDisabled = isGoogleLoading || isGithubLoading || isLoading;

  return (
    <div className="auth-page">
      <a className="auth-skip-link" href="#auth-form">Skip to sign in</a>

      {notification && (
        <div className="auth-toast-position">
          <Alert
            variant="destructive"
            withIcon
            duration={4000}
            dismissible
            onDismiss={() => setNotification("")}
            className="auth-alert auth-alert-error"
          >
            <AlertDescription>{notification}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="auth-layout">
        <aside className="auth-aside">
          <div className="auth-aside-copy">
            <p className="auth-eyebrow">Your files, in one place</p>
            <h1>A clearer home for everything you keep.</h1>
            <p>Find your files, manage your storage, and share with the people you choose.</p>
          </div>

          <Link className="auth-brand" to="/landing" aria-label="CloudVault home">
            <span className="auth-brand-mark"><Cloud size={23} aria-hidden="true" /></span>
            <span>CloudVault</span>
          </Link>

          <ul className="auth-benefits" aria-label="CloudVault features">
            <li><span className="auth-benefit-icon"><Folder size={18} aria-hidden="true" /></span>Keep files organized in one workspace</li>
            <li><span className="auth-benefit-icon"><Share2 size={18} aria-hidden="true" /></span>Choose viewer or editor access when sharing</li>
            <li><span className="auth-benefit-icon"><LockKeyhole size={18} aria-hidden="true" /></span>Sign in with email, Google, or GitHub</li>
          </ul>
        </aside>

        <main className="auth-main" id="auth-form">
          <section className="auth-card" aria-labelledby="login-title">
            <header className="auth-card-heading">
              <h2 id="login-title">Welcome back</h2>
              <p>Sign in to continue to your CloudVault workspace.</p>
            </header>

            <form className="auth-form" onSubmit={handleSubmit}>
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
                  autoComplete="username"
                  aria-invalid={hasError}
                  aria-describedby={hasError ? "login-error" : undefined}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <input
                  className="auth-input"
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={hasError}
                  aria-describedby={hasError ? "login-error" : undefined}
                  required
                />
                {serverError && (
                  <Alert
                    id="login-error"
                    variant="destructive"
                    withIcon
                    className="auth-alert auth-alert-error"
                  >
                    <AlertDescription>{serverError}</AlertDescription>
                  </Alert>
                )}
              </div>

              <button className="auth-primary-button" type="submit" disabled={isLoading}>
                {isLoading ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" />Signing in…</> : "Sign in"}
              </button>
            </form>

            <div className="auth-divider"><span>Or continue with</span></div>

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
                          if (data.error) {
                            setServerError(data.error);
                            setIsGoogleLoading(false);
                            return;
                          }
                          await refreshUser();
                          navigate("/");
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
              New to CloudVault? <Link className="auth-inline-link" to="/register">Create an account</Link>
            </p>
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

export default Login;
