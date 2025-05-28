"use client";

import { useState } from "react";
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

type EditParishPageProps = {
  params: {
    id: string;
  };
};

export default function EditParishPage({ params }: EditParishPageProps) {
  const id = Number.parseInt(params.id, 10);
  const parish = parishes.find((p) => p.id === id);

  if (!parish) {
    notFound();
  }

  const [parishName, setParishName] = useState(parish.name);
  const [parishFullName, setParishFullName] = useState(parish.fullName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ id, parishName, parishFullName });
    // Redirect back to parish detail page after submission
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        username="Matthews P Mathew"
        userRole="Parish Ministry Coordinator"
      />

      <main className="max-w-md mx-auto p-4">
        <div className="mb-6">
          <Link
            href={`/admin/parish/${id}`}
            className="text-primary flex items-center"
          >
            <span>←</span>
            <span className="ml-2">Back to Parish Details</span>
          </Link>
        </div>

        <div className="bg-card shadow-md rounded-lg p-6">
          <h1 className="text-xl font-semibold mb-6">Edit Parish</h1>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="parishName"
                  className="block mb-2 text-sm font-medium"
                >
                  Parish Name
                </label>
                <input
                  id="parishName"
                  type="text"
                  className="w-full p-3 rounded-md border border-input bg-background"
                  value={parishName}
                  onChange={(e) => setParishName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="parishFullName"
                  className="block mb-2 text-sm font-medium"
                >
                  Parish Full Name
                </label>
                <input
                  id="parishFullName"
                  type="text"
                  className="w-full p-3 rounded-md border border-input bg-background"
                  value={parishFullName}
                  onChange={(e) => setParishFullName(e.target.value)}
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full p-3 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
