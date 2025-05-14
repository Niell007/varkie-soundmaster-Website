"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { ArrowLeft, Save, Image as ImageIcon, Mail, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

export default function NewTeamMemberPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    bio: "",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80",
    social: {
      email: "",
      linkedin: "",
      twitter: ""
    }
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.startsWith("social.")) {
      const socialField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        social: {
          ...prev.social,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Clean up social object to remove empty values
      const social = Object.entries(formData.social).reduce((acc, [key, value]) => {
        if (value) {
          acc[key as keyof typeof formData.social] = value;
        }
        return acc;
      }, {} as typeof formData.social);

      const teamMember = {
        ...formData,
        social: Object.keys(social).length > 0 ? social : undefined
      };

      await api.createContent("team", teamMember);
      router.push("/admin/team");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team member");
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link
          href="/admin/team"
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">Add Team Member</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-gray-700 font-medium mb-2">
                Position
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="mb-6">
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
              Enter a URL for the team member's photo (e.g., from Unsplash)
            </p>
          </div>

          <div className="mb-6">
            <label htmlFor="bio" className="block text-gray-700 font-medium mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Social Media</h3>
            <div className="space-y-4">
              <div className="flex">
                <div className="bg-gray-100 border border-r-0 rounded-l-lg px-4 flex items-center">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  id="social-email"
                  name="social.email"
                  value={formData.social.email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className="w-full px-4 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex">
                <div className="bg-gray-100 border border-r-0 rounded-l-lg px-4 flex items-center">
                  <Linkedin className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="url"
                  id="social-linkedin"
                  name="social.linkedin"
                  value={formData.social.linkedin}
                  onChange={handleChange}
                  placeholder="LinkedIn URL"
                  className="w-full px-4 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex">
                <div className="bg-gray-100 border border-r-0 rounded-l-lg px-4 flex items-center">
                  <Twitter className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="url"
                  id="social-twitter"
                  name="social.twitter"
                  value={formData.social.twitter}
                  onChange={handleChange}
                  placeholder="Twitter URL"
                  className="w-full px-4 py-2 border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              href="/admin/team"
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
              {isSubmitting ? "Saving..." : "Save Team Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
