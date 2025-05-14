import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/lib/db";
import { generateToken, setAuthCookieInResponse } from "@/lib/auth";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { username: string; password: string };
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    // Initialize database connection
    const db = Database.getInstance();
    await db.connect(null); // In production, we'd pass the D1 instance here
    
    // Query the database for the user
    const user = await db.getUserByUsername(username);

    // Check if user exists and password matches
    // In a real application, we would use a proper password hashing library
    if (!user || user.password_hash !== password) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Generate token using our simplified auth solution
    const token = generateToken({
      username: user.username,
      role: user.role,
      userId: user.id
    });

    // Create the response with the token
    const response = NextResponse.json({ token, success: true });
    
    // Set the auth cookie in the response
    return setAuthCookieInResponse(response, token);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 500 }
    );
  }
}
