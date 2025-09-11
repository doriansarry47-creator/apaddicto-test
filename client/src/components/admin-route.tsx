import { useAuthQuery } from "@/hooks/use-auth.ts";
import { Redirect } from "wouter";
import type { ReactNode } from "react";

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { data: user, isLoading } = useAuthQuery();

  if (isLoading) {
    // You can render a loading spinner here
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // User is not authenticated, redirect to login
    return <Redirect to="/login" />;
  }

  if (user.role !== 'admin') {
    // User is not an admin, redirect to dashboard
    return <Redirect to="/" />;
  }

  // User is an admin, render the requested page
  return <>{children}</>;
}
