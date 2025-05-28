import { NextResponse } from "next/server";

// This route is kept as a minimal placeholder since authentication
// is now handled directly on the client side using Appwrite SDK

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        "This API route is deprecated. Authentication is now handled directly on the client side.",
    },
    { status: 308 } // 308 Permanent Redirect
  );
}
