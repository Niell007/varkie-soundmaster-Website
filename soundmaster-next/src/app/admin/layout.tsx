"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    // If we're on the login page and already authenticated, redirect to dashboard
    if (status === "authenticated" && pathname === "/admin") {
      router.push("/admin/dashboard");
    }
    
    // If we're not on the login page and not authenticated, redirect to login
    if (status === "unauthenticated" && pathname !== "/admin") {
      router.push("/admin");
    }
  }, [status, pathname, router]);

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If we're on the login page and not authenticated, just show the login form
  if (status === "unauthenticated" && pathname === "/admin") {
    return <div className="min-h-screen bg-gray-100">{children}</div>;
  }

  // If authenticated, show the admin layout with sidebar and header
  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <AdminHeader user={session?.user} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
