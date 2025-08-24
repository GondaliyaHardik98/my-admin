import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "/api", // e.g. http://localhost:3003/api
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("jwtToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      sessionStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
