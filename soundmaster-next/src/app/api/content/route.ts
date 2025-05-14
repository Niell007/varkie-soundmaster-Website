import { NextRequest, NextResponse } from "next/server";
import { Database, NewsArticle, TeamMember } from "@/lib/db";
import { getAuthCookieFromRequest, verifyToken } from "@/lib/auth";

// Define content item interface
interface ContentItem {
  title: string;
  content?: string;
  image?: string;
  position?: string;
  bio?: string;
  socialLinks?: Record<string, string>;
  [key: string]: unknown;
}

// Mock database data (in a real app, this would come from a database)
const mockContent = {
  news: [
    {
      id: "1",
      title: "New Music Director Joins Soundmaster",
      content: "We're excited to announce that Jane Smith has joined our team as the new Music Director.",
      date: "2025-05-01",
      author: "Admin",
      image: "https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: "2",
      title: "Summer Concert Series Announced",
      content: "Join us for our summer concert series featuring local artists every Friday night.",
      date: "2025-04-15",
      author: "Admin",
      image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    }
  ],
  team: [
    {
      id: "1",
      name: "John Doe",
      position: "Station Manager",
      bio: "John has been with Soundmaster for over 10 years and brings a wealth of experience in radio broadcasting.",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
    },
    {
      id: "2",
      name: "Jane Smith",
      position: "Music Director",
      bio: "Jane is a music industry veteran with a passion for discovering new talent.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=688&q=80"
    }
  ],
  schedules: [
    {
      id: "1",
      title: "Morning Show",
      host: "John Doe",
      time: "6:00 AM - 10:00 AM",
      days: "Monday-Friday",
      description: "Start your day with the latest hits and news."
    },
    {
      id: "2",
      title: "Afternoon Drive",
      host: "Jane Smith",
      time: "3:00 PM - 7:00 PM",
      days: "Monday-Friday",
      description: "The perfect mix to get you through your commute."
    }
  ],
  playlists: [
    {
      id: "1",
      title: "Top 40 Hits",
      description: "The most popular songs of the week.",
      tracks: [
        "Track 1 - Artist 1",
        "Track 2 - Artist 2",
        "Track 3 - Artist 3"
      ],
      image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
    },
    {
      id: "2",
      title: "Throwback Thursday",
      description: "Classic hits from the 80s, 90s, and 2000s.",
      tracks: [
        "Track 4 - Artist 4",
        "Track 5 - Artist 5",
        "Track 6 - Artist 6"
      ],
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
    }
  ]
};

export const runtime = "edge";

// Helper function to verify auth from request
function isAuthenticated(request: NextRequest): boolean {
  // Try to get token from auth header first
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    return verifyToken(token) !== null;
  }
  
  // Try to get token from cookie
  const token = getAuthCookieFromRequest(request);
  if (token) {
    return verifyToken(token) !== null;
  }
  
  return false;
}

