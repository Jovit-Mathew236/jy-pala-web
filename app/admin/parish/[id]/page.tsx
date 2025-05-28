"use client";

import Link from "next/link";
import { Header } from "@/components/admin/header";
import { notFound } from "next/navigation";

// Sample data for parishes
const parishes = [
  {
    id: 1,
    name: "Pala Cathedral",
    fullName: "ST. THOMAS CATHEDRAL PALAI CATHEDRAL",
    count: 17,
  },
  {
    id: 2,
    name: "Cherpunkal",
    fullName: "MAR SLEEVA FORANE CHURCH",
    count: 15,
  },
  {
    id: 3,
    name: "Bharananganam",
    fullName: "ST. MARY'S FORANE CHURCH",
    count: 10,
  },
  {
    id: 4,
    name: "Kaduthuruthy",
    fullName: "ST. MARY'S FORANE CHURCH",
    count: 0,
  },
  {
    id: 5,
    name: "Kothanalloor",
    fullName: "SS.GERVASIS & PROTHASIS FORANE CHURCH",
    count: 0,
  },
  { id: 6, name: "Muttuchira", fullName: "HOLY GHOST FORANE CHURCH", count: 0 },
];

type ParishDetailPageProps = {
  params: {
    id: string;
  };
};

export default function ParishDetailPage({ params }: ParishDetailPageProps) {
  const id = Number.parseInt(params.id, 10);
  const parish = parishes.find((p) => p.id === id);

  if (!parish) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        username="Matthews P Mathew"
        userRole="Parish Ministry Coordinator"
      />

      <main className="max-w-md mx-auto p-4">
        <div className="mb-6">
          <Link href="/admin" className="text-primary flex items-center">
            <span>←</span>
            <span className="ml-2">Back to Parish List</span>
          </Link>
        </div>

        <div className="bg-card shadow-md rounded-lg p-6">
          <h1 className="text-xl font-semibold mb-6">{parish.name}</h1>

          <div className="space-y-4">
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-muted-foreground">Parish ID:</span>
              <span>{parish.id}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-muted-foreground">Full Name:</span>
              <span>{parish.fullName}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-muted-foreground">Count:</span>
              <span>{parish.count}</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-border">
            <div className="flex justify-between">
              <Link href={`/admin/parish/${parish.id}/edit`}>
                <button
                  type="button"
                  className="px-4 py-2 bg-accent text-accent-foreground rounded-md"
                >
                  Edit
                </button>
              </Link>
              <button
                type="button"
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
