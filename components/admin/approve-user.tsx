"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

type UserRequest = {
  $id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export default function ApproveUserPage({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userRequest, setUserRequest] = useState<UserRequest | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) {
      setError("Request ID is not available.");
      setIsLoading(false);
      return;
    }

    async function fetchUserRequestDetails() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/auth/user-request/${requestId}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `Failed to fetch user request (status: ${response.status})`
          );
        }

        const data = await response.json();

        if (data.success && data.userRequest) {
          setUserRequest(data.userRequest);
        } else {
          throw new Error(
            data.error ||
              "Failed to fetch user request: No user request data returned."
          );
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error fetching user request:", err);
        setError(
          err.message ||
            "Failed to load user request details. Please try again later."
        );
        setUserRequest(undefined);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRequestDetails();
  }, [requestId]);

  async function handleApproval(
    approved: boolean,
    email: string,
    name: string,
    phone: string
  ) {
    if (!requestId) {
      setError("Cannot process: Request ID is not available.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/approve-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          approved,
          email,
          name,
          phone,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(
          data.message ||
            `User request ${approved ? "approved" : "rejected"} successfully`
        );
        setUserRequest((prev) =>
          prev
            ? { ...prev, status: approved ? "approved" : "rejected" }
            : undefined
        );
        // setTimeout(() => router.push("/admin/user-requests"), 2500);
      } else {
        setError(
          data.error ||
            `Failed to process approval (status: ${response.status})`
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Approval error:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mx-auto py-10">
        <Alert className="bg-green-50 border-green-200 mb-4">
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
        {userRequest && (
          <Card className="max-w-md mx-auto mb-4">
            <CardHeader>
              <CardTitle>User Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Name:</strong> {userRequest.name}
              </p>
              <p>
                <strong>Email:</strong> {userRequest.email}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`font-semibold ${
                    userRequest.status === "approved"
                      ? "text-green-600"
                      : userRequest.status === "rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {userRequest.status.toUpperCase()}
                </span>
              </p>
            </CardContent>
          </Card>
        )}
        <Button onClick={() => router.push("/admin/user-requests")}>
          Back to User Requests
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p>Loading user request details...</p>
      </div>
    );
  }

  if (!userRequest) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            User request not found or could not be loaded.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Approve User Request</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-gray-500">Request ID</h3>
              <p>{userRequest.$id}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Name</h3>
              <p>{userRequest.name}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Email</h3>
              <p>{userRequest.email}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Phone</h3>
              <p>{userRequest.phone}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Designation</h3>
              <p>{userRequest.designation}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">
                Requested On
              </h3>
              <p>{new Date(userRequest.created_at).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Status</h3>
              <p
                className={`font-semibold capitalize ${
                  userRequest.status === "pending"
                    ? "text-yellow-600"
                    : userRequest.status === "approved"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {userRequest.status}
              </p>
            </div>
          </div>
        </CardContent>
        {userRequest.status === "pending" ? (
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => handleApproval(false, "", "", "")}
              disabled={isLoading}
            >
              Reject
            </Button>
            <Button
              onClick={() =>
                handleApproval(
                  true,
                  userRequest.email,
                  userRequest.name,
                  userRequest.phone
                )
              }
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Approve"}
            </Button>
          </CardFooter>
        ) : (
          <CardFooter>
            <Alert
              className="w-full"
              variant={
                userRequest.status === "approved" ? "default" : "destructive"
              }
            >
              <AlertDescription>
                This request has already been{" "}
                <strong>{userRequest.status}</strong>.
              </AlertDescription>
            </Alert>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
