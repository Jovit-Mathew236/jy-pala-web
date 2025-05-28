// components/AuthGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "../app/appwrite";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  redirectTo?: string;
}

const AuthGuard = ({
  children,
  requiredRole = "user",
  redirectTo = "/login",
}: AuthGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await account.get();
      const role = user.prefs?.role || "user";

      setIsAuthenticated(true);
      setUserRole(role);

      // Check if user has required role
      if (requiredRole && !hasRequiredRole(role, requiredRole)) {
        router.push("/unauthorized");
        return;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);

      // Get current path for redirect after login
      const currentPath = window.location.pathname;
      router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const hasRequiredRole = (userRole: string, requiredRole: string): boolean => {
    const roleHierarchy = {
      user: 1,
      admin: 2,
      superadmin: 3,
    };

    const userLevel =
      roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel =
      roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userLevel >= requiredLevel;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
};

// HOC version for easier use
export const withAuth = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  WrappedComponent: React.ComponentType<any>,
  requiredRole?: string
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function AuthenticatedComponent(props: any) {
    return (
      <AuthGuard requiredRole={requiredRole}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };
};

export default AuthGuard;
