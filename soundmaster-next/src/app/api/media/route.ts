import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Secret key for JWT verification
const JWT_SECRET = "soundmaster-jwt-secret-2025";

// Mock database data (in a real app, this would come from a database)
const mockMedia = [
  {
    id: "1",
    name: "Interview with Local Artist",
    type: "audio",
    url: "/media/interview.mp3",
    thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80",
    duration: "24:15",
    uploadedAt: "2025-04-10",
    size: "12.4 MB"
  },
  {
    id: "2",
    name: "Summer Festival Promo",
    type: "video",
    url: "/media/summer-festival.mp4",
    thumbnail: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    duration: "01:30",
    uploadedAt: "2025-05-01",
    size: "45.8 MB"
  },
  {
    id: "3",
    name: "Station Logo",
    type: "image",
    url: "/media/logo.png",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    uploadedAt: "2025-01-15",
    size: "2.1 MB"
  }
];

export const runtime = "edge";

// Helper function to verify JWT token
function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.split(" ")[1];
  
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (error) {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    
    // Filter media by type if specified
    let filteredMedia = mockMedia;
    if (type) {
      filteredMedia = mockMedia.filter(item => item.type === type);
    }

    // Return the media items
    return NextResponse.json({
      items: filteredMedia
    });
  } catch (error) {
    console.error("Media fetch error:", error);
    return NextResponse.json(
      { message: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!verifyToken(authHeader)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // In a real app, this would handle file upload
    // For now, we'll just return a success message
    return NextResponse.json({
      message: "Media uploaded successfully",
      id: Date.now().toString() // Mock ID generation
    });
  } catch (error) {
    console.error("Media upload error:", error);
    return NextResponse.json(
      { message: "Failed to upload media" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization");
    if (!verifyToken(authHeader)) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get media ID from request
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    // Check if ID is provided
    if (!id) {
      return NextResponse.json(
        { message: "Media ID is required" },
        { status: 400 }
      );
    }

    // In a real app, this would delete the media from storage
    // For now, we'll just return a success message
    return NextResponse.json({
      message: "Media deleted successfully"
    });
  } catch (error) {
    console.error("Media deletion error:", error);
    return NextResponse.json(
      { message: "Failed to delete media" },
      { status: 500 }
    );
  }
}
