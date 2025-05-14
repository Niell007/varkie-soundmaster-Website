"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LucideRadio, 
  LayoutDashboard, 
  Newspaper, 
  Image, 
  Users, 
  Calendar, 
  ListMusic, 
  Settings, 
  LogOut 
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/") 
      ? "bg-blue-700" 
      : "";
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    window.location.href = "/admin";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated && pathname !== "/admin") {
    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/admin";
    }
    return null;
  }

  // If we're on the login page and already authenticated, don't show the admin layout
  if (isAuthenticated && pathname === "/admin") {
    if (typeof window !== "undefined") {
      window.location.href = "/admin/dashboard";
    }
    return null;
  }

  // If we're on the login page and not authenticated, just show the login form
  if (!isAuthenticated && pathname === "/admin") {
    return <div className="min-h-screen bg-gray-100">{children}</div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-800 text-white">
        <div className="p-4 flex items-center">
          <LucideRadio className="h-8 w-8 mr-2" />
          <h1 className="text-xl font-bold">Soundmaster Admin</h1>
        </div>
        <nav className="mt-8">
          <ul className="space-y-2 px-4">
            <li>
              <Link
                href="/admin/dashboard"
                className={`flex items-center px-4 py-3 rounded hover:bg-blue-700 transition-colors ${isActive(
                  "/admin/dashboard"
                )}`}
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/news"
                className={`flex items-center px-4 py-3 rounded hover:bg-blue-700 transition-colors ${isActive(
                  "/admin/news"
                )}`}
              >
                <Newspaper className="h-5 w-5 mr-3" />
                News
              </Link>
            </li>
            <li>
              <Link
                href="/admin/media-library"
                className={`flex items-center px-4 py-3 rounded hover:bg-blue-700 transition-colors ${isActive(
                  "/admin/media-library"
                )}`}
              >
                <Image className="h-5 w-5 mr-3" />
                Media Library
              </Link>
            </li>
            <li>
              <Link
                href="/admin/team"
                className={`flex items-center px-4 py-3 rounded hover:bg-blue-700 transition-colors ${isActive(
                  "/admin/team"
                )}`}
              >
                <Users className="h-5 w-5 mr-3" />
                Team
              </Link>
            </li>
            <li>
              <Link
                href="/admin/schedule"
                className={`flex items-center px-4 py-3 rounded hover:bg-blue-700 transition-colors ${isActive(
                  "/admin/schedule"
                )}`}
              >
                <Calendar className="h-5 w-5 mr-3" />
                Schedule
              </Link>
            </li>
            <li>
              <Link
                href="/admin/playlists"
                className={`flex items-center px-4 py-3 rounded hover:bg-blue-700 transition-colors ${isActive(
                  "/admin/playlists"
                )}`}
              >
                <ListMusic className="h-5 w-5 mr-3" />
                Playlists
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className={`flex items-center px-4 py-3 rounded hover:bg-blue-700 transition-colors ${isActive(
                  "/admin/settings"
                )}`}
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Link>
            </li>
            <li className="mt-8">
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-3 rounded hover:bg-red-700 transition-colors w-full text-left"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
