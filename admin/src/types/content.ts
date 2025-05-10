// Content management types for Soundmaster Admin Dashboard
export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string; // Format: "MM:SS"
  mediaId?: string; // Reference to media file in storage
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverImage?: string; // Reference to image in storage
  tracks: Track[];
  duration: string; // Total duration, format: "H:MM:SS"
  trackCount: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  days: string[]; // Array of days: ["Monday", "Tuesday", etc.]
  playlistId?: string;
  hostId?: string;
  color?: string; // CSS color for display
  createdAt: string;
  updatedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary?: string;
  image?: string;
  publishDate: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  template: string;
  metaDescription?: string;
  publishedAt: string;
  lastModified: string;
}

// Request and response types for content API
export interface PlaylistRequest {
  title: string;
  description: string;
  coverImage?: string;
  tracks: Omit<Track, 'id'>[];
  featured?: boolean;
}

export interface PlaylistResponse extends Playlist {
  success: boolean;
  message?: string;
}

export interface ScheduleItemRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  days: string[];
  playlistId?: string;
  hostId?: string;
  color?: string;
}

export interface ScheduleItemResponse extends ScheduleItem {
  success: boolean;
  message?: string;
}

export interface NewsItemRequest {
  title: string;
  content: string;
  summary?: string;
  image?: string;
  publishDate: string;
  featured?: boolean;
}

export interface NewsItemResponse extends NewsItem {
  success: boolean;
  message?: string;
}

export interface PageContentRequest {
  slug: string;
  title: string;
  content: string;
  template: string;
  metaDescription?: string;
  publishedAt?: string;
}

export interface PageContentResponse extends PageContent {
  success: boolean;
  message?: string;
}
