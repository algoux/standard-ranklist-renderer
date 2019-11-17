import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

function initAxios(): AxiosInstance {
  const axiosInstance: AxiosInstance = axios.create();
  axiosInstance.interceptors.request.use(function (config) {
    config.params = {
      ...config.params,
      _t: new Date().getTime(),
    };
    return config;
  });
  return axiosInstance;
}

function checkStatus(response: AxiosResponse) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error: any = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Send a request and get API response
 * @param {string} url
 * @param {AxiosRequestConfig} options
 * @returns {Promise<T>}
 */
async function request<T = any>(url: string, options: AxiosRequestConfig = {}): Promise<T> {
  const axiosInstance = initAxios();
  const response = await axiosInstance({
    url,
    ...options,
  });
  checkStatus(response);
  return response.data;
}

export default request;
