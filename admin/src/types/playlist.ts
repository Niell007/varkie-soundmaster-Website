/**
 * Playlist interface for playlist management
 */
export interface Playlist {
  /**
   * Unique identifier for the playlist
   */
  id: string;
  
  /**
   * Playlist title
   */
  title: string;
  
  /**
   * Playlist description
   */
  description: string;
  
  /**
   * Number of tracks in the playlist
   */
  track_count: number;
  
  /**
   * Duration of the playlist in format "HH:MM:SS"
   */
  duration: string;
  
  /**
   * Whether the playlist is featured on the homepage
   */
  featured: boolean;
  
  /**
   * When the playlist was created
   */
  created_at: string;
  
  /**
   * When the playlist was last updated
   */
  updated_at: string;
}
