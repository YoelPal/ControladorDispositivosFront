import api from './api';
import router from '@/router';

// Interceptor de peticiones para añadir el token de autorización
api.interceptors.request.use(
    (config) => {
        const accessToken = sessionStorage.getItem('accessToken');
        // Añade la cabecera Authorization SOLO si no es la petición de refresh
        if (accessToken && config.url !== '/auth/refresh') {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;


        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    const refreshToken = sessionStorage.getItem('refreshToken');
                    if (!refreshToken) {
                        await router.push('/login');
                        return Promise.reject(error);
                    }

                    const { data } = await api.post('/auth/refresh', {refreshToken});
                    const newAccessToken = data.tokenResponse;
                    const newRefreshToken = data.refreshToken;

                    sessionStorage.setItem('accessToken', newAccessToken);
                    sessionStorage.setItem('refreshToken', newRefreshToken);

                    api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    processQueue(null, newAccessToken);
                    return api(originalRequest);

                } catch (refreshError) {
                    console.error('Error al refrescar el token:', refreshError);
                    processQueue(refreshError, null);
                    sessionStorage.removeItem('accessToken');
                    sessionStorage.removeItem('refreshToken');
                    await router.push('/login');
                    return Promise.reject(refreshError);

                } finally {
                    isRefreshing = false;
                }
            } else {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                });
            }
        }

        return Promise.reject(error);
    }
);