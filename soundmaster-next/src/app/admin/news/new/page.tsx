"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { ArrowLeft, Save, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function NewNewsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: "",
    image: "https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Add current date to the form data
      const newsItem = {
        ...formData,
        date: new Date().toISOString().split("T")[0]
      };

      await api.createContent("news", newsItem);
      router.push("/admin/news");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create news article");
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link
          href="/admin/news"
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">Add News Article</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="author" className="block text-gray-700 font-medium mb-2">
              Author
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="image" className="block text-gray-700 font-medium mb-2">
              Image URL
            </label>
            <div className="flex">
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="bg-gray-100 border border-l-0 rounded-r-lg px-4 flex items-center">
                <ImageIcon className="h-5 w-5 text-gray-500" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Enter a URL for the article image (e.g., from Unsplash)
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={8}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>

          <div className="flex justify-end">
            <Link
              href="/admin/news"
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg mr-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              {isSubmitting ? (
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              {isSubmitting ? "Saving..." : "Save Article"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
