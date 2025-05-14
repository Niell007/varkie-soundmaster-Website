"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Newspaper, 
  Image, 
  Users, 
  Calendar, 
  ListMusic,
  TrendingUp,
  BarChart
} from "lucide-react";

interface DashboardStats {
  news: number;
  media: number;
  team: number;
  schedules: number;
  playlists: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userName = session?.user?.name || 'Admin';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  useEffect(() => {
    // Only fetch if authenticated
    if (status === "authenticated") {
      const fetchStats = async () => {
        try {
          const response = await fetch("/api/dashboard/stats");

          if (!response.ok) {
            throw new Error("Failed to fetch stats");
          }

          const data = await response.json();
          setStats(data as DashboardStats);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard stats");
          console.error("Error fetching dashboard stats:", err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchStats();
    }
  }, [status]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
        <h2 className="text-lg font-semibold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        <Link href="/admin/news" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
              <Newspaper className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">News Articles</h3>
              <p className="text-2xl font-semibold">{stats?.news || 0}</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/media-library" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1760&q=80"
              className="h-10 w-10 rounded-full border-2 border-white shadow"
              alt="User profile"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Welcome back,</p>
              <h3 className="text-base font-semibold text-gray-900">{userName}</h3>
            </div>
          </div>
        </Link>

        <Link href="/admin/team" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-green-100 text-green-600 p-3 rounded-full">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">Team Members</h3>
              <p className="text-2xl font-semibold">{stats?.team || 0}</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/schedule" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">Schedule Items</h3>
              <p className="text-2xl font-semibold">{stats?.schedules || 0}</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/playlists" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="bg-red-100 text-red-600 p-3 rounded-full">
              <ListMusic className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-gray-500 text-sm">Playlists</h3>
              <p className="text-2xl font-semibold">{stats?.playlists || 0}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/news/new"
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg flex items-center transition-colors"
          >
            <Newspaper className="h-5 w-5 mr-2" />
            Add News Article
          </Link>
          <Link
            href="/admin/media-library/upload"
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg flex items-center transition-colors"
          >
            <Image className="h-5 w-5 mr-2" />
            Upload Media
          </Link>
          <Link
            href="/admin/team/new"
            className="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg flex items-center transition-colors"
          >
            <Users className="h-5 w-5 mr-2" />
            Add Team Member
          </Link>
          <Link
            href="/admin/schedule/new"
            className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 p-4 rounded-lg flex items-center transition-colors"
          >
            <img
              src="/logo.png"
              className="h-8 w-8 mr-2"
              alt="Soundmaster logo"
            />
            Add Schedule Item
          </Link>
        </div>
      </div>

      {/* Recent Activity & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Link href="#" className="text-blue-600 text-sm hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-1">
              <p className="font-medium">New article published</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4 py-1">
              <p className="font-medium">Media library updated</p>
              <p className="text-sm text-gray-500">Yesterday</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-1">
              <p className="font-medium">New team member added</p>
              <p className="text-sm text-gray-500">3 days ago</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Analytics Overview</h2>
            <div className="text-sm text-gray-500">Last 30 days</div>
          </div>
          <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200 mb-4">
            <div className="text-center text-gray-500">
              <BarChart className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Analytics visualization will appear here</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium">Page Views</span>
              </div>
              <p className="text-xl font-semibold mt-1">12,543</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium">Unique Visitors</span>
              </div>
              <p className="text-xl font-semibold mt-1">5,271</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
