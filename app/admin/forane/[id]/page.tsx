"use client";

import { useState } from "react";
import { Header } from "@/components/admin/header";
import { SearchBar } from "@/components/admin/search-bar";
import { ContactDrawer } from "@/components/admin/contact-drawer";
import { foraneData } from "@/lib/data/diocese";
import { useAuth } from "@/lib/context/auth-context";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function ForanePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const forane = foraneData.find((f) => f.id === params.id);
  if (!forane) {
    router.push("/admin");
    return null;
  }

  // Filter parishes based on search query
  const filteredParishes = forane.parishes.filter((parish) =>
    parish.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const username = user?.name || "Admin User";
  const userRole = "Parish Ministry Coordinator";

  return (
    <div className="min-h-screen bg-background">
      <Header username={username} userRole={userRole} />

      <main className="max-w-2xl mx-auto p-4">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-primary hover:text-primary/80"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Foranes</span>
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">{forane.fullName}</h1>
          <p className="text-gray-600">
            Total Parishes: {forane.totalParishes}
          </p>
        </div>

        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search parishes ..."
          />
        </div>

        <div className="space-y-4">
          {filteredParishes.map((parish) => (
            <Link
              href={`/admin/parish/${params.id}/${parish.id}`}
              key={parish.id}
              className="block"
            >
              <div className="bg-green-100 rounded-lg p-4 hover:bg-green-200 transition-colors">
                <h2 className="text-lg font-semibold">{parish.name}</h2>
              </div>
            </Link>
          ))}
        </div>

        <div className="fixed bottom-8 right-8">
          <ContactDrawer />
        </div>
      </main>
    </div>
  );
}
