import { useEffect, useState } from "react";

import axios from "axios";
import { Alert, AlertDescription } from "./lightswind/alert";

// Ideally these should be in a config file or env variables
// But for now we use process.env as per React standard
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || process.env.REACT_APP_GOOGLE_API_KEY;
const SCOPE = "https://www.googleapis.com/auth/drive.readonly";

export default function ImportFromDrive({ onFilesSelected, className, disabled }) {
  const [pickerApiLoaded, setPickerApiLoaded] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const [tokenClient, setTokenClient] = useState(null);
  const [error, setError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const loadGapi = () => {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = () => {
        window.gapi.load("picker", () => {
          setPickerApiLoaded(true);
        });
      };
      document.body.appendChild(script);
    };

    const loadGis = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.onload = () => {
        setGisLoaded(true);
      };
      document.body.appendChild(script);
    };

    loadGapi();
    loadGis();

    return () => {
      // Cleanup scripts if needed, though usually not necessary for single page apps
      // avoiding strict mode double load issues by checking if scripts exist could be better
      // but for now simple append is fine as per previous implementation style
    };
  }, []);

  useEffect(() => {
    if (gisLoaded) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPE,
          callback: (tokenResponse) => {
            console.log("Token Response:", tokenResponse);
            setIsAuthenticating(false);

            if (tokenResponse.error) {
              console.error("OAuth Error:", tokenResponse);
              const errorMsg = tokenResponse.error === 'access_denied'
                ? 'Access denied. Please grant permission to access Google Drive.'
                : tokenResponse.error === 'popup_closed_by_user'
                  ? 'Authentication cancelled. Please try again.'
                  : `Authentication failed: ${tokenResponse.error}`;
              setError(errorMsg);
              return;
            }

            if (tokenResponse && tokenResponse.access_token) {
              console.log("Access Token received:", tokenResponse.access_token.substring(0, 10) + "...");
              setError(null);
              createPicker(tokenResponse.access_token);
            } else {
              console.error("No access token in response");
              setError("Failed to obtain access token. Please try again.");
            }
          },
          error_callback: (error) => {
            console.error("OAuth Error Callback:", error);
            setIsAuthenticating(false);
            setError("Authentication failed. Please check your Google Cloud Console configuration.");
          },
        });
        setTokenClient(client);
        console.log("Token client initialized successfully");
      } catch (error) {
        console.error("Failed to initialize token client:", error);
        setError("Failed to initialize Google authentication. Please refresh the page.");
      }
    }
  }, [gisLoaded]);

  const handleAuth = () => {
    if (!CLIENT_ID || !API_KEY) {
      console.error("Missing Google API credentials");
      setError("Google API credentials not configured. Please check your environment variables.");
      return;
    }

    if (tokenClient) {
      try {
        console.log("Requesting access token...");
        setError(null);
        setIsAuthenticating(true);
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (error) {
        console.error("Failed to request access token:", error);
        setIsAuthenticating(false);
        setError("Failed to start authentication. Please try again.");
      }
    } else {
      console.error("Google Identity Services not loaded yet");
      setError("Google services are still loading. Please wait a moment and try again.");
    }
  };

  const createPicker = (token) => {
    if (pickerApiLoaded && token) {
      try {
        console.log("Creating Google Picker...");
        const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
          .setIncludeFolders(true)
          .setSelectFolderEnabled(false);

        const picker = new window.google.picker.PickerBuilder()
          .addView(view)
          .setOAuthToken(token)
          .setDeveloperKey(API_KEY)
          .setOrigin(window.location.protocol + "//" + window.location.host)
          .setCallback((data) => pickerCallback(data, token))
          .build();

        console.log("Google Picker created successfully");
        picker.setVisible(true);
      } catch (error) {
        console.error("Failed to create picker:", error);
        setError("Failed to open file picker. Please check your API key configuration.");
      }
    } else {
      console.error("Picker API not loaded or token missing", { pickerApiLoaded, hasToken: !!token });
      setError("Google Picker is not ready. Please refresh the page and try again.");
    }
  };

  const pickerCallback = async (data, token) => {
    console.log("Picker callback:", data.action);

    if (data.action === window.google.picker.Action.PICKED) {
      const file = data.docs[0];
      console.log("File selected:", file.name);
      setError(null);
      if (onFilesSelected) {
        onFilesSelected(file, token);
      }
    } else if (data.action === window.google.picker.Action.CANCEL) {
      console.log("User cancelled file selection");
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleAuth}
        disabled={isAuthenticating || disabled}
        className={
          className ||
          "group inline-flex items-center justify-center gap-3 px-4 py-2.5 " +
          "text-sm font-medium text-[#3c4043] font-roboto bg-white " +
          "border border-[#dadce0] rounded-[4px] " +
          "shadow-sm hover:bg-[#f8f9fa] hover:shadow hover:border-[#dadce0] " +
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1a73e8] " +
          "transition-all duration-200 ease-in-out " +
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
        }
        aria-label="Import files from Google Drive"
      >
        {isAuthenticating ? (
          <>
            <div className="w-5 h-5 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#3c4043]">Connecting...</span>
          </>
        ) : (
          <>
            {/* Official Google Drive SVG Logo */}
            <svg
              className="w-5 h-5 min-w-[20px]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 87.3 78"
            >
              <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H6.6v13.85z" fill="#0066DA" />
              <path d="M43.65 25L29.9 1.2H16.15L2.4 25H43.65z" fill="#00AC47" />
              <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.85-13.6c.8-1.4 1.25-2.95 1.25-4.5H60.4L73.55 76.8z" fill="#EA4335" />
              <path d="M16.15 1.2L2.4 25h21.2L37.35 1.2H16.15z" fill="#00832D" />
              <path d="M43.65 25L29.9 49h27.5L71.15 25H43.65z" fill="#FFBA00" />
              <path d="M57.4 49H29.9L16.15 73h54.9L57.4 49z" fill="#2684FC" />
            </svg>
            <span>Import from Drive</span>
          </>
        )}
      </button>

      {error && (
        <div className="fixed top-24 right-6 z-[100] max-w-sm w-full md:w-[380px]">
          <Alert variant="destructive" withIcon duration={5000} dismissible onDismiss={() => setError(null)} className="bg-white/95 backdrop-blur-md shadow-2xl border-red-100">
            <AlertDescription className="text-sm font-medium">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}