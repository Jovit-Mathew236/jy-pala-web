/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { Client, Databases } from "appwrite";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await context.params;

    if (!requestId) {
      // This checks if requestId is an empty string, as it's typed as string.
      console.error("API Route: Missing requestId in params (empty string).");
      return NextResponse.json(
        {
          success: false,
          error: "Request ID is required and cannot be empty.",
        },
        { status: 400 }
      );
    }

    const client = new Client()
      .setEndpoint(
        process.env.API_ENDPOINT || "https://fra.cloud.appwrite.io/v1"
      )
      .setProject(process.env.PROJECT_ID as string); // Ensure PROJECT_ID is set

    const databases = new Databases(client);

    try {
      const userRequest = await databases.getDocument(
        process.env.DATABASE_ID || "users_database", // Ensure these are configured or valid defaults
        process.env.USERS_COLLECTION_ID || "users_collection", // Ensure these are configured or valid defaults
        requestId
      );

      return NextResponse.json({
        success: true,
        userRequest,
      });
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (docError: any) {
      console.error(`Appwrite document error for ID ${requestId}:`, docError);

      // Appwrite errors often have a 'code' property (number) and 'message' (string)
      // Checking for specific Appwrite error codes like 404 (Not Found)
      if (docError.code === 404) {
        return NextResponse.json(
          {
            success: false,
            error: `User request not found for ID: ${requestId}`,
          },
          { status: 404 }
        );
      }

      // For other Appwrite errors or errors that mimic Appwrite's structure
      return NextResponse.json(
        {
          success: false,
          error: docError.message || "Failed to retrieve user request.",
        },
        // Use docError.code if it's a number (status code), otherwise default to 500
        { status: typeof docError.code === "number" ? docError.code : 500 }
      );
    }
  } catch (error) {
    console.error(
      "General error in GET /api/auth/user-request/[requestId]:",
      error
    );
    return NextResponse.json(
      {
        success: false,
        error:
          (error instanceof Error ? error.message : String(error)) ||
          "Unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
