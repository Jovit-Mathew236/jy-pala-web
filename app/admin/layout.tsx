import AuthGuard from "@/lib/AuthGurd";
import React from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <AuthGuard requiredRole="super_admin">{children}</AuthGuard>
    </div>
  );
}
