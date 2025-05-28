import { NextResponse } from "next/server";
import { Client, Account, Databases, Query } from "appwrite";

export async function POST(request: Request) {
  try {
    const { userId, secret } = await request.json();

    if (!userId || !secret) {
      return NextResponse.json(
        { success: false, error: "User ID and secret are required" },
        { status: 400 }
      );
    }

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint("https://fra.cloud.appwrite.io/v1")
      .setProject(process.env.PROJECT_ID as string);

    // Initialize Appwrite services
    const account = new Account(client);
    const databases = new Databases(client);

    // Update verification
    try {
      // Complete the verification process
      await account.updateVerification(userId, secret);

      // Find the user request document that matches this user ID
      try {
        const userRequests = await databases.listDocuments(
          process.env.DATABASE_ID as string,
          process.env.USERS_COLLECTION_ID as string,
          [Query.equal("userId", userId)]
        );

        // If we found a matching user request, update its status to verified
        if (userRequests.total > 0) {
          const userRequest = userRequests.documents[0];

          await databases.updateDocument(
            process.env.DATABASE_ID as string,
            process.env.USERS_COLLECTION_ID as string,
            userRequest.$id,
            {
              status: "verified",
              verified_at: new Date().toISOString(),
            }
          );
        }
      } catch (dbError) {
        console.error("Error updating user request status:", dbError);
        // Continue even if updating the database fails
      }

      return NextResponse.json({
        success: true,
        message: "Email verified successfully. You can now log in.",
      });
    } catch (verificationError) {
      console.error("Verification error:", verificationError);
      return NextResponse.json(
        {
          success: false,
          error: (verificationError as Error).message || "Verification failed",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error during verification:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          (error as Error).message || "An error occurred during verification",
      },
      { status: 500 }
    );
  }
}
