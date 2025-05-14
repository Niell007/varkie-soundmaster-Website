"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { api, type ContentItem } from "@/lib/api/client";
import { Plus, Edit, Trash, Calendar, User, Search } from "lucide-react";

interface NewsItem extends ContentItem {
  title: string;
  content: string;
  date: string;
  author: string;
  image: string;
}

export default function AdminNewsPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await api.getContent("news");
      setNewsItems(response.items as NewsItem[] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch news");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news article?")) {
      return;
    }

    try {
      setIsDeleting(id);
      await api.deleteContent("news", id);
      setNewsItems(newsItems.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete news");
      console.error(err);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredNews = newsItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">News Management</h1>
        <Link
          href="/admin/news/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add News Article
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search news articles..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No News Articles Found</h2>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? "No articles match your search criteria."
              : "Start by adding your first news article."}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredNews.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row"
            >
              <div className="relative w-full md:w-48 h-48">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="p-6 flex-1">
                <h2 className="text-xl font-bold mb-2">{item.title}</h2>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <div className="flex items-center mr-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(item.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {item.author}
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  {item.content.length > 200
                    ? `${item.content.substring(0, 200)}...`
                    : item.content}
                </p>
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/news/edit/${item.id}`}
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded flex items-center transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={isDeleting === item.id}
                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded flex items-center transition-colors"
                  >
                    {isDeleting === item.id ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-700 mr-1"></span>
                    ) : (
                      <Trash className="h-4 w-4 mr-1" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
