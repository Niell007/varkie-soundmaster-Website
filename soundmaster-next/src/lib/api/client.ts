"use client";

// API client for the Soundmaster application
// This provides a consistent interface for making API requests

// Types
interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

interface ApiResponse<T> {
  items?: T[];
  message?: string;
  id?: string;
}

interface DashboardStats {
  news: number;
  media: number;
  team: number;
  schedules: number;
  playlists: number;
}

interface ContentItem {
  id: string;
  [key: string]: any;
}

interface MediaItem {
  id: string;
  name: string;
  type: string;
  url: string;
  thumbnail: string;
  uploadedAt: string;
  size: string;
  duration?: string;
}

// API client class
class ApiClient {
  private token: string | null = null;
  private baseUrl: string = "";

  constructor() {
    // Set base URL based on environment
    this.baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    
    // Try to get token from localStorage
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("adminToken");
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data: LoginResponse = await response.json();
    this.token = data.token;
    
    // Store token in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("adminToken", data.token);
    }
    
    return data.token;
  }

  logout(): void {
    this.token = null;
    
    // Remove token from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken");
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Helper method for making authenticated requests
  private async request<T>(
    url: string,
    method: string = "GET",
    body?: any
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${url}`, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "API request failed");
    }

    return await response.json();
  }

  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>("/api/dashboard/stats");
  }

  // Content methods
  async getContent(
    type: string,
    options: { [key: string]: any } = {}
  ): Promise<ApiResponse<ContentItem>> {
    const queryParams = new URLSearchParams({ type, ...options }).toString();
    return this.request<ApiResponse<ContentItem>>(`/api/content?${queryParams}`);
  }

  async createContent(
    type: string,
    item: Omit<ContentItem, "id">
  ): Promise<ApiResponse<ContentItem>> {
    return this.request<ApiResponse<ContentItem>>(
      "/api/content",
      "POST",
      { type, item }
    );
  }

  async updateContent(
    type: string,
    id: string,
    item: Partial<ContentItem>
  ): Promise<ApiResponse<ContentItem>> {
    return this.request<ApiResponse<ContentItem>>(
      "/api/content",
      "PUT",
      { type, id, item }
    );
  }

  async deleteContent(
    type: string,
    id: string
  ): Promise<ApiResponse<ContentItem>> {
    return this.request<ApiResponse<ContentItem>>(
      `/api/content?type=${type}&id=${id}`,
      "DELETE"
    );
  }

  // Media methods
  async getMedia(
    options: { [key: string]: any } = {}
  ): Promise<ApiResponse<MediaItem>> {
    const queryParams = new URLSearchParams(options).toString();
    return this.request<ApiResponse<MediaItem>>(
      `/api/media${queryParams ? `?${queryParams}` : ""}`
    );
  }

  async uploadMedia(
    file: File,
    metadata: { [key: string]: any } = {}
  ): Promise<ApiResponse<MediaItem>> {
    // In a real app, this would use FormData to upload the file
    // For now, we'll just simulate the upload
    return this.request<ApiResponse<MediaItem>>(
      "/api/media",
      "POST",
      { name: file.name, size: file.size, type: file.type, ...metadata }
    );
  }

  async deleteMedia(id: string): Promise<ApiResponse<MediaItem>> {
    return this.request<ApiResponse<MediaItem>>(
      `/api/media?id=${id}`,
      "DELETE"
    );
  }
}

// Create and export a singleton instance
export const api = new ApiClient();

// Export types
export type {
  LoginCredentials,
  LoginResponse,
  ApiResponse,
  DashboardStats,
  ContentItem,
  MediaItem,
};
