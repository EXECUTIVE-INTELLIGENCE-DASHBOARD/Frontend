import axios from "axios";

const fallbackApiBaseUrl =
  "https://eid-backend-4mrm.onrender.com/api";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || fallbackApiBaseUrl,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});