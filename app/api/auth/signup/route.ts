import { NextResponse } from "next/server";
import { Client, ID, Databases } from "appwrite";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email, name, phone, designation } = await request.json();

    if (!email || !name || !phone || !designation) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint("https://fra.cloud.appwrite.io/v1")
      .setProject(process.env.PROJECT_ID as string);

    // Initialize Appwrite services
    const databases = new Databases(client);
    // const account = new Account(client);

    // Generate a unique request ID
    const requestId = ID.unique();

    // Store access request in database
    try {
      await databases.createDocument(
        process.env.DATABASE_ID as string,
        process.env.USERS_COLLECTION_ID as string,
        requestId,
        {
          // Remove userId field as it's not in the database schema
          email,
          name,
          phone,
          designation,
          status: "pending", // pending, approved, rejected
          created_at: new Date().toISOString(),
        }
      );

      // Send email notification to admin
      await sendAdminNotification({
        requestId,
        name,
        email,
        phone,
        designation,
      });

      // Create user account in Appwrite but don't verify it yet
      // try {
      //   // Create user but don't log them in or create session
      //   // Use ID.unique() to generate a unique ID for the user account
      //   const accountId = ID.unique();
      //   await account.create(accountId, email, password, name);

      //   console.log(
      //     `Appwrite account created for ${email} with ID: ${accountId}`
      //   );
      //   // Note: We don't verify the email yet - that happens after admin approval
      // } catch (accountError) {
      //   console.error("Failed to create Appwrite account:", accountError);
      //   // Continue with the flow even if account creation fails
      //   // The admin can still approve the request
      // }

      return NextResponse.json({
        success: true,
        message:
          "Access request submitted successfully. An administrator will review your request.",
      });
    } catch (dbError) {
      console.error("Database storage error:", dbError);

      // Check for specific Appwrite errors
      const errorMessage =
        dbError instanceof Error ? dbError.message : "Unknown error";
      const statusCode = errorMessage.includes("Invalid document structure")
        ? 400
        : 500;

      return NextResponse.json(
        {
          success: false,
          error: errorMessage || "Failed to store access request",
        },
        { status: statusCode }
      );
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Failed to submit access request",
      },
      { status: 400 }
    );
  }
}

// Function to send email notification to admin
async function sendAdminNotification(requestData: {
  requestId: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
}) {
  // Create a test account or use environment variables for production
  const adminEmail = process.env.ADMIN_EMAIL || "jovitmathew236632@gmail.com";

  // Create reusable transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASSWORD as string,
    },
  });

  // Generate approval URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const approvalUrl = `${baseUrl}/admin/approve-user/${requestData.requestId}`;

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_USER as string,
    to: adminEmail,
    subject: "New User Access Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Access Request</h2>
        <p>A new user has requested access to the JY Pala system:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <p><strong>Name:</strong> ${requestData.name}</p>
          <p><strong>Email:</strong> ${requestData.email}</p>
          <p><strong>Phone:</strong> ${requestData.phone}</p>
          <p><strong>Designation:</strong> ${requestData.designation}</p>
        </div>
        <div style="margin-top: 20px;">
          <a href="${approvalUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Review Request</a>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #777;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `Admin notification sent for request ID: ${requestData.requestId}`
    );
  } catch (error) {
    console.error("Failed to send admin notification email:", error);
    // We don't throw here to prevent the API from failing if email sending fails
  }
}
