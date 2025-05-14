"use client";

import { useState, useEffect } from "react";
import { Clock, Calendar, User, Radio } from "lucide-react";

interface ScheduleItem {
  id: string;
  title: string;
  host: string;
  time: string;
  days: string;
  description: string;
}

export default function SchedulePage() {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeDay, setActiveDay] = useState("Monday");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch("/api/content?type=schedules");
        
        if (!response.ok) {
          throw new Error("Failed to fetch schedule");
        }

        const data = await response.json();
        setScheduleItems(data.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  // Filter schedule items for the active day
  const filteredSchedule = scheduleItems.filter(item => {
    // Check if the days field contains the active day
    // Days could be formatted as "Monday-Friday" or "Monday, Wednesday, Friday"
    if (item.days.includes("-")) {
      // Handle ranges like "Monday-Friday"
      const [start, end] = item.days.split("-").map(d => d.trim());
      const startIndex = days.indexOf(start);
      const endIndex = days.indexOf(end);
      const currentIndex = days.indexOf(activeDay);
      return startIndex <= currentIndex && currentIndex <= endIndex;
    } else if (item.days.includes(",")) {
      // Handle lists like "Monday, Wednesday, Friday"
      return item.days.split(",").map(d => d.trim()).includes(activeDay);
    } else {
      // Handle single day
      return item.days.trim() === activeDay;
    }
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Program Schedule</h1>
        <p className="text-gray-600">
          Check out our weekly programming lineup
        </p>
      </div>

      {/* Day selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-4 py-2 rounded-full ${
              activeDay === day
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } transition-colors`}
          >
            {day}
          </button>
        ))}
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
      ) : filteredSchedule.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No Programs Scheduled</h2>
          <p className="text-gray-600">
            There are no programs scheduled for {activeDay}.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">{activeDay}'s Schedule</h2>
          <div className="space-y-4">
            {filteredSchedule.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <div className="flex items-center text-gray-500 mt-1">
                      <User className="h-4 w-4 mr-1" />
                      <span>{item.host}</span>
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0 flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{item.time}</span>
                  </div>
                </div>
                <p className="text-gray-600">{item.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{item.days}</span>
                  </div>
                  <button className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-full flex items-center transition-colors">
                    <Radio className="h-4 w-4 mr-1" />
                    Listen Live
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
