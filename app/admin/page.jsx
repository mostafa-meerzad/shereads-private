import React from "react";
import { requireAdmin } from "@/lib/adminAuth";

export default function AdminPage() {
  // Server-side: will redirect to /login when the current user is not an admin
  requireAdmin();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
      <p className="mb-6">Welcome, admin — this page is protected using <code>requireAdmin()</code>.</p>

      <section className="bg-white p-4 rounded shadow">
        <h2 className="font-medium mb-2">Quick Actions</h2>
        <ul className="list-disc pl-5">
          <li>Manage users</li>
          <li>View site statistics</li>
          <li>Moderation tools</li>
        </ul>
      </section>
    </main>
  );
}
