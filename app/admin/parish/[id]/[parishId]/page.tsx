"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/admin/header";
import { ContactDrawer } from "@/components/admin/contact-drawer";
import { foraneData } from "@/lib/data/diocese";
import { useAuth } from "@/lib/context/auth-context";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ContactPerson } from "@/lib/types/diocese";

export default function ParishPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const forane = foraneData.find((f) => f.id === params.id);
  const parish = forane?.parishes.find((p) => p.id === params.parishId);

  useEffect(() => {
    async function fetchContacts() {
      if (!forane || !parish) {
        router.push("/admin");
        return;
      }

      try {
        const response = await fetch(
          `/api/contact-person?forane=${params.id}&parish=${params.parishId}`
        );
        const data = await response.json();
        setContacts(data.documents || []);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchContacts();
  }, [params.id, params.parishId, forane, parish, router]);

  const username = user?.name || "Admin User";
  const userRole = "Parish Ministry Coordinator";

  if (!forane || !parish) {
    return null;
  }

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
            <span>Back to Parishes</span>
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">{parish.name}</h1>
          <p className="text-gray-600">{forane.fullName}</p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
          ) : contacts.length > 0 ? (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
              >
                <h2 className="text-lg font-semibold">{contact.name}</h2>
                <p className="text-gray-600">{contact.phone}</p>
                <p className="text-sm text-gray-500">
                  DOB: {new Date(contact.dob).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No contact persons found for this parish
            </div>
          )}
        </div>

        <div className="fixed bottom-8 right-8">
          <ContactDrawer />
        </div>
      </main>
    </div>
  );
}
