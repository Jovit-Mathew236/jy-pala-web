"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Client, Account, Databases, Query } from "appwrite";
import type { Models } from "appwrite";

// Define the shape of our context
interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  checkAuthStatus: async () => false,
});

// Create a client instance to be used across the auth provider
const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID || "6824b5530015de2f73c4");

const account = new Account(client);
const databases = new Databases(client);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Function to check if user is authenticated and approved
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      // First, try to get the current user
      const currentUser = await account.get();

      // If we get here, user has a valid session
      // Now check if the user is approved in the database
      try {
        const userRequests = await databases.listDocuments(
          process.env.NEXT_PUBLIC_DATABASE_ID || "6824b6a50032ee5b592d",
          process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || "68250cce0003a9e21ee8",
          [Query.equal("email", currentUser.email)]
        );

        if (userRequests.total > 0) {
          const userRequest = userRequests.documents[0];

          // If user is not approved or verified, don't allow access
          if (
            userRequest.status !== "approved" &&
            userRequest.status !== "verified"
          ) {
            // User exists but is not approved
            await logout(); // Use our logout function to clean up properly
            throw new Error(
              "Your account is pending approval. Please wait for an administrator to approve your request."
            );
          }
        } else {
          // User has a session but no record in the database
          await logout();
          throw new Error(
            "User record not found. Please contact an administrator."
          );
        }
      } catch (dbError) {
        console.error("Error checking user approval status:", dbError);

        // If it's our custom error, re-throw it
        if (
          dbError instanceof Error &&
          dbError.message.includes("pending approval")
        ) {
          throw dbError;
        }

        // For other database errors, we might want to allow the user through
        // or handle this based on your business logic
        console.warn("Could not verify user approval status, allowing access");
      }

      // If we get here, the user is authenticated and approved
      setUser(currentUser);
      return true;
    } catch (error) {
      // Clear user state on any error
      setUser(null);

      // Re-throw custom errors (like pending approval)
      if (
        error instanceof Error &&
        (error.message.includes("pending approval") ||
          error.message.includes("User record not found"))
      ) {
        throw error;
      }

      // For Appwrite errors (like missing scope), just return false
      console.log("Auth check failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // First, create the session
      const session = await account.createEmailPasswordSession(email, password);
      console.log("Session created successfully:", session);

      // Small delay to ensure session is fully established
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Now get the user directly since we know the session exists
      const currentUser = await account.get();
      console.log("User retrieved:", currentUser);

      // Check if the user is approved in the database
      try {
        const userRequests = await databases.listDocuments(
          process.env.NEXT_PUBLIC_DATABASE_ID || "6824b6a50032ee5b592d",
          process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || "68250cce0003a9e21ee8",
          [Query.equal("email", currentUser.email)]
        );

        if (userRequests.total > 0) {
          const userRequest = userRequests.documents[0];

          // If user is not approved or verified, don't allow access
          if (
            userRequest.status !== "approved" &&
            userRequest.status !== "verified"
          ) {
            // User exists but is not approved
            await account.deleteSession("current");
            setUser(null);
            throw new Error(
              "Your account is pending approval. Please wait for an administrator to approve your request."
            );
          }
        } else {
          // User has a session but no record in the database
          await account.deleteSession("current");
          setUser(null);
          throw new Error(
            "User record not found. Please contact an administrator."
          );
        }
      } catch (dbError) {
        console.error("Error checking user approval status:", dbError);

        // If it's our custom error, re-throw it
        if (
          dbError instanceof Error &&
          (dbError.message.includes("pending approval") ||
            dbError.message.includes("User record not found"))
        ) {
          throw dbError;
        }

        // For other database errors, log but continue
        console.warn("Could not verify user approval status, allowing access");
      }

      // If we get here, the user is authenticated and approved
      setUser(currentUser);
    } catch (error) {
      console.error("Login error:", error);

      // Clean up any partial session
      try {
        await account.deleteSession("current");
      } catch (cleanupError) {
        // Ignore cleanup errors
        console.warn("Failed to cleanup session:", cleanupError);
      }

      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);

      // Try to delete the current session
      await account.deleteSession("current");
    } catch (error) {
      // Even if session deletion fails, we should clear the local state
      console.warn("Logout error (session may have already expired):", error);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  // Check auth status on mount
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        if (isMounted) {
          await checkAuthStatus();
        }
      } catch (error) {
        // Silently fail on initial load if there's an error
        console.log("Initial auth check failed:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // This effect should only run once on mount

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
