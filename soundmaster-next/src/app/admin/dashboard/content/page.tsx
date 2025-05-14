"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { DataTable } from "@/components/admin/data-table";
import { 
  FileText, 
  Newspaper, 
  Users, 
  Calendar, 
  ListMusic,
  Plus,
  Edit,
  Trash,
  ExternalLink
} from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  type: "news" | "team" | "schedule" | "playlist";
  status: "published" | "draft";
  updatedAt: string;
  author: string;
}

export default function ContentPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [contentType, setContentType] = useState<string>("all");
  
  // Mock content data
  const mockContent: ContentItem[] = [
    {
      id: "1",
      title: "Soundmaster Radio Launches New Morning Show",
      type: "news",
      status: "published",
      updatedAt: "2025-05-10T10:30:00Z",
      author: "Admin User"
    },
    {
      id: "2",
      title: "Meet Our New Host: Sarah Johnson",
      type: "team",
      status: "published",
      updatedAt: "2025-05-08T14:15:00Z",
      author: "Admin User"
    },
    {
      id: "3",
      title: "Weekend Special: Jazz Classics",
      type: "schedule",
      status: "published",
      updatedAt: "2025-05-07T09:45:00Z",
      author: "Editor User"
    },
    {
      id: "4",
      title: "Summer Hits Playlist",
      type: "playlist",
      status: "draft",
      updatedAt: "2025-05-06T16:20:00Z",
      author: "Editor User"
    },
    {
      id: "5",
      title: "Upcoming Interview with Local Band",
      type: "news",
      status: "draft",
      updatedAt: "2025-05-05T11:10:00Z",
      author: "Admin User"
    }
  ];

  // Filter content based on type and search term
  const filteredContent = mockContent.filter(item => {
    const matchesType = contentType === "all" || item.type === contentType;
    const matchesSearch = searchTerm === "" || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Get icon for content type
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "news":
        return <Newspaper className="h-4 w-4 text-blue-500" />;
      case "team":
        return <Users className="h-4 w-4 text-green-500" />;
      case "schedule":
        return <Calendar className="h-4 w-4 text-yellow-500" />;
      case "playlist":
        return <ListMusic className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Table columns definition
  const columns = [
    {
      header: "Title",
      accessorKey: "title" as keyof ContentItem,
      cell: (item: ContentItem) => (
        <div className="flex items-center">
          <span className="mr-2">{getContentTypeIcon(item.type)}</span>
          <span className="font-medium">{item.title}</span>
        </div>
      ),
      sortable: true
    },
    {
      header: "Type",
      accessorKey: "type" as keyof ContentItem,
      cell: (item: ContentItem) => (
        <span className="capitalize">{item.type}</span>
      ),
      sortable: true
    },
    {
      header: "Status",
      accessorKey: "status" as keyof ContentItem,
      cell: (item: ContentItem) => (
        <span className={`px-2 py-1 rounded-full text-xs ${item.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
          {item.status === "published" ? "Published" : "Draft"}
        </span>
      ),
      sortable: true
    },
    {
      header: "Last Updated",
      accessorKey: "updatedAt" as keyof ContentItem,
      cell: (item: ContentItem) => formatDate(item.updatedAt),
      sortable: true
    },
    {
      header: "Author",
      accessorKey: "author" as keyof ContentItem,
      sortable: true
    }
  ];

  // Actions for each content item
  const renderActions = (item: ContentItem) => (
    <div className="flex space-x-2">
      <button 
        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
        onClick={() => console.log(`Edit ${item.id}`)}
        title="Edit"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button 
        className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
        onClick={() => console.log(`View ${item.id}`)}
        title="View"
      >
        <ExternalLink className="h-4 w-4" />
      </button>
      <button 
        className="p-1 text-red-600 hover:text-red-800 transition-colors"
        onClick={() => console.log(`Delete ${item.id}`)}
        title="Delete"
      >
        <Trash className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Content Management</h1>
        <Link 
          href="/admin/dashboard/content/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Content
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex space-x-2">
            <button 
              onClick={() => setContentType("all")} 
              className={`px-3 py-1 rounded-md ${contentType === "all" ? "bg-gray-200 text-gray-800" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              All
            </button>
            <button 
              onClick={() => setContentType("news")} 
              className={`px-3 py-1 rounded-md flex items-center ${contentType === "news" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <Newspaper className="h-4 w-4 mr-1" />
              News
            </button>
            <button 
              onClick={() => setContentType("team")} 
              className={`px-3 py-1 rounded-md flex items-center ${contentType === "team" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <Users className="h-4 w-4 mr-1" />
              Team
            </button>
            <button 
              onClick={() => setContentType("schedule")} 
              className={`px-3 py-1 rounded-md flex items-center ${contentType === "schedule" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Schedule
            </button>
            <button 
              onClick={() => setContentType("playlist")} 
              className={`px-3 py-1 rounded-md flex items-center ${contentType === "playlist" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              <ListMusic className="h-4 w-4 mr-1" />
              Playlists
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search content..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <DataTable
          data={filteredContent}
          columns={columns}
          searchable={false} // We're handling search manually
          searchKeys={["title", "author"]}
          actions={renderActions}
          onRowClick={(item) => console.log(`Row clicked: ${item.id}`)}
        />
      </div>
    </div>
  );
}
