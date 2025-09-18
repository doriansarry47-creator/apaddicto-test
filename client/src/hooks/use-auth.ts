
import { useState, useEffect, createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ✅ Helper pour éviter "Unexpected end of JSON input"
async function safeJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Réponse du serveur invalide");
  }
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthQuery() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        if (response.status === 401) {
          return null; // User not authenticated
        }
        throw new Error("Failed to fetch user");
      }
      const data = await safeJson(response);
      return data?.user || null;
    },
    retry: (failureCount, error) => {
      // Don't retry on 401 (authentication errors)
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (reduced for better session handling)
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data?.message || "Login failed");
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], data?.user || null);
      // Invalidation immédiate pour s'assurer de la cohérence
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      role?: string;
    }) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        // Améliorer les messages d'erreur selon le code de statut
        let errorMessage = "Erreur lors de l'inscription";
        
        if (response.status === 409) {
          errorMessage = data?.message || "Un compte avec cet email existe déjà";
        } else if (response.status === 403) {
          errorMessage = data?.message || "Accès non autorisé";
        } else if (response.status === 400) {
          errorMessage = data?.message || "Données invalides";
        } else {
          errorMessage = data?.message || "Erreur du serveur";
        }
        
        throw new Error(errorMessage);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auth", "me"], data?.user || null);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data?.message || "Logout failed");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth", "me"], null);
      queryClient.clear();
    },
  });
}
