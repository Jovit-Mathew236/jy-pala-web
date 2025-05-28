import { Client, Databases, Query } from "appwrite";
import { NextResponse } from "next/server";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID || "6824b5530015de2f73c4");

const databases = new Databases(client);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forane = searchParams.get("forane");
  const parish = searchParams.get("parish");

  try {
    const queries = [];
    if (forane) queries.push(Query.equal("forane", forane));
    if (parish) queries.push(Query.equal("parish", parish));

    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID || "6824b6a50032ee5b592d",
      "68377966003d6033e89f", // contact_person collection ID
      queries
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching contact persons:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact persons" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, contactNumber, forane, parish, dob } = body;

    const response = await databases.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID || "6824b6a50032ee5b592d",
      "68377966003d6033e89f", // contact_person collection ID
      "unique()",
      {
        name,
        phone: contactNumber,
        forane,
        parish,
        dob,
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error creating contact person:", error);
    return NextResponse.json(
      { error: "Failed to create contact person" },
      { status: 500 }
    );
  }
}
