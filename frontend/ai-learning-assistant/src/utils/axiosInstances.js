import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true,       // sends httpOnly cookie on every request
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ================= REQUEST INTERCEPTOR ================= */
axiosInstance.interceptors.request.use(
  (config) => {
    // For FormData, let the browser set Content-Type (with boundary)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Cookie expired or invalid — redirect to login.
      // Skip if already on an auth page to avoid infinite redirect loops
      // (the session-restore call in AuthContext fires on every page load and
      // returns 401 for unauthenticated users, which is normal — not an error).
      const authPages = ['/login', '/register'];
      if (status === 401 && !authPages.includes(window.location.pathname)) {
        window.location.replace("/login");
      }

      if (status === 403) console.error("Access denied.");
      if (status >= 500) console.error("Server error. Please try again later.");

      return Promise.reject(
        new Error(data?.error || data?.message || "Something went wrong. Please try again.")
      );
    }

    if (error.code === "ECONNABORTED") {
      console.error("Request timeout. Please try again.");
    }

    return Promise.reject(
      new Error(error.message || "Something went wrong. Please try again.")
    );
  }
);

export default axiosInstance;