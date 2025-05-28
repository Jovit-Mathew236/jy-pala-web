"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

type UserRequest = {
  $id: string;
  name: string;
  email: string;
  phone: number;
  designation: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function UserRequestsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRequests, setUserRequests] = useState<UserRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserRequests() {
      try {
        const response = await fetch("/api/auth/user-requests");

        if (!response.ok) {
          throw new Error("Failed to fetch user requests");
        }

        const data = await response.json();

        if (data.success) {
          setUserRequests(data.userRequests);
        } else {
          throw new Error(data.error || "Failed to fetch user requests");
        }
      } catch (error) {
        console.error("Error fetching user requests:", error);
        setError("Failed to load user requests. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRequests();
  }, []);

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert className="bg-red-50 border-red-200 mb-4">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Access Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading user requests...</div>
          ) : userRequests.length === 0 ? (
            <div className="text-center py-4">No user requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Designation</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Requested On</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userRequests.map((request) => (
                    <tr key={request.$id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{request.name}</td>
                      <td className="py-3 px-4">{request.email}</td>
                      <td className="py-3 px-4">{request.designation}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
                            request.status
                          )}`}
                        >
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {request.status === "pending" && (
                          <Link href={`/admin/approve-user/${request.$id}`}>
                            <Button size="sm">Review</Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
