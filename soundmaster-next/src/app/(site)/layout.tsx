"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideRadio } from "lucide-react";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? "bg-blue-700" : "";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-800 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <LucideRadio className="h-8 w-8 mr-2" />
              <h1 className="text-2xl font-bold">Soundmaster</h1>
            </div>
            <nav>
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Link
                    href="/"
                    className={`px-4 py-2 rounded hover:bg-blue-700 transition-colors ${isActive(
                      "/"
                    )}`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/news"
                    className={`px-4 py-2 rounded hover:bg-blue-700 transition-colors ${isActive(
                      "/news"
                    )}`}
                  >
                    News
                  </Link>
                </li>
                <li>
                  <Link
                    href="/team"
                    className={`px-4 py-2 rounded hover:bg-blue-700 transition-colors ${isActive(
                      "/team"
                    )}`}
                  >
                    Team
                  </Link>
                </li>
                <li>
                  <Link
                    href="/schedule"
                    className={`px-4 py-2 rounded hover:bg-blue-700 transition-colors ${isActive(
                      "/schedule"
                    )}`}
                  >
                    Schedule
                  </Link>
                </li>
                <li>
                  <Link
                    href="/playlists"
                    className={`px-4 py-2 rounded hover:bg-blue-700 transition-colors ${isActive(
                      "/playlists"
                    )}`}
                  >
                    Playlists
                  </Link>
                </li>
                <li>
                  <Link
                    href="/on-demand"
                    className={`px-4 py-2 rounded hover:bg-blue-700 transition-colors ${isActive(
                      "/on-demand"
                    )}`}
                  >
                    On Demand
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className={`px-4 py-2 rounded hover:bg-blue-700 transition-colors ${isActive(
                      "/contact"
                    )}`}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Soundmaster Radio</h3>
              <p>Your premier source for music, news, and entertainment.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="hover:text-blue-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/news" className="hover:text-blue-400 transition-colors">
                    News
                  </Link>
                </li>
                <li>
                  <Link href="/team" className="hover:text-blue-400 transition-colors">
                    Team
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-blue-400 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Facebook
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Twitter
                </a>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Instagram
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p>&copy; {new Date().getFullYear()} Soundmaster Radio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
