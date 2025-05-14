import Image from "next/image";
import Link from "next/link";
import { Play, Calendar, Users, Radio } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-[500px] rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80 z-10" />
        <Image
          src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="Radio studio"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="relative z-20 h-full flex flex-col justify-center items-center text-center text-white p-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Soundmaster Radio
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mb-8">
            Your premier source for music, news, and entertainment.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/schedule"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium flex items-center transition-colors"
            >
              <Calendar className="mr-2 h-5 w-5" />
              View Schedule
            </Link>
            <Link
              href="/on-demand"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-medium flex items-center transition-colors"
            >
              <Play className="mr-2 h-5 w-5" />
              Listen On-Demand
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section>
        <h2 className="text-3xl font-bold mb-8">Featured Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="relative h-48">
              <Image
                src="https://images.unsplash.com/photo-1567596388756-f6d710c8fc07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                alt="Latest news"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Latest News</h3>
              <p className="text-gray-600 mb-4">
                Stay updated with the latest music industry news and events.
              </p>
              <Link
                href="/news"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Read More →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="relative h-48">
              <Image
                src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                alt="Weekly playlists"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Weekly Playlists</h3>
              <p className="text-gray-600 mb-4">
                Discover our curated playlists updated every week.
              </p>
              <Link
                href="/playlists"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Explore Playlists →
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="relative h-48">
              <Image
                src="https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80"
                alt="Meet the team"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Meet The Team</h3>
              <p className="text-gray-600 mb-4">
                Get to know the voices and personalities behind Soundmaster.
              </p>
              <Link
                href="/team"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Meet Our Team →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Why Choose Soundmaster
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Radio className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Quality Programming</h3>
            <p className="text-gray-600">
              Professionally curated content that entertains and informs.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">On-Demand Access</h3>
            <p className="text-gray-600">
              Listen to your favorite shows anytime, anywhere.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Community Focus</h3>
            <p className="text-gray-600">
              Connecting listeners and creating a vibrant community.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-800 text-white rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Tune In?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of listeners who trust Soundmaster for their daily dose
          of music and entertainment.
        </p>
        <Link
          href="/schedule"
          className="bg-white text-blue-800 hover:bg-gray-100 px-8 py-3 rounded-full font-medium inline-block transition-colors"
        >
          View Today's Schedule
        </Link>
      </section>
    </div>
  );
}
