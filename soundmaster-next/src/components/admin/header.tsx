"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Bell, ChevronDown, User, LogOut, Settings } from "lucide-react";

interface AdminHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

// Define the expected user session type for type safety

export function AdminHeader({ user }: AdminHeaderProps) {
  const { data: session } = useSession();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Use the user prop if provided, otherwise use the session user
  const currentUser = user || session?.user;
  const userName = currentUser?.name || "Admin User";
  const userRole = currentUser?.role || "admin";
  
  // Ensure we have a valid image URL, using a default if not provided
  const userImage = (currentUser as { image?: string | null })?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=1760&q=80";

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/admin" });
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex justify-between items-center px-6 py-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Soundmaster Admin</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Bell className="h-5 w-5 text-gray-600" />
          </button>
          
          <div className="relative">
            <button 
              onClick={toggleUserMenu}
              className="flex items-center space-x-3 focus:outline-none"
            >
              <div className="relative h-8 w-8 rounded-full overflow-hidden border border-gray-200">
                <Image
                  src={userImage}
                  alt={userName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-700">{userName}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                </div>
                <a 
                  href="/admin/dashboard/profile" 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  Profile
                </a>
                <a 
                  href="/admin/settings" 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="h-4 w-4 mr-2 text-gray-500" />
                  Settings
                </a>
                <button 
                  onClick={handleSignOut}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-2 text-red-500" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
