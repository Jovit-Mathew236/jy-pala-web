import { NextResponse } from "next/server";
import { Client, Databases, ID, Users } from "node-appwrite";
import nodemailer from "nodemailer";
// import { account } from "@/app/appwrite";
export async function POST(request: Request) {
  try {
    const { requestId, approved, email, name, phone } = await request.json();

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: "Request ID is required" },
        { status: 400 }
      );
    }

    // Determine the action based on the approved flag
    const action = approved ? "approve" : "reject";

    // Initialize Appwrite client with API key for server-side operations
    const client = new Client()
      .setEndpoint("https://fra.cloud.appwrite.io/v1")
      .setProject(process.env.PROJECT_ID as string)
      .setKey(process.env.API_KEY as string); // Add API key for server operations

    // Initialize services
    const databases = new Databases(client);
    // const users = new Users(client); // Use Users service instead of Account

    // Get the user request from database
    let userRequest;
    try {
      userRequest = await databases.getDocument(
        process.env.DATABASE_ID as string,
        process.env.USERS_COLLECTION_ID as string,
        requestId
      );
    } catch (error) {
      console.error("Error fetching user request:", error);
      return NextResponse.json(
        { success: false, error: "User request not found" },
        { status: 404 }
      );
    }

    const generateTemporaryPassword = () => {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
      let password = "";
      for (let i = 0; i < 12; i++) {
        // Increased length for better security
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters.charAt(randomIndex);
      }
      return password;
    };

    let createdUser = null;
    let temporaryPassword = null;

    if (action === "approve") {
      try {
        // Generate temporary password
        temporaryPassword = generateTemporaryPassword();

        // Create user account using Users service
        const users = new Users(client);
        createdUser = await users.create(
          ID.unique(),
          email,
          `+91${phone}`, // phone (optional)
          temporaryPassword,
          name
        );

        // Update user preferences to set role
        await users.updatePrefs(createdUser.$id, { role: "super_admin" });
        console.log("Account created successfully:", createdUser.$id);
      } catch (accountError) {
        console.error("Error creating account:", accountError);

        // Update request status to failed
        await databases.updateDocument(
          process.env.DATABASE_ID as string,
          process.env.USERS_COLLECTION_ID as string,
          requestId,
          {
            status: "failed",
          }
        );

        return NextResponse.json(
          { success: false, error: "Failed to create user account" },
          { status: 500 }
        );
      }
    }

    // Update request status in database
    try {
      await databases.updateDocument(
        process.env.DATABASE_ID as string,
        process.env.USERS_COLLECTION_ID as string,
        requestId,
        {
          status: action === "approve" ? "approved" : "rejected",
          // processed_at: new Date().toISOString(),
          // appwrite_user_id: createdUser ? createdUser.$id : null,
        }
      );
    } catch (updateError) {
      console.error("Error updating request status:", updateError);
      // Continue with email sending even if status update fails
    }

    // Send appropriate email based on action
    if (action === "approve") {
      try {
        if (createdUser && temporaryPassword) {
          // Send email with login credentials
          await sendUserApprovalEmailWithCredentials({
            email: userRequest.email,
            name: userRequest.name,
            temporaryPassword: temporaryPassword,
            userId: createdUser.$id,
          });
        } else {
          // Fallback approval email
          await sendUserApprovalEmail({
            email: userRequest.email,
            name: userRequest.name,
          });
        }
      } catch (emailError) {
        console.error("Error sending approval email:", emailError);
        // Don't fail the entire operation if email fails
      }
    } else {
      try {
        await sendUserRejectionEmail({
          email: userRequest.email,
          name: userRequest.name,
        });
      } catch (emailError) {
        console.error("Error sending rejection email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `User request ${
        action === "approve" ? "approved" : "rejected"
      } successfully`,
      data: {
        userId: createdUser ? createdUser.$id : null,
        status: action === "approve" ? "approved" : "rejected",
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || "Failed to process request",
      },
      { status: 500 }
    );
  }
}

// Function to send verification email to user
async function sendUserApprovalEmailWithCredentials(userData: {
  email: string;
  name: string;
  temporaryPassword: string;
  userId: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const loginUrl = `${baseUrl}/login`;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASSWORD as string,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER as string,
    to: userData.email,
    subject: "Your JY Pala Account Has Been Approved - Login Credentials",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4CAF50;">Account Approved!</h2>
        <p>Hello ${userData.name},</p>
        <p>Your request to access the JY Pala system has been approved and your account has been created.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Your Login Credentials:</h3>
          <p><strong>Email:</strong> ${userData.email}</p>
          <p><strong>Temporary Password:</strong> <code style="background-color: #e0e0e0; padding: 2px 4px; border-radius: 3px;">${userData.temporaryPassword}</code></p>
        </div>
        
        <p style="color: #ff6b35;"><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
        
        <div style="margin-top: 30px;">
          <a href="${loginUrl}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Login Now</a>
        </div>
        
        <p style="margin-top: 20px; font-size: 12px; color: #777;">
          If you have any issues logging in, please contact our support team.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to: ${userData.email}`);
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }
}

// Function to send approval email (when no verification is needed)
async function sendUserApprovalEmail(userData: {
  email: string;
  name: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const loginUrl = `${baseUrl}/login`;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASSWORD as string,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER as string,
    to: userData.email,
    subject: "Your Account Has Been Approved",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Account Approved!</h2>
        <p>Hello ${userData.name},</p>
        <p>Your request to access the JY Pala system has been approved.</p>
        <p>You can now log in to the system using your credentials.</p>
        <div style="margin-top: 20px;">
          <a href="${loginUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Login Now</a>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to: ${userData.email}`);
  } catch (error) {
    console.error("Failed to send approval email:", error);
  }
}

// Function to send rejection email to user
async function sendUserRejectionEmail(userData: {
  email: string;
  name: string;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number.parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASSWORD as string,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER as string,
    to: userData.email,
    subject: "Update on Your Access Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Access Request Update</h2>
        <p>Hello ${userData.name},</p>
        <p>We've reviewed your request to access the JY Pala system.</p>
        <p>Unfortunately, we are unable to approve your request at this time.</p>
        <p>If you believe this is in error or would like more information, please contact our support team.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent to: ${userData.email}`);
  } catch (error) {
    console.error("Failed to send rejection email:", error);
  }
}
