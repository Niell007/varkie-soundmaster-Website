"use client";

import { useState } from "react";
import { 
  Paintbrush, 
  Layers, 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Music, 
  Video,
  Grid,
  Columns,
  Save,
  Eye,
  Code,
  Undo,
  Redo,
  PanelLeft,
  Monitor
} from "lucide-react";

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [showPanel, setShowPanel] = useState(true);
  const [selectedPage, setSelectedPage] = useState("home");
  
  // Mock pages data
  const pages = [
    { id: "home", name: "Home Page", path: "/" },
    { id: "about", name: "About Us", path: "/about" },
    { id: "shows", name: "Shows", path: "/shows" },
    { id: "contact", name: "Contact", path: "/contact" }
  ];
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center">
          <Paintbrush className="h-6 w-6 mr-2 text-blue-600" />
          Frontend Editor
        </h1>
        
        <div className="flex space-x-2">
          <div className="border border-gray-300 rounded-md overflow-hidden flex">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-4 py-2 flex items-center ${activeTab === "editor" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-700"}`}
            >
              <Layers className="h-4 w-4 mr-2" />
              Editor
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 flex items-center ${activeTab === "preview" ? "bg-blue-50 text-blue-600" : "bg-white text-gray-700"}`}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow flex-1 flex flex-col overflow-hidden">
        {/* Editor Toolbar */}
        <div className="border-b border-gray-200 p-2 flex items-center justify-between bg-gray-50">
          <div className="flex space-x-1">
            <select 
              value={selectedPage} 
              onChange={(e) => setSelectedPage(e.target.value)}
              className="border border-gray-300 rounded-md text-sm px-2 py-1"
            >
              {pages.map(page => (
                <option key={page.id} value={page.id}>{page.name}</option>
              ))}
            </select>
            
            <button className="p-1 text-gray-600 hover:bg-gray-200 rounded">
              <Undo className="h-5 w-5" />
            </button>
            <button className="p-1 text-gray-600 hover:bg-gray-200 rounded">
              <Redo className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex space-x-1">
            <button className="p-1 text-gray-600 hover:bg-gray-200 rounded">
              <Layout className="h-5 w-5" />
            </button>
            <button className="p-1 text-gray-600 hover:bg-gray-200 rounded">
              <Type className="h-5 w-5" />
            </button>
            <button className="p-1 text-gray-600 hover:bg-gray-200 rounded">
              <ImageIcon className="h-5 w-5" />
            </button>
            <button className="p-1 text-gray-600 hover:bg-gray-200 rounded">
              <Music className="h-5 w-5" />
            </button>
            <button className="p-1 text-gray-600 hover:bg-gray-200 rounded">
              <Video className="h-5 w-5" />
            </button>
            <button className="p-1 text-gray-600 hover:bg-gray-200 rounded">
              <Grid className="h-5 w-5" />
            </button>
            <button className="p-1 text-gray-600 hover:bg-gray-200 rounded">
              <Columns className="h-5 w-5" />
            </button>
            <button className="p-1 text-gray-600 hover:bg-gray-200 rounded">
              <Code className="h-5 w-5" />
            </button>
          </div>
          
          <div>
            <button 
              onClick={() => setShowPanel(!showPanel)}
              className={`p-1 rounded ${showPanel ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Editor Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Side Panel */}
          {showPanel && (
            <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto p-4">
              <h3 className="font-medium text-sm uppercase text-gray-500 mb-2">Components</h3>
              <div className="space-y-2">
                <div className="p-2 bg-white border border-gray-200 rounded-md shadow-sm cursor-move hover:border-blue-500 transition-colors">
                  <div className="flex items-center">
                    <Layout className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">Section</span>
                  </div>
                </div>
                <div className="p-2 bg-white border border-gray-200 rounded-md shadow-sm cursor-move hover:border-blue-500 transition-colors">
                  <div className="flex items-center">
                    <Type className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm">Heading</span>
                  </div>
                </div>
                <div className="p-2 bg-white border border-gray-200 rounded-md shadow-sm cursor-move hover:border-blue-500 transition-colors">
                  <div className="flex items-center">
                    <Type className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">Paragraph</span>
                  </div>
                </div>
                <div className="p-2 bg-white border border-gray-200 rounded-md shadow-sm cursor-move hover:border-blue-500 transition-colors">
                  <div className="flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="text-sm">Image</span>
                  </div>
                </div>
                <div className="p-2 bg-white border border-gray-200 rounded-md shadow-sm cursor-move hover:border-blue-500 transition-colors">
                  <div className="flex items-center">
                    <Grid className="h-4 w-4 mr-2 text-orange-500" />
                    <span className="text-sm">Grid</span>
                  </div>
                </div>
                <div className="p-2 bg-white border border-gray-200 rounded-md shadow-sm cursor-move hover:border-blue-500 transition-colors">
                  <div className="flex items-center">
                    <Music className="h-4 w-4 mr-2 text-red-500" />
                    <span className="text-sm">Audio Player</span>
                  </div>
                </div>
              </div>
              
              <h3 className="font-medium text-sm uppercase text-gray-500 mt-6 mb-2">Page Structure</h3>
              <div className="space-y-1">
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center">
                    <Layout className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm font-medium">Header</span>
                  </div>
                </div>
                <div className="p-2 bg-white border border-gray-200 rounded-md ml-4">
                  <div className="flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">Logo</span>
                  </div>
                </div>
                <div className="p-2 bg-white border border-gray-200 rounded-md ml-4">
                  <div className="flex items-center">
                    <Layout className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">Navigation</span>
                  </div>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center">
                    <Layout className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm font-medium">Hero Section</span>
                  </div>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center">
                    <Layout className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm font-medium">Content Section</span>
                  </div>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center">
                    <Layout className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm font-medium">Footer</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Main Editor Area */}
          <div className="flex-1 overflow-auto bg-gray-100 p-4">
            {activeTab === "editor" ? (
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg min-h-full p-4 flex flex-col items-center justify-center">
                <div className="max-w-4xl w-full space-y-8">
                  {/* Header Section */}
                  <div className="border-2 border-blue-200 bg-blue-50 p-4 rounded-lg relative">
                    <span className="absolute -top-3 left-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">Header</span>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-gray-200 h-10 w-40 rounded flex items-center justify-center text-gray-500">
                          <ImageIcon className="h-5 w-5 mr-1" />
                          Logo
                        </div>
                      </div>
                      <div className="flex space-x-4">
                        <div className="bg-gray-200 h-8 w-16 rounded"></div>
                        <div className="bg-gray-200 h-8 w-16 rounded"></div>
                        <div className="bg-gray-200 h-8 w-16 rounded"></div>
                        <div className="bg-gray-200 h-8 w-16 rounded"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hero Section */}
                  <div className="border-2 border-blue-200 bg-blue-50 p-4 rounded-lg relative">
                    <span className="absolute -top-3 left-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">Hero Section</span>
                    <div className="flex flex-col items-center text-center py-8">
                      <h2 className="text-2xl font-bold mb-4 bg-white px-4 py-2 rounded w-3/4">Your Music, Your Station</h2>
                      <p className="mb-6 bg-white px-4 py-2 rounded w-2/3">Listen to the best music and shows on Soundmaster Radio</p>
                      <div className="flex space-x-4">
                        <div className="bg-blue-600 text-white px-4 py-2 rounded">Listen Live</div>
                        <div className="bg-gray-200 px-4 py-2 rounded">View Schedule</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="border-2 border-blue-200 bg-blue-50 p-4 rounded-lg relative">
                    <span className="absolute -top-3 left-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">Content Section</span>
                    <div className="grid grid-cols-3 gap-4 py-4">
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="bg-gray-200 h-32 w-full rounded-lg mb-4"></div>
                        <h3 className="font-bold mb-2">Latest Shows</h3>
                        <p className="text-gray-600 text-sm">Check out our newest programs and episodes.</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="bg-gray-200 h-32 w-full rounded-lg mb-4"></div>
                        <h3 className="font-bold mb-2">Music Playlists</h3>
                        <p className="text-gray-600 text-sm">Discover curated playlists for every mood.</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg shadow-sm">
                        <div className="bg-gray-200 h-32 w-full rounded-lg mb-4"></div>
                        <h3 className="font-bold mb-2">Meet the Team</h3>
                        <p className="text-gray-600 text-sm">Get to know the voices behind Soundmaster.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer Section */}
                  <div className="border-2 border-blue-200 bg-blue-50 p-4 rounded-lg relative">
                    <span className="absolute -top-3 left-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">Footer</span>
                    <div className="flex justify-between py-4">
                      <div className="bg-gray-200 h-10 w-40 rounded"></div>
                      <div className="flex space-x-4">
                        <div className="bg-gray-200 h-8 w-8 rounded-full"></div>
                        <div className="bg-gray-200 h-8 w-8 rounded-full"></div>
                        <div className="bg-gray-200 h-8 w-8 rounded-full"></div>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4 mt-4 text-center">
                      <p className="text-sm text-gray-500">© 2025 Soundmaster Radio. All rights reserved.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-300 rounded-lg min-h-full overflow-hidden">
                <div className="bg-gray-100 border-b border-gray-300 p-2 flex items-center">
                  <Monitor className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">Preview: {pages.find(p => p.id === selectedPage)?.name}</span>
                </div>
                <div className="p-4 flex justify-center">
                  <div className="relative w-full max-w-4xl h-[600px] bg-white shadow-lg rounded overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Eye className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p>Preview will be available when connected to a live site</p>
                        <p className="text-sm">This is a placeholder for the preview functionality</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
