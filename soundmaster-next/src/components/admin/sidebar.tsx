"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LucideRadio,
  LayoutDashboard,
  Newspaper,
  Image,
  Users,
  Calendar,
  ListMusic,
  Settings,
  FileText,
  Search,
  Paintbrush
} from "lucide-react";

// Simple utility function to combine class names
const cn = (...classes: (string | boolean | undefined | null)[]) => {
  return classes.filter(Boolean).join(' ');
};

type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
};

const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["admin", "editor"]
  },
  {
    title: "Content",
    href: "/admin/dashboard/content",
    icon: <FileText className="h-5 w-5" />,
    roles: ["admin", "editor"]
  },
  {
    title: "News",
    href: "/admin/news",
    icon: <Newspaper className="h-5 w-5" />,
    roles: ["admin", "editor"]
  },
  {
    title: "Media Library",
    href: "/admin/media-library",
    icon: <Image className="h-5 w-5" />,
    roles: ["admin", "editor"]
  },
  {
    title: "Team",
    href: "/admin/team",
    icon: <Users className="h-5 w-5" />,
    roles: ["admin", "editor"]
  },
  {
    title: "Schedule",
    href: "/admin/schedule",
    icon: <Calendar className="h-5 w-5" />,
    roles: ["admin", "editor"]
  },
  {
    title: "Playlists",
    href: "/admin/playlists",
    icon: <ListMusic className="h-5 w-5" />,
    roles: ["admin", "editor"]
  },
  {
    title: "SEO",
    href: "/admin/dashboard/seo",
    icon: <Search className="h-5 w-5" />,
    roles: ["admin", "editor"]
  },
  {
    title: "Frontend Editor",
    href: "/admin/dashboard/editor",
    icon: <Paintbrush className="h-5 w-5" />,
    roles: ["admin"]
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
    roles: ["admin"]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role || "editor";

  // Filter nav items based on user role
  const filteredNavItems = adminNavItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-blue-800 text-white h-screen sticky top-0 overflow-y-auto">
      <div className="p-4 flex items-center">
        <LucideRadio className="h-8 w-8 mr-2" />
        <h1 className="text-xl font-bold">Soundmaster Admin</h1>
      </div>
      <nav className="mt-8">
        <ul className="space-y-2 px-4">
          {filteredNavItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 rounded hover:bg-blue-700 transition-colors",
                  (pathname === item.href || pathname?.startsWith(`${item.href}/`)) && "bg-blue-700"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
