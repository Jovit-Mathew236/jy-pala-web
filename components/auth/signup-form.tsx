"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signupSchema,
  type SignupFormValues,
} from "@/lib/schemas/signup-schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SignupForm() {
  // const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Add password to the data
      const requestData = {
        ...data,
        // password: data.password,
      };

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();

      if (responseData.success) {
        setSubmitSuccess(true);
        // Optionally redirect after a delay
        // setTimeout(() => window.location.href = '/login?requested=true', 3000);
      } else {
        setErrorMessage(
          responseData.error || "Failed to submit access request"
        );
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-fit border-none shadow-md p-0">
      <div className="bg-secondary rounded-t-md p-6 flex flex-col">
        <div className="mt-4 flex justify-between items-center">
          <div>
            <h2 className="text-primary text-3xl font-semibold">
              Request Access
            </h2>
            <p className="text-primary mt-2 opacity-80">
              Fill the designation for access
            </p>
          </div>
          <div className="flex flex-end">
            <Image
              src="/images/auth_illustration.png"
              alt="Person working"
              width={180}
              height={150}
            />
          </div>
        </div>
      </div>

      {submitSuccess ? (
        <div className="p-6">
          <Alert className="bg-green-50 border-green-200 mb-4">
            <AlertDescription className="text-green-800">
              Your access request has been submitted successfully. An
              administrator will review your request and contact you soon.
            </AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Link
              href="/login"
              className="text-primary font-medium hover:text-primary/80"
            >
              Return to login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="p-6 pt-8">
            {errorMessage && (
              <Alert className="bg-red-50 border-red-200 mb-4">
                <AlertDescription className="text-red-800">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-base font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  disabled={isLoading}
                  className="h-12 rounded-md"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-base font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  disabled={isLoading}
                  className="h-12 rounded-md"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-base font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  disabled={isLoading}
                  className="h-12 rounded-md"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="designation" className="text-base font-medium">
                  Your Designation
                </Label>
                <Input
                  id="designation"
                  type="text"
                  placeholder="Eg: Council Member"
                  disabled={isLoading}
                  className="h-12 rounded-md"
                  {...register("designation")}
                />
                {errors.designation && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.designation.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-6 pt-0">
            <Button
              className="w-full h-12 rounded-md"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Request"}
            </Button>
            <div className="text-center text-sm mt-4">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:text-primary/80"
              >
                Sign in
              </Link>
            </div>
            <div className="text-center text-xs text-muted-foreground mt-8">
              © 2020 Crafted and designed Jesusyouthpala
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
