"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { api, type ContentItem } from "@/lib/api/client";
import { Plus, Edit, Trash, Search, Mail, Linkedin, Twitter } from "lucide-react";

interface TeamMember extends ContentItem {
  name: string;
  position: string;
  bio: string;
  image: string;
  social?: {
    email?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export default function AdminTeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const response = await api.getContent("team");
      setTeamMembers(response.items as TeamMember[] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch team members");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) {
      return;
    }

    try {
      setIsDeleting(id);
      await api.deleteContent("team", id);
      setTeamMembers(teamMembers.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete team member");
      console.error(err);
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredTeamMembers = teamMembers.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Team Management</h1>
        <Link
          href="/admin/team/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Team Member
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search team members..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredTeamMembers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Team Members Found</h2>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? "No team members match your search criteria."
              : "Start by adding your first team member."}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-64">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-1">{member.name}</h2>
                <p className="text-blue-600 font-medium mb-4">{member.position}</p>
                <p className="text-gray-600 mb-4">
                  {member.bio.length > 150
                    ? `${member.bio.substring(0, 150)}...`
                    : member.bio}
                </p>
                
                <div className="flex space-x-3 mb-4">
                  {member.social?.email && (
                    <a
                      href={`mailto:${member.social.email}`}
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                      aria-label={`Email ${member.name}`}
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                  )}
                  {member.social?.linkedin && (
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                      aria-label={`LinkedIn profile of ${member.name}`}
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {member.social?.twitter && (
                    <a
                      href={member.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-blue-600 transition-colors"
                      aria-label={`Twitter profile of ${member.name}`}
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/team/edit/${member.id}`}
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded flex items-center transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(member.id)}
                    disabled={isDeleting === member.id}
                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded flex items-center transition-colors"
                  >
                    {isDeleting === member.id ? (
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-700 mr-1"></span>
                    ) : (
                      <Trash className="h-4 w-4 mr-1" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
