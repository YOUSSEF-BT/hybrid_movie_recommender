/**
 * Authentication Hook
 *
 * Manages user authentication state and provides
 * login/signup/logout functions.
 * Uses cookies for session persistence and syncs anonymous data on login.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, AuthResponse } from "@/types";
import { getCookie, setCookie, deleteCookie } from "@/lib/cookies";
import {
  getAnonymousLikes,
  getAnonymousPreferences,
  clearAnonymousData,
} from "@/lib/anonymous-user";

const AUTH_COOKIE_KEY = "amaynu_user";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Initialize user from cookies
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const storedUser = getCookie(AUTH_COOKIE_KEY);
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        deleteCookie(AUTH_COOKIE_KEY);
        return null;
      }
    }
    return null;
  });

  // Initialize loading state - false if we can read cookies, true otherwise (SSR)
  const [isLoading, setIsLoading] = useState(
    () => typeof window === "undefined"
  );

  // Listen for cookie changes and ensure state stays in sync
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAuth = () => {
      const storedUser = getCookie(AUTH_COOKIE_KEY);
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser((currentUser) => {
            // Only update if user changed
            if (!currentUser || parsedUser.id !== currentUser.id) {
              return parsedUser;
            }
            return currentUser;
          });
        } catch {
          deleteCookie(AUTH_COOKIE_KEY);
          setUser(null);
        }
      } else {
        setUser((currentUser) => {
          // Only clear if we had a user
          if (currentUser) return null;
          return currentUser;
        });
      }
      setIsLoading(false);
    };

    // Check immediately on mount
    checkAuth();

    // Also check on focus (when user comes back to tab)
    const handleFocus = () => checkAuth();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []); // Empty deps - only run on mount

  // Signup mutation
  const signupMutation = useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      name?: string;
    }) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result: AuthResponse = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || "Signup failed");
      }
      return result.user!;
    },
    onSuccess: async (user) => {
      // Update state and cookie immediately
      setUser(user);
      setCookie(AUTH_COOKIE_KEY, JSON.stringify(user), 7);
      queryClient.invalidateQueries({ queryKey: ["user"] });

      // Sync anonymous data to database
      await syncAnonymousData(user.id);

      // Small delay to ensure state updates propagate before navigation
      await new Promise((resolve) => setTimeout(resolve, 100));

      router.push("/onboarding");
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result: AuthResponse = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || "Login failed");
      }
      return result.user!;
    },
    onSuccess: async (user) => {
      setUser(user);
      setCookie(AUTH_COOKIE_KEY, JSON.stringify(user), 7);
      queryClient.invalidateQueries({ queryKey: ["user"] });

      // Sync anonymous data to database
      await syncAnonymousData(user.id);

      // Check if user needs onboarding
      try {
        const response = await fetch("/api/user", {
          headers: { "x-user-id": user.id },
        });
        if (response.ok) {
          const userData = await response.json();
          if (!userData.preferences?.completedOnboarding) {
            router.push("/onboarding");
            return;
          }
        }
      } catch (error) {
        console.error("Failed to check preferences:", error);
      }

      router.push("/");
    },
  });

  // Sync anonymous data to database
  const syncAnonymousData = async (userId: string) => {
    try {
      const anonymousLikes = getAnonymousLikes();
      const anonymousPrefs = getAnonymousPreferences();

      // Sync film likes
      if (anonymousLikes.films.length > 0) {
        await fetch("/api/user/sync-anonymous", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": userId,
          },
          body: JSON.stringify({
            filmLikes: anonymousLikes.films,
            preferences: anonymousPrefs,
          }),
        });
      }

      // Clear anonymous data after sync
      clearAnonymousData();
    } catch (error) {
      console.error("Failed to sync anonymous data:", error);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    setUser(null);
    deleteCookie(AUTH_COOKIE_KEY);
    queryClient.clear();
    router.push("/auth/login");
  }, [router, queryClient]);

  return {
    user,
    isLoading,
    signup: signupMutation.mutateAsync,
    login: loginMutation.mutateAsync,
    logout,
    isSigningUp: signupMutation.isPending,
    isLoggingIn: loginMutation.isPending,
  };
}
