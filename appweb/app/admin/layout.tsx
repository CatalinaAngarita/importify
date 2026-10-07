"use client";

import { useState } from "react";
import { AdminGuard } from "@/components/AdminGuard";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="admin-layout">
        <Sidebar />
        <div className="admin-main">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="admin-content" role="main">
            {children}
          </main>
        </div>
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </AdminGuard>
  );
}