import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const stripTrailingSlash = (value: string) => value.replace(/\/$/, "");

const getAdminBaseUrl = (): string => {
  const url = process.env.NEXT_PUBLIC_ADMIN_SERVER_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_ADMIN_SERVER_URL is not configured");
  }
  return stripTrailingSlash(url);
};

const adminHeaders = (): AxiosRequestConfig["headers"] => ({
  "Content-Type": "application/json",
  Accept: "application/json",
});

export const adminRequest = async <T>(
  config: AxiosRequestConfig
): Promise<T> => {
  const response: AxiosResponse<T> = await axios({
    baseURL: getAdminBaseUrl(),
    headers: adminHeaders(),
    ...config,
  });
  return response.data;
};

export const apiRequest = async <T>(
  config: AxiosRequestConfig
): Promise<T> => {
  const response: AxiosResponse<T> = await axios({
    baseURL: "/api",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...config,
  });
  return response.data;
};
