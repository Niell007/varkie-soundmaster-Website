import { NextRequest, NextResponse } from "next/server";
import { Database } from "@/lib/db";

export const runtime = "edge";

// GET endpoint to retrieve karaoke songs with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    
    // Initialize database connection
    const db = Database.getInstance();
    await db.connect(null); // In production, we'd pass the D1 instance here
    
    // Query the database for karaoke songs
    let songs;
    let total;
    
    if (query) {
      // Search by artist or title
      songs = await db.searchKaraokeSongs(query, limit, offset);
      total = await db.countKaraokeSongs(query);
    } else {
      // Get all songs with pagination
      songs = await db.getKaraokeSongs(limit, offset);
      total = await db.countKaraokeSongs();
    }
    
    return NextResponse.json({
      songs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching karaoke songs:", error);
    return NextResponse.json(
      { message: "Failed to fetch karaoke songs" },
      { status: 500 }
    );
  }
}

// POST endpoint to add a new karaoke song
export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as { artist?: string; title?: string };
    const artist = data.artist || '';
    const title = data.title || '';
    
    if (!artist || !title) {
      return NextResponse.json(
        { message: "Artist and title are required" },
        { status: 400 }
      );
    }
    
    // Initialize database connection
    const db = Database.getInstance();
    await db.connect(null); // In production, we'd pass the D1 instance here
    
    // Add the new song
    const result = await db.addKaraokeSong(artist, title);
    
    return NextResponse.json({
      message: "Karaoke song added successfully",
      songId: result
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding karaoke song:", error);
    return NextResponse.json(
      { message: "Failed to add karaoke song" },
      { status: 500 }
    );
  }
}
