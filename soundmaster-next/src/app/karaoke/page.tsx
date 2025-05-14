"use client";

import { useState, useEffect } from "react";
import { Search, Music } from "lucide-react";

interface KaraokeSong {
  id: number;
  artist: string;
  title: string;
  created_at: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function KaraokePage() {
  const [songs, setSongs] = useState<KaraokeSong[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ 
    total: 0, 
    page: 1, 
    limit: 20, 
    totalPages: 0 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch karaoke songs
  const fetchSongs = async (page = 1, query = "") => {
    setIsLoading(true);
    setError("");
    
    try {
      // Use the environment variable for API URL or fallback to relative path
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(
        `${apiUrl}/api/karaoke?page=${page}&limit=20${query ? `&query=${encodeURIComponent(query)}` : ""}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch karaoke songs");
      }

      const data = await response.json();
      setSongs(data.songs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load karaoke songs");
      console.error("Error fetching karaoke songs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSongs();
  }, []);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSongs(1, searchQuery);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    fetchSongs(newPage, searchQuery);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Karaoke Song Library</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse our extensive collection of karaoke songs. Search by artist or title to find your favorite tracks.
        </p>
      </div>

      {/* Search Form */}
      <div className="mb-8 max-w-md mx-auto">
        <form onSubmit={handleSearch} className="flex items-center">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by artist or title..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Search
          </button>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && (
        <>
          {/* Song Count */}
          <div className="mb-4 text-gray-600">
            {pagination.total} songs found {searchQuery && `for "${searchQuery}"`}
          </div>

          {/* Song List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
            {songs.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Music className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No karaoke songs found. Try a different search term.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {songs.map((song) => (
                  <li key={song.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-blue-600 truncate">{song.title}</p>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm text-gray-600 truncate">Artist: {song.artist}</p>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Available
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${pagination.page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pagination.page === page ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${pagination.page === pagination.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
