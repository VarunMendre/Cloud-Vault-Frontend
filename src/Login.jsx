"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle } from "../src/apis/loginWithGoogle";
import DOMPurify from "dompurify";
import { Cloud, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "./components/lightswind/alert";
import { useAuth } from "./context/AuthContext";

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

  // Measure OAuth container width for Google button
  const oauthContainerRef = useRef(null);
  const [googleBtnWidth, setGoogleBtnWidth] = useState(300);

  useEffect(() => {
    const el = oauthContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setGoogleBtnWidth(Math.floor(entry.contentRect.width));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Clear eviction reason when user is on login page or navigates away
  useEffect(() => {
    if (evictionReason) {
      setNotification("Logged out due to login on another device");
      // Optional: clear it from context so it doesn't persist forever
      setTimeout(() => clearEviction(), 100);
    }
  }, [evictionReason, clearEviction]);

  const loginWithGitHubHandler = () => {
    setIsGithubLoading(true);
    const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
    window.location.assign(
      `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${window.location.origin}/github-callback&scope=read:user user:email`
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (serverError) {
      setServerError("");
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const sanitizedBody = {
        email: DOMPurify.sanitize(formData.email),
        password: DOMPurify.sanitize(formData.password),
      };

      const response = await fetch(`${BASE_URL}/user/login`, {
        method: "POST",
        body: JSON.stringify(sanitizedBody),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.status === 403) {
        setNotification(
          "This account has been deleted. Please contact support for assistance."
        );
        setTimeout(() => {
          setNotification("");
        }, 5000);
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

  // DEBUG: Help resolve redirect_uri_mismatch
  useEffect(() => {
    console.group("OAuth Debug Info");
    console.log("Current Origin:", window.location.origin);
    console.log("Google Client ID (Auth):", import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID);
    console.log("Google Client ID (Drive):", import.meta.env.VITE_GOOGLE_CLIENT_ID);
    console.log("Note: Ensure these origins are registered in Google Cloud Console.");
    console.groupEnd();
  }, []);

  const hasError = Boolean(serverError);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 max-w-sm w-full md:w-[380px]">
          <Alert variant="destructive" withIcon duration={4000} dismissible onDismiss={() => setNotification("")} className="bg-white/95 backdrop-blur-md shadow-2xl border-red-100">
            <AlertDescription className="font-medium">
              {notification}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Login Card */}
      <div className="w-full max-w-md animate-scaleIn">
        <div className="bg-white rounded-2xl shadow-strong p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#66B2D6' }}>
              <Cloud className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#2C3E50' }}>Welcome Back</h2>
            <p className="text-sm" style={{ color: '#A3C5D9' }}>Sign in to access your cloud storage</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5" style={{ color: '#A7DDE9' }} />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-11 pr-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none"
                  style={{
                    borderColor: hasError ? '#EF4444' : '#D1DCE5',
                    backgroundColor: '#FFFFFF',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#66B2D6'}
                  onBlur={(e) => !hasError && (e.target.style.borderColor = '#D1DCE5')}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: '#2C3E50' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5" style={{ color: '#A7DDE9' }} />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none"
                  style={{
                    borderColor: hasError ? '#EF4444' : '#D1DCE5',
                    backgroundColor: '#FFFFFF',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#66B2D6'}
                  onBlur={(e) => !hasError && (e.target.style.borderColor = '#D1DCE5')}
                />
              </div>

              {serverError && (
                <Alert variant="destructive" withIcon className="mt-4 p-3 text-xs bg-red-50/50">
                  <AlertDescription>
                    {serverError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                isLoading ? "opacity-70 cursor-not-allowed" : "hover:shadow-medium hover:transform hover:-translate-y-0.5 active:translate-y-0"
              }`}
              style={{ backgroundColor: '#66B2D6' }}
              onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#5aa0c0')}
              onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#66B2D6')}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center mt-6 text-sm" style={{ color: '#2C3E50' }}>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold hover:underline"
              style={{ color: '#66B2D6' }}
            >
              Create Account
            </Link>
          </p>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#E6FAF5' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white" style={{ color: '#A3C5D9' }}>Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3" ref={oauthContainerRef}>
            {/* Google Login — custom styled button with invisible GoogleLogin overlay */}
            <div className="relative w-full" style={{ height: '48px' }}>
              {/* Our styled button (visible) */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 rounded-lg font-semibold transition-all duration-200 absolute inset-0 z-0"
                disabled={isGoogleLoading || isGithubLoading || isLoading}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E6FAF5',
                  color: '#2C3E50',
                  opacity: (isGoogleLoading || isGithubLoading || isLoading) ? 0.7 : 1,
                  cursor: (isGoogleLoading || isGithubLoading || isLoading) ? 'not-allowed' : 'pointer'
                }}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-[#4285F4]" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
              {/* Invisible Google Login on top to capture clicks - hidden when loading */}
              {!isGoogleLoading && !isGithubLoading && !isLoading && (
                <div className="absolute inset-0 z-10" style={{ opacity: 0, overflow: 'hidden' }}>
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      setIsGoogleLoading(true);
                      try {
                        const data = await loginWithGoogle(credentialResponse.credential);
                        if (data.error) {
                          console.log(data);
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
                    onError={() => {
                      console.log("Login Failed");
                      setIsGoogleLoading(false);
                    }}
                    useOneTap
                  />
                </div>
              )}
            </div>

            {/* GitHub Login Button */}
            <button
              onClick={loginWithGitHubHandler}
              disabled={isGoogleLoading || isGithubLoading || isLoading}
              className={`w-full flex items-center justify-center gap-3 py-3 px-4 border-2 rounded-lg font-semibold transition-all duration-200 ${
                isGoogleLoading || isGithubLoading || isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-soft'
              }`}
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E6FAF5',
                color: '#2C3E50'
              }}
              onMouseEnter={(e) => {
                if (!isGoogleLoading && !isGithubLoading && !isLoading) {
                  e.target.style.backgroundColor = '#fafdff';
                  e.target.style.borderColor = '#A7DDE9';
                }
              }}
              onMouseLeave={(e) => {
                if (!isGoogleLoading && !isGithubLoading && !isLoading) {
                  e.target.style.backgroundColor = '#FFFFFF';
                  e.target.style.borderColor = '#E6FAF5';
                }
              }}
            >
              {isGithubLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Redirecting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Continue with GitHub
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
