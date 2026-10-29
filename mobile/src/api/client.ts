import axios, { AxiosError } from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '../constants/config';
import { ApiErrorResponse } from '../types';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.data) {
      const serverError = error.response.data;
      const message = serverError.message || 'An error occurred on the server.';
      const detailStr = serverError.details && serverError.details.length > 0
        ? `\n• ${serverError.details.join('\n• ')}`
        : '';
      return Promise.reject(new Error(message + detailStr));
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return Promise.reject(new Error('Network request timed out. Please verify your backend server is running.'));
    }

    if (!error.response) {
      return Promise.reject(
        new Error(`Cannot connect to backend at ${API_BASE_URL}. Ensure the Spring Boot server is running on port 8080.`)
      );
    }

    return Promise.reject(new Error(error.message || 'An unknown network error occurred.'));
  }
);
