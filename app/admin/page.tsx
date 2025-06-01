"use client";

import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/admin/header";
import { SearchBar } from "@/components/admin/search-bar"; // Ensure this path is correct
import { ContactDrawer } from "@/components/admin/contact-drawer";
import { useAuth } from "@/lib/context/auth-context";
import { foraneData } from "@/lib/data/diocese";
import Link from "next/link";
import { ContactPerson } from "@/lib/types/diocese";

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"parish" | "forane">("parish"); // Default to 'parish'
  const [contactResults, setContactResults] = useState<ContactPerson[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showContactResults, setShowContactResults] = useState(false);
  const { user } = useAuth();

  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = async (query: string, type: string) => {
    if (query.length < 2) {
      setContactResults([]);
      setShowContactResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/contact-person/search?q=${encodeURIComponent(query)}&type=${type}`
      );
      const data = await response.json();

      if (response.ok) {
        setContactResults(data.documents || []);
        setShowContactResults(true);
      } else {
        console.error("Search error:", data.error);
        setContactResults([]);
        setShowContactResults(false);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setContactResults([]);
      setShowContactResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery, searchType);
      }, 300);
    } else {
      setContactResults([]);
      setShowContactResults(false);
    }

    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [searchQuery, searchType]);

  const filteredForanes = foraneData.filter((forane) =>
    forane.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const username = user?.name || "Admin User";
  const userRole = "Parish Ministry Coordinator";

  // This function is no longer needed as setSearchType is passed directly
  // const handleSearchTypeToggle = () => {
  //   setSearchType(searchType === "parish" ? "forane" : "parish");
  // };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setContactResults([]);
    setShowContactResults(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {" "}
      {/* Ensure `bg-background` is a light color like in the image */}
      <Header username={username} userRole={userRole} />
      <main className="max-w-2xl mx-auto p-4">
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={`Search by ${searchType}...`}
                searchType={searchType}
                onSearchTypeChange={setSearchType} // Pass setSearchType directly
              />
            </div>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* The old Search Type Toggle buttons are removed from here */}
          {/* 
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Search by:</span>
              ... old buttons ...
            </div> 
          */}
        </div>

        <div className="space-y-4">
          {/* Contact person results */}
          {showContactResults && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Contact Persons ({contactResults.length})
                </h3>
                {isSearching && (
                  <div className="text-sm text-gray-500">Searching...</div>
                )}
              </div>

              {contactResults.length > 0
                ? contactResults.map((contact) => (
                    <div
                      key={contact.$id}
                      className="bg-green-100 rounded-lg p-4 hover:bg-green-200 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">
                            {contact.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {contact.phone}
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">Forane:</span>{" "}
                              {contact.forane}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Parish:</span>{" "}
                              {contact.parish}
                            </p>
                            {contact.dob && (
                              <p className="text-sm">
                                <span className="font-medium">DOB:</span>{" "}
                                {new Date(contact.dob).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                          Contact Person
                        </div>
                      </div>
                    </div>
                  ))
                : !isSearching && (
                    <div className="text-center py-8 text-gray-500">
                      No contact persons found for &quot;{searchQuery}&quot;
                    </div>
                  )}
            </div>
          )}

          {/* Forane results when no contacts found */}
          {(!showContactResults ||
            (showContactResults && contactResults.length === 0)) && (
            <>
              {filteredForanes.length > 0
                ? filteredForanes.map((forane) => (
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
                            <p className="text-sm text-gray-600">
                              {forane.fullName}
                            </p>
                          </div>
                          <div className="text-2xl font-bold">
                            {forane.totalParishes}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                : searchQuery &&
                  !showContactResults && ( // Corrected: was missing this condition before
                    <div className="text-center py-8 text-gray-500">
                      No foranes found for &quot;{searchQuery}&quot;
                    </div>
                  )}
            </>
          )}
        </div>

        <div className="fixed bottom-8 right-8">
          <ContactDrawer />
        </div>
      </main>
    </div>
  );
}
