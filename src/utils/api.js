import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers:{
        "Content-Type":"application/json"
    }
});

// Request Interceptor: Attach the access token
api.interceptors.request.use(
  (config) => {
    // debug: log outgoing request URL in dev
    if (import.meta.env.DEV) console.debug('[api] request ->', config.method, config.baseURL + config.url);
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config) {
      config.withCredentials = true;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // debug: log the failed request
    if (import.meta.env.DEV) console.debug('[api] response error ->', originalRequest?.method, originalRequest?.url, error.response?.status);
    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to hit your refresh token endpoint directly so we do not recurse through the interceptor
        const { data } = await axios.post(`${baseURL}/auth/refresh-token`, {}, {
          withCredentials: true // Assuming refresh token is in an HttpOnly cookie
        });

        // Extract accessToken from response data
        const accessToken = data.data?.accessToken || data.accessToken;
        
        // Save the new token
        localStorage.setItem('accessToken', accessToken);
        
        // Update the header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If the refresh fails, log the user out
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);