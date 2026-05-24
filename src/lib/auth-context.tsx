"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { clearAuthStorage, endpoints, getStoredToken, getStoredUser, persistAuth } from "@/lib/api";
import { AuthResponse, User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isReady: boolean;
  login: (payload: { email: string; password: string }) => Promise<AuthResponse>;
  register: (payload: { name: string; email: string; password: string }) => Promise<AuthResponse>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfileState: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    setToken(storedToken);
    setUser(storedUser);
    setIsReady(true);
  }, []);

  const refreshProfile = async () => {
    try {
      const profile = await endpoints.auth.profile();
      setUser(profile);
      window.localStorage.setItem("expense-tracker-user", JSON.stringify(profile));
    } catch {
      clearAuthStorage();
      setToken(null);
      setUser(null);
    }
  };

  const handleAuthSuccess = (auth: AuthResponse) => {
    persistAuth(auth);
    setToken(auth.token);
    setUser(auth.user);
    return auth;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isReady,
      login: async (payload) => {
        const response = await endpoints.auth.login(payload);
        toast.success("Welcome back.");
        return handleAuthSuccess(response);
      },
      register: async (payload) => {
        const response = await endpoints.auth.register(payload);
        toast.success("Account created successfully.");
        return handleAuthSuccess(response);
      },
      logout: () => {
        clearAuthStorage();
        setToken(null);
        setUser(null);
        toast.success("Signed out safely.");
      },
      refreshProfile,
      updateProfileState: (nextUser) => {
        setUser(nextUser);
        window.localStorage.setItem("expense-tracker-user", JSON.stringify(nextUser));
      },
    }),
    [isReady, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
