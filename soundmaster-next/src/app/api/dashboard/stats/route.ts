import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { getAuthCookieFromRequest, verifyToken } from "@/lib/auth";

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

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    // Initialize database connection
    const db = Database.getInstance();
    await db.connect(null); // In production, we'd pass the D1 instance here
    
    // Get dashboard stats from the database
    const stats = await db.getDashboardStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { message: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
