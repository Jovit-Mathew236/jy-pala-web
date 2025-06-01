// File: app/api/contact-persons/search/route.js
import { Client, Databases, Query } from "appwrite";
import { NextResponse } from "next/server";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_PROJECT_ID || "6824b5530015de2f73c4");

const databases = new Databases(client);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const type = searchParams.get("type"); // 'forane' or 'parish'

  if (!query || query.length < 2) {
    return NextResponse.json({ documents: [], total: 0 });
  }

  try {
    let searchResults = [];

    // Since fulltext search might not be available, we'll use contains or equal queries
    // and filter results client-side for partial matching

    if (type === "forane") {
      // Get all documents and filter by forane
      const allResults = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID || "6824b6a50032ee5b592d",
        "68377966003d6033e89f",
        [Query.limit(100)]
      );

      // Filter results that contain the query in forane name (case-insensitive)
      searchResults = allResults.documents.filter(
        (doc) =>
          doc.forane && doc.forane.toLowerCase().includes(query.toLowerCase())
      );
    } else if (type === "parish") {
      // Get all documents and filter by parish
      const allResults = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID || "6824b6a50032ee5b592d",
        "68377966003d6033e89f",
        [Query.limit(100)]
      );

      // Filter results that contain the query in parish name (case-insensitive)
      searchResults = allResults.documents.filter(
        (doc) =>
          doc.parish && doc.parish.toLowerCase().includes(query.toLowerCase())
      );
    } else {
      // Search both forane and parish
      const allResults = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID || "6824b6a50032ee5b592d",
        "68377966003d6033e89f",
        [Query.limit(100)]
      );

      // Filter results that contain the query in either forane or parish name
      searchResults = allResults.documents.filter(
        (doc) =>
          (doc.forane &&
            doc.forane.toLowerCase().includes(query.toLowerCase())) ||
          (doc.parish && doc.parish.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Limit results to 50 for performance
    searchResults = searchResults.slice(0, 50);

    return NextResponse.json({
      documents: searchResults,
      total: searchResults.length,
    });
  } catch (error) {
    console.error("Error searching contact persons:", error);
    return NextResponse.json(
      { error: "Failed to search contact persons" },
      { status: 500 }
    );
  }
}
