import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const axiosWithCreds = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const axiosWithoutCreds = axios.create({
  baseURL: BASE_URL,
});

// Setup interceptor for rate limit globally
axiosWithCreds.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 429) {
      window.dispatchEvent(
        new CustomEvent("global-toast", {
          detail: { message: "Too many requests. Please slow down and try again.", type: "error" },
        })
      );
    }
    return Promise.reject(error);
  }
);
