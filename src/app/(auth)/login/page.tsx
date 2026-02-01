'use client';

import { useEffect } from 'react';
import Login from 'views/authentication/Login';

// ================================|| LOGIN ||================================ //

const LoginPage = () => {
  useEffect(() => {
    // Clear all cookies on login page load to prevent HTTP 431
    const clearAllCookies = () => {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        // Clear cookie for all possible paths
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname;
      }
    };

    // Only clear cookies if there are too many (potential 431 issue)
    const cookieCount = document.cookie.split(';').filter(c => c.trim()).length;
    if (cookieCount > 5) {
      console.log('Clearing old cookies to prevent HTTP 431...');
      clearAllCookies();
    }
  }, []);

  return <Login />;
};

export default LoginPage;
