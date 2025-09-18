import { useAuthQuery } from "@/hooks/use-auth.ts";
import { Redirect } from "wouter";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: user, isLoading, isError } = useAuthQuery();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Small delay to prevent flash
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (isLoading || showLoading) {
    // You can render a loading spinner here
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || isError) {
    // User is not authenticated, redirect to login
    return <Redirect to="/login" />;
  }

  // User is authenticated, render the requested page
  return <>{children}</>;
}
