import axios from "axios";

const fallbackApiBaseUrl =
  "https://greenhill-eid-backend.onrender.com/api";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || fallbackApiBaseUrl,
  headers: {
    Accept: "application/json",
  },
  withCredentials: true,
});