"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Mail, Linkedin, Twitter } from "lucide-react";

interface TeamMember {
  id: string;
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

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch("/api/content?type=team");
        
        if (!response.ok) {
          throw new Error("Failed to fetch team members");
        }

        const data = await response.json();
        setTeamMembers(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Our Team</h1>
        <p className="text-gray-600">
          Meet the voices and personalities behind Soundmaster Radio
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No Team Members Available</h2>
          <p className="text-gray-600">
            Check back later for updates on our team.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-xl shadow-md overflow-hidden"
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
                <p className="text-gray-600 mb-4">{member.bio}</p>
                
                <div className="flex space-x-3">
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
