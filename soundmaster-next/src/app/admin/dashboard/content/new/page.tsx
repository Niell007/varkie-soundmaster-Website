"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ContentForm } from "@/components/admin/content-form";
import { MediaUploader } from "@/components/admin/media-uploader";
import { ArrowLeft, Save } from "lucide-react";

type ContentType = "news" | "team" | "schedule" | "playlist";

interface ContentFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  type: ContentType;
  publishDate: string;
  status: "draft" | "published";
  featuredImage?: File | null;
  metaTitle?: string;
  metaDescription?: string;
}

export default function NewContentPage() {
  const router = useRouter();
  const [contentType, setContentType] = useState<ContentType>("news");
  const [formData, setFormData] = useState<ContentFormData>({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    type: "news",
    publishDate: new Date().toISOString().split("T")[0],
    status: "draft",
    featuredImage: null,
    metaTitle: "",
    metaDescription: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-generate slug from title if slug is empty
    if (name === "title" && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
      }));
    }
    
    // Update content type if type changes
    if (name === "type") {
      setContentType(value as ContentType);
    }
  };
  
  // Handle media upload
  const handleMediaUpload = (files: File[]) => {
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        featuredImage: files[0]
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real application, this would send the data to an API
      console.log("Submitting content:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect back to content list
      router.push("/admin/dashboard/content");
    } catch (error) {
      console.error("Error submitting content:", error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Link 
            href="/admin/dashboard/content" 
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">Create New Content</h1>
        </div>
        
        <button 
          type="submit"
          form="content-form"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Saving..." : "Save Content"}
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200 p-4">
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setContentType("news")}
              className={`px-4 py-2 rounded-md ${contentType === "news" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              News Article
            </button>
            <button
              type="button"
              onClick={() => setContentType("team")}
              className={`px-4 py-2 rounded-md ${contentType === "team" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Team Member
            </button>
            <button
              type="button"
              onClick={() => setContentType("schedule")}
              className={`px-4 py-2 rounded-md ${contentType === "schedule" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Schedule Event
            </button>
            <button
              type="button"
              onClick={() => setContentType("playlist")}
              className={`px-4 py-2 rounded-md ${contentType === "playlist" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Playlist
            </button>
          </div>
        </div>
        
        <form id="content-form" onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                />
              </div>
              
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    /
                  </span>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="block w-full border-gray-300 rounded-none rounded-r-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={12}
                  value={formData.content}
                  onChange={handleChange}
                  required
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                />
              </div>
              
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  rows={3}
                  value={formData.excerpt}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                />
                <p className="mt-1 text-sm text-gray-500">A short summary of the content. Used in listings and social media.</p>
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {showAdvanced ? "Hide" : "Show"} Advanced Options
                </button>
                
                {showAdvanced && (
                  <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                    <div>
                      <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Title
                      </label>
                      <input
                        type="text"
                        id="metaTitle"
                        name="metaTitle"
                        value={formData.metaTitle}
                        onChange={handleChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Meta Description
                      </label>
                      <textarea
                        id="metaDescription"
                        name="metaDescription"
                        rows={2}
                        value={formData.metaDescription}
                        onChange={handleChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                >
                  <option value="news">News Article</option>
                  <option value="team">Team Member</option>
                  <option value="schedule">Schedule Event</option>
                  <option value="playlist">Playlist</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Publish Date
                </label>
                <input
                  type="date"
                  id="publishDate"
                  name="publishDate"
                  value={formData.publishDate}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image
                </label>
                <MediaUploader 
                  onUpload={handleMediaUpload} 
                  maxFiles={1} 
                  acceptedFileTypes="image/*"
                />
                {formData.featuredImage && (
                  <div className="mt-2 text-sm text-gray-500">
                    Selected: {formData.featuredImage.name}
                  </div>
                )}
              </div>
              
              {contentType === "team" && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Team Member Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {contentType === "schedule" && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Event Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Event Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        id="eventDate"
                        name="eventDate"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {contentType === "playlist" && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Playlist Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="trackCount" className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Tracks
                      </label>
                      <input
                        type="number"
                        id="trackCount"
                        name="trackCount"
                        min="1"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                        Total Duration (minutes)
                      </label>
                      <input
                        type="number"
                        id="duration"
                        name="duration"
                        min="1"
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
