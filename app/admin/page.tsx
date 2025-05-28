"use client";

import { useState } from "react";
import { Header } from "@/components/admin/header";
import { SearchBar } from "@/components/admin/search-bar";
import { ContactDrawer } from "@/components/admin/contact-drawer";
import { useAuth } from "@/lib/context/auth-context";
import { foraneData } from "@/lib/data/diocese";
import Link from "next/link";

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  // Filter foranes based on search query
  const filteredForanes = foraneData.filter((forane) =>
    forane.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Default values in case user data isn't fully loaded yet
  const username = user?.name || "Admin User";
  const userRole = "Parish Ministry Coordinator";

  return (
    <div className="min-h-screen bg-background">
      <Header username={username} userRole={userRole} />

      <main className="max-w-2xl mx-auto p-4">
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by Parish ..."
          />
        </div>

        <div className="space-y-4">
          {filteredForanes.map((forane) => (
            <Link
              href={`/admin/forane/${forane.id}`}
              key={forane.id}
              className="block"
            >
              <div className="bg-yellow-100 rounded-lg p-4 hover:bg-yellow-200 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {forane.name} Cathedral
                    </h2>
                    <p className="text-sm text-gray-600">{forane.fullName}</p>
                  </div>
                  <div className="text-2xl font-bold">
                    {forane.totalParishes}
                  </div>
                </div>
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
