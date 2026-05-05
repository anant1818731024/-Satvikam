import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex bg-background">
      <AdminSidebar />
      <main className="flex-1 flex flex-col h-[100dvh] overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
