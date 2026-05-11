import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useGetAdminMe } from "@workspace/api-client-react";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const { data, isLoading } = useGetAdminMe();

  useEffect(() => {
    if (!isLoading && data && !data.authenticated) {
      navigate("/admin/login");
    }
  }, [isLoading, data, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!data?.authenticated) {
    return null;
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      <AdminSidebar />
      <main className="flex-1 md:h-[100dvh] md:overflow-y-auto">
        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
