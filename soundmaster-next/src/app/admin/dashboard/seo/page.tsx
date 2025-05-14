"use client";

import { useState } from "react";
import { Search, Globe, Share2, Save, Plus, Trash } from "lucide-react";

interface SeoSettings {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
}

interface PageSeo {
  id: string;
  path: string;
  title: string;
  description: string;
  lastUpdated: string;
}

export default function SeoPage() {
  const [activeTab, setActiveTab] = useState<"global" | "pages">("global");
  const [globalSettings, setGlobalSettings] = useState<SeoSettings>({
    title: "Soundmaster Radio - Your Music, Your Station",
    description: "Soundmaster Radio brings you the best music, shows, and entertainment. Listen live or catch up on your favorite programs.",
    keywords: "radio, music, soundmaster, shows, entertainment, live radio",
    ogTitle: "Soundmaster Radio",
    ogDescription: "Your Music, Your Station - Listen Live Now",
    ogImage: "https://soundmaster.co.za/images/og-image.jpg",
    twitterCard: "summary_large_image",
    twitterTitle: "Soundmaster Radio",
    twitterDescription: "Your Music, Your Station - Listen Live Now",
    twitterImage: "https://soundmaster.co.za/images/twitter-image.jpg"
  });
  
  // Mock page SEO data
  const [pagesSeo] = useState<PageSeo[]>([
    {
      id: "1",
      path: "/",
      title: "Home - Soundmaster Radio",
      description: "Welcome to Soundmaster Radio - Your Music, Your Station. Listen live or catch up on your favorite programs.",
      lastUpdated: "2025-05-10T10:30:00Z"
    },
    {
      id: "2",
      path: "/about",
      title: "About Us - Soundmaster Radio",
      description: "Learn about Soundmaster Radio's history, mission, and the team behind your favorite station.",
      lastUpdated: "2025-05-08T14:15:00Z"
    },
    {
      id: "3",
      path: "/shows",
      title: "Shows - Soundmaster Radio",
      description: "Discover our lineup of shows and programs on Soundmaster Radio. From music to talk shows, we've got you covered.",
      lastUpdated: "2025-05-07T09:45:00Z"
    },
    {
      id: "4",
      path: "/contact",
      title: "Contact Us - Soundmaster Radio",
      description: "Get in touch with the Soundmaster Radio team. We'd love to hear from you!",
      lastUpdated: "2025-05-06T16:20:00Z"
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter pages based on search term
  const filteredPages = pagesSeo.filter(page => {
    return searchTerm === "" || 
      page.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.description.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric"
    });
  };
  
  // Handle global settings update
  const handleGlobalSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGlobalSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this would save the settings to the database
    console.log("Saving settings:", globalSettings);
    alert("Settings saved successfully!");
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">SEO Settings</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("global")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "global" 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            >
              <Globe className="h-5 w-5 inline-block mr-2" />
              Global SEO
            </button>
            <button
              onClick={() => setActiveTab("pages")}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === "pages" 
                ? "border-blue-500 text-blue-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
            >
              <Search className="h-5 w-5 inline-block mr-2" />
              Page-Specific SEO
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === "global" ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic SEO Settings</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Default Title
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={globalSettings.title}
                        onChange={handleGlobalSettingsChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                      <p className="mt-1 text-sm text-gray-500">The default title for your website. Will be used if a page doesn&apos;t specify its own title.</p>
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Default Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={globalSettings.description}
                        onChange={handleGlobalSettingsChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                      <p className="mt-1 text-sm text-gray-500">The default meta description for your website. Keep it under 160 characters.</p>
                    </div>
                    
                    <div>
                      <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
                        Keywords
                      </label>
                      <input
                        type="text"
                        id="keywords"
                        name="keywords"
                        value={globalSettings.keywords}
                        onChange={handleGlobalSettingsChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                      <p className="mt-1 text-sm text-gray-500">Comma-separated keywords for your website.</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Share2 className="h-5 w-5 mr-2 text-gray-500" />
                    Open Graph Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="ogTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        OG Title
                      </label>
                      <input
                        type="text"
                        id="ogTitle"
                        name="ogTitle"
                        value={globalSettings.ogTitle}
                        onChange={handleGlobalSettingsChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="ogDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        OG Description
                      </label>
                      <input
                        type="text"
                        id="ogDescription"
                        name="ogDescription"
                        value={globalSettings.ogDescription}
                        onChange={handleGlobalSettingsChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="ogImage" className="block text-sm font-medium text-gray-700 mb-1">
                        OG Image URL
                      </label>
                      <input
                        type="text"
                        id="ogImage"
                        name="ogImage"
                        value={globalSettings.ogImage}
                        onChange={handleGlobalSettingsChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                      <p className="mt-1 text-sm text-gray-500">Recommended size: 1200 x 630 pixels</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Twitter Card Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="twitterCard" className="block text-sm font-medium text-gray-700 mb-1">
                        Twitter Card Type
                      </label>
                      <select
                        id="twitterCard"
                        name="twitterCard"
                        value={globalSettings.twitterCard}
                        onChange={(e) => setGlobalSettings(prev => ({
                          ...prev,
                          twitterCard: e.target.value
                        }))}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      >
                        <option value="summary">Summary</option>
                        <option value="summary_large_image">Summary with Large Image</option>
                        <option value="app">App</option>
                        <option value="player">Player</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="twitterTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        Twitter Title
                      </label>
                      <input
                        type="text"
                        id="twitterTitle"
                        name="twitterTitle"
                        value={globalSettings.twitterTitle}
                        onChange={handleGlobalSettingsChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="twitterDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Twitter Description
                      </label>
                      <input
                        type="text"
                        id="twitterDescription"
                        name="twitterDescription"
                        value={globalSettings.twitterDescription}
                        onChange={handleGlobalSettingsChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="twitterImage" className="block text-sm font-medium text-gray-700 mb-1">
                        Twitter Image URL
                      </label>
                      <input
                        type="text"
                        id="twitterImage"
                        name="twitterImage"
                        value={globalSettings.twitterImage}
                        onChange={handleGlobalSettingsChange}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search pages..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Page SEO
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Page Path
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPages.map((page) => (
                      <tr key={page.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {page.path}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {page.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {page.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(page.lastUpdated)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2 justify-end">
                            <button className="text-blue-600 hover:text-blue-900">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900 flex items-center">
                              <Trash className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
