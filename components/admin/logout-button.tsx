"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50"
    >
      <LogOut size={16} />
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
