
import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { signInUrl } from "../lib/session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Set once, the first time a request comes back unauthorised.
let redirectingToSignIn = false;

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      // `/login` was never a route in this app, so the redirect used to land
      // back on the dashboard it was trying to leave. `auth/login/` is the
      // route that actually starts a sign-in.
      //
      // Several requests can fail at once; the first 401 starts the navigation
      // and the rest must not fight it or they bounce the browser in a loop.
      if (!redirectingToSignIn) {
        redirectingToSignIn = true;
        window.location.assign(signInUrl());
      }
    }

    if (error.response?.status === 403) {
      console.error("You do not have permission to perform this action.");
    }

    if (!error.response) {
      console.error("Cannot connect to the server.");
    }

    return Promise.reject(error);
  },
);

export default api;
