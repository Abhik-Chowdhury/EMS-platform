import { useEffect, useMemo, useState } from "react";
import { AUTH_STORAGE_KEY, AuthContext } from "./authStore";

// to check whether the token is expired or not
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const payload = JSON.parse(window.atob(parts[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

// read the data of the stored user
const readStoredUser = () => {
  try {
    const rawUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawUser) return null;
    const parsed = JSON.parse(rawUser);

    if (parsed && parsed.token && isTokenExpired(parsed.token)) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      window.localStorage.removeItem("token");
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

// to setup AuthProvider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStoredUser);

  // Auto-sync React state when localStorage is cleared or modified
  useEffect(() => {
    const syncAuth = () => {
      const activeUser = readStoredUser();
      setUser(activeUser);
    };

    // 1. Triggers if localStorage is changed/cleared from another tab or window
    window.addEventListener("storage", syncAuth);

    // 2. Triggers when you switch back from DevTools Application tab into the app page
    window.addEventListener("focus", syncAuth);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncAuth);
    };
  }, []);

  const login = async ({ email, password }) => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return {
        ok: false,
        message: "Enter both email and password to continue.",
      };
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          ok: false,
          message: data.message || "Login Failed",
        };
      }

      if (data.role !== "admin") {
        return {
          ok: false,
          message: "Access Denied. You do not have administrator privileges.",
        };
      }

      const nextUser = {
        email: cleanEmail,
        name: data.name || cleanEmail.split("@")[0],
        role: data.role,
        token: data.token,
        loginAt: new Date().toISOString(),
      };

      // store in localstorage
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
      window.localStorage.setItem("token", data.token);
      setUser(nextUser);
      return { ok: true };
    } catch (error) {
      console.error("Login Error", error);
      return {
        ok: false,
        message: "Server Error",
      };
    }
  };

  const logout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem("token");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      login,
      logout,
      user,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};