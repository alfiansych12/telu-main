import axios, { AxiosRequestConfig } from 'axios';
import { getSession } from 'next-auth/react';
import { getserverAuthSession } from './authOptions';
import { redirect } from 'next/navigation';

const axiosServices = axios.create({ baseURL: process.env.NEXT_PUBLIC_NEXT_APP_API_URL });
export const axiosLogin = axios.create({ baseURL: process.env.NEXT_APP_API_URL_LOGIN });

// ==============================|| AXIOS - FOR SERVICES ||============================== //

/**
 * Request interceptor to add Authorization token to request
 */

axiosServices.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const session = await getSession();
    if (session?.token?.accessToken) {
      config.headers['Authorization'] = `Bearer ${session.token.accessToken}`;
    }
  } else {
    const session = await getserverAuthSession();
    if (session?.token?.accessToken) {
      config.headers['Authorization'] = `Bearer ${session.token.accessToken}`;
    }
  }
  return config;
});

axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/logout';
      } else {
        redirect('/logout');
      }
    }

    return Promise.reject(error);
  }
);

if (process.env.NEXT_PUBLIC_ENV === 'staging' || process.env.NEXT_PUBLIC_ENV === 'production') {
  axiosServices.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 500) {
        return Promise.reject(new Error('Internal Server Error. Please try again later.'));
      }
      return Promise.reject(error);
    }
  );
}

export default axiosServices;

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config });

  return res.data;
};
