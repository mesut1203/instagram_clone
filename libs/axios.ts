import {
  getAccessToken,
  logout,
  makeRefreshToken,
} from "@/app/services/auth.action";
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_API,
});

axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check error
    if (error.status === 401) {
      // Refresh
      const refreshStatus = await makeRefreshToken();
      if (refreshStatus) {
        // retry
        return axiosInstance(error.config);
      } else {
        return await logout();
      }
    }
    return Promise.reject(error);
  },
);
