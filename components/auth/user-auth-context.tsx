"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface UserAuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeAuthModal: () => void;
  switchAuthMode: (mode: "login" | "register") => void;
  login: (data: { mobileNumber: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; mobileNumber: string; password: string; confirmPassword: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export function UserAuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  const refreshSession = useCallback(async () => {
    // Skip user session refresh on admin routes
    if (pathname && pathname.startsWith("/admin")) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/session", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (res.ok && data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [pathname]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const openLoginModal = useCallback(() => {
    setAuthModalMode("login");
    setIsAuthModalOpen(true);
  }, []);

  const openRegisterModal = useCallback(() => {
    setAuthModalMode("register");
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const switchAuthMode = useCallback((mode: "login" | "register") => {
    setAuthModalMode(mode);
  }, []);

  const login = async (formData: { mobileNumber: string; password: string }) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: data.error || "Login failed. Please check credentials." };
    } catch {
      return { success: false, error: "Network error during login. Please try again." };
    }
  };

  const register = async (formData: { name: string; mobileNumber: string; password: string; confirmPassword: string }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.user) {
          setUser(data.user);
        }
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: data.error || "Registration failed. Please try again." };
    } catch {
      return { success: false, error: "Network error during registration. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      // Ignore
    } finally {
      setUser(null);
    }
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openLoginModal,
        openRegisterModal,
        closeAuthModal,
        switchAuthMode,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useUserAuth must be used within a UserAuthProvider");
  }
  return context;
}
