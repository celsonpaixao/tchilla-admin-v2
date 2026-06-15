import axios from "axios";

// Axios client para chamadas client-side (via proxy do Next.js)
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 100_000,
  headers: { "Content-Type": "application/json" },
});

// Interceptor para tratar 401 globalmente no cliente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
