/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { Client, Databases } from "appwrite";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { requestId: string } }
) {
  try {
    const { requestId } = await context.params;

    if (!requestId) {
      console.error("API Route: Missing requestId in params.");
      return NextResponse.json(
        {
          success: false,
          error: "Request ID is required but was not found.",
        },
        { status: 400 }
      );
    }

    const client = new Client()
      .setEndpoint(
        process.env.API_ENDPOINT || "https://fra.cloud.appwrite.io/v1"
      )
      .setProject(process.env.PROJECT_ID as string);

    const databases = new Databases(client);

    try {
      const userRequest = await databases.getDocument(
        process.env.DATABASE_ID || "users_database",
        process.env.USERS_COLLECTION_ID || "users_collection",
        requestId
      );

      return NextResponse.json({
        success: true,
        userRequest,
      });
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (docError: any) {
      console.error(`Appwrite document error for ID ${requestId}:`, docError);

      if (docError.code === 404) {
        return NextResponse.json(
          {
            success: false,
            error: `User request not found for ID: ${requestId}`,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: docError.message || "Failed to retrieve user request.",
        },
        { status: docError.code ?? 500 }
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
        error: (error as Error).message || "Unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
