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
          "group inline-flex items-center justify-center gap-2 " +
          "h-[42px] px-5 " +
          "text-[14px] leading-none font-medium text-[#3c4043] font-roboto " +
          "bg-white border border-[#dadce0] rounded-lg " +
          "shadow-[0_1px_2px_rgba(0,0,0,0.08)] " +
          "hover:bg-[#f8f9fa] hover:shadow-[0_2px_6px_rgba(0,0,0,0.12)] " +
          "active:scale-[0.99] " +
          "focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30 " +
          "transition-all duration-150 ease-in-out " +
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
        }
        aria-label="Import files from Google Drive"
      >
        {isAuthenticating ? (
          <>
            <div className="w-5 h-5 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
            <span className="relative -top-[1px]">Connecting...</span>
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 87.3 78"
              className="w-[18px] h-[18px] flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.9 2.5 3.2 3.3l12.3-21.3-6.5-11.3H4.35c-.5.15-1 .35-1.45.65-2.55 1.45-3.6 4.35-2.1 6.85l5.8 11.85z" fill="#0066DA" />
              <path d="M43.65 25l13.9-25H31.5l-6.55 11.35-7.1 12.3 9.4 16.3 16.4-14.95" fill="#00AC47" />
              <path d="M73.55 76.8c1.45-.8 2.5-1.9 3.2-3.3l9.45-16.35c1.45-2.55.45-5.45-2.1-6.85-.5-.3-1-.5-1.55-.65L61.2 25h-9.7l9.4 16.3 12.65 21.8z" fill="#EA4335" />
              <path d="M43.65 25L27.25 53.4l-7.1-12.3L37.1 13.65l6.55 11.35z" fill="#00832D" />
              <path d="M57.55 53.4H24.7l-9.4 16.3 9.7 16.8h46.1l-6.55-11.35H57.55z" fill="#2684FC" />
              <path d="M58.25 53.4h-31L14.6 79.5h33.6c2.8 0 5.3-1.5 6.65-4L67.6 53.4H58.25z" fill="#FFBA00" />
            </svg>

            <span className="relative -top-[1px]">
              Import from Drive
            </span>
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
