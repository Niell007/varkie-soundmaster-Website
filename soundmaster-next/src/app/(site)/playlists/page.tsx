"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Music, Play, ListMusic } from "lucide-react";

interface Playlist {
  id: string;
  title: string;
  description: string;
  tracks: string[];
  image: string;
}

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const response = await fetch("/api/content?type=playlists");
        
        if (!response.ok) {
          throw new Error("Failed to fetch playlists");
        }

        const data = await response.json();
        const items = data.items || [];
        setPlaylists(items);
        
        // Set the first playlist as active by default
        if (items.length > 0 && !activePlaylist) {
          setActivePlaylist(items[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Playlists</h1>
        <p className="text-gray-600">
          Discover our curated music collections
        </p>
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
      ) : playlists.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Playlists Available</h2>
          <p className="text-gray-600">
            Check back later for our curated playlists.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Playlist selector */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4">Our Playlists</h2>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="space-y-1 p-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => setActivePlaylist(playlist)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${
                      activePlaylist?.id === playlist.id
                        ? "bg-blue-100 text-blue-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <ListMusic className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="font-medium">{playlist.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Playlist details */}
          <div className="lg:col-span-2">
            {activePlaylist && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="relative h-64">
                  <Image
                    src={activePlaylist.image}
                    alt={activePlaylist.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-6 text-white">
                      <h2 className="text-2xl font-bold mb-2">{activePlaylist.title}</h2>
                      <p>{activePlaylist.description}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <Music className="h-5 w-5 mr-2" />
                    Tracks
                  </h3>
                  <div className="space-y-3">
                    {activePlaylist.tracks.map((track, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <span className="w-8 text-center text-gray-500">{index + 1}</span>
                          <span>{track}</span>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 transition-colors">
                          <Play className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