export async function GET(request: NextRequest) {
  try {
    // Get content type from the URL
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    
    // Check if content type is valid
    const validContentTypes = ["news", "team", "schedules", "playlists"];
    if (!contentType || !validContentTypes.includes(contentType)) {
      return NextResponse.json(
        { message: "Invalid content type" },
        { status: 400 }
      );
    }

    // Initialize database connection
    const db = Database.getInstance();
    await db.connect(null); // In production, we'd pass the D1 instance here
    
    // Fetch content based on the type
    let items = [];
    
    if (contentType === "news") {
      items = await db.getNewsArticles(limit, offset);
    } else if (contentType === "team") {
      items = await db.getTeamMembers();
    } else {
      // For other content types, use mock data for now
      items = mockContent[contentType as keyof typeof mockContent];
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Content fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get content data from request
    const data = await request.json() as { type: string; item: ContentItem };
    const { type, item } = data;
    
    // Check if content type is valid
    const validContentTypes = ["news", "team", "schedules", "playlists"];
    if (!type || !validContentTypes.includes(type)) {
      return NextResponse.json(
        { message: "Invalid content type" },
        { status: 400 }
      );
    }

    // Initialize database connection
    const db = Database.getInstance();
    await db.connect(null); // In production, we'd pass the D1 instance here
    
    // Process based on content type
    let result;
    
    if (type === "news") {
      // Create a news article
      const article = {
        title: item.title,
        content: item.content || '',
        image_url: item.image || '',
        published_at: new Date().toISOString(),
        author_id: 1 // Default to admin user for now
      };
      
      result = await db.createNewsArticle(article);
      return NextResponse.json({
        message: "News article created successfully",
        success: result > 0
      });
    } else if (type === "team") {
      // Create a team member
      const member = {
        name: item.title, // Using title as name for consistency
        role: item.position || '',
        bio: item.bio || '',
        image_url: item.image || '',
        social_links: item.socialLinks ? JSON.stringify(item.socialLinks) : ''
      };
      
      result = await db.createTeamMember(member);
      return NextResponse.json({
        message: "Team member created successfully",
        success: result > 0
      });
    } else {
      // For other content types, just return success for now
      return NextResponse.json({
        message: `${type} item created successfully`,
        id: Date.now().toString() // Mock ID generation
      });
    }
  } catch (error) {
    console.error("Content creation error:", error);
    return NextResponse.json(
      { message: "Failed to create content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get content data from request
    const data = await request.json() as { type: string; id: number; item: ContentItem };
    const { type, id, item } = data;
    
    // Check if content type is valid
    const validContentTypes = ["news", "team", "schedules", "playlists"];
    if (!type || !validContentTypes.includes(type)) {
      return NextResponse.json(
        { message: "Invalid content type" },
        { status: 400 }
      );
    }

    // Initialize database connection
    const db = Database.getInstance();
    await db.connect(null); // In production, we'd pass the D1 instance here
    
    // Process based on content type
    let result;
    
    if (type === "news") {
      // Update a news article
      const article: Partial<NewsArticle> = {
        title: item.title,
        content: item.content || '',
        image_url: item.image || '',
        // Don't update published_at or author_id
      };
      
      result = await db.updateNewsArticle(id, article);
      return NextResponse.json({
        message: "News article updated successfully",
        success: result > 0
      });
    } else if (type === "team") {
      // Update a team member
      const member: Partial<TeamMember> = {
        name: item.title, // Using title as name for consistency
        role: item.position || '',
        bio: item.bio || '',
        image_url: item.image || '',
        social_links: item.socialLinks ? JSON.stringify(item.socialLinks) : ''
      };
      
      result = await db.updateTeamMember(id, member);
      return NextResponse.json({
        message: "Team member updated successfully",
        success: result > 0
      });
    } else {
      // For other content types, just return success for now
      return NextResponse.json({
        message: `${type} item updated successfully`
      });
    }
  } catch (error) {
    console.error("Content update error:", error);
    return NextResponse.json(
      { message: "Failed to update content" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get content data from request
    const data = await request.json() as { type: string; id: number };
    const { type, id } = data;
    
    // Check if content type is valid
    const validContentTypes = ["news", "team", "schedules", "playlists"];
    if (!type || !validContentTypes.includes(type)) {
      return NextResponse.json(
        { message: "Invalid content type" },
        { status: 400 }
      );
    }

    // Initialize database connection
    const db = Database.getInstance();
    await db.connect(null); // In production, we'd pass the D1 instance here
    
    // Process based on content type
    let result;
    
    if (type === "news") {
      // Delete a news article
      result = await db.deleteNewsArticle(id);
      return NextResponse.json({
        message: "News article deleted successfully",
        success: result > 0
      });
    } else if (type === "team") {
      // Delete a team member
      result = await db.deleteTeamMember(id);
      return NextResponse.json({
        message: "Team member deleted successfully",
        success: result > 0
      });
    } else {
      // For other content types, just return success for now
      return NextResponse.json({
        message: `${type} item deleted successfully`
      });
    }
  } catch (error) {
    console.error("Content deletion error:", error);
    return NextResponse.json(
      { message: "Failed to delete content" },
      { status: 500 }
    );
  }
}
