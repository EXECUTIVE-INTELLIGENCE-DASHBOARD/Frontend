import axios from "axios";

const fallbackApiBaseUrl = "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || fallbackApiBaseUrl,
  headers: {
    Accept: "application/json",
  },
});

