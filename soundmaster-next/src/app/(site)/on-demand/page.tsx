"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Pause, Clock, Calendar, Search, Filter } from "lucide-react";

interface MediaItem {
  id: string;
  name: string;
  type: string;
  url: string;
  thumbnail: string;
  duration?: string;
  uploadedAt: string;
  description?: string;
  category?: string;
}

export default function OnDemandPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const categories = ["all", "interviews", "shows", "music", "news"];

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await fetch("/api/media?type=audio");
        
        if (!response.ok) {
          throw new Error("Failed to fetch on-demand content");
        }

        const data = await response.json();
        setMediaItems(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  // Filter media items based on search query and active category
  const filteredMedia = mediaItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === "all" || 
                           (item.category && item.category.toLowerCase() === activeCategory);
    
    return matchesSearch && matchesCategory;
  });

  const togglePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">On-Demand Content</h1>
        <p className="text-gray-600">
          Listen to your favorite shows and interviews anytime
        </p>
      </div>

      {/* Search and filter */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search on-demand content..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <Filter className="text-gray-400 h-5 w-5 mr-2" />
            <select
              className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Content Found</h2>
          <p className="text-gray-600">
            {searchQuery || activeCategory !== "all"
              ? "No content matches your search criteria. Try adjusting your filters."
              : "Check back later for on-demand content."}
          </p>
          {(searchQuery || activeCategory !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                <Image
                  src={item.thumbnail}
                  alt={item.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
                <button
                  onClick={() => togglePlay(item.id)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
                >
                  <div className="bg-white rounded-full p-3">
                    {playingId === item.id ? (
                      <Pause className="h-8 w-8 text-blue-600" />
                    ) : (
                      <Play className="h-8 w-8 text-blue-600" />
                    )}
                  </div>
                </button>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{item.name}</h2>
                {item.description && (
                  <p className="text-gray-600 mb-4">
                    {item.description.length > 100
                      ? `${item.description.substring(0, 100)}...`
                      : item.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                  {item.duration && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {item.duration}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(item.uploadedAt).toLocaleDateString()}
                  </div>
                  {item.category && (
                    <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {item.category}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
