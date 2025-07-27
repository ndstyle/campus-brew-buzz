import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState("visited");
  const [leaderboardType, setLeaderboardType] = useState("friends");

  const userStats = {
    visited: 5,
    reviewed: 4,
    photos: 3
  };

  const mockUsers = [
    { username: "barackobama", score: 300, rank: 1, avatar: "👤" },
    { username: "donaldtrump", score: 275, rank: 2, avatar: "👤" },
    { username: "sigmachad", score: 250, rank: 3, avatar: "👤" },
    { username: "doug", score: 123, rank: 4, avatar: "👤" },
    { username: "megaknight", score: 99, rank: 5, avatar: "👤" },
    { username: "niranjan", score: 88, rank: 6, avatar: "👤" },
    { username: "idris", score: 77, rank: 7, avatar: "👤" },
    { username: "rizzlord", score: 49, rank: 8, avatar: "👤" },
    { username: "rit", score: 31, rank: 9, avatar: "👤" },
    { username: "baahubali", score: 3, rank: 10, avatar: "👤" },
  ];

  return (
    <div className="mobile-container bg-background pb-20 min-h-screen">
      <div className="mobile-safe-area">
        {/* Header */}
        <div className="flex items-center justify-between py-4 px-4">
          <h1 className="text-xl font-bold">
            rate<span className="text-primary">ur</span>coffee
          </h1>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="px-4">
          {/* Page Title */}
          <h2 className="text-4xl font-bold mb-8">leaderboard</h2>

          {/* User Stats Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 border-4 border-gray-300 rounded-full flex flex-col items-center justify-center bg-background">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-2">
                  <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                </div>
              </div>
              <div className="absolute -right-4 top-1/2 -translate-y-1/2">
                <div className="text-right">
                  <div className="text-lg font-semibold">Visited:</div>
                  <div className="text-lg font-semibold">Reviewed:</div>
                  <div className="text-lg font-semibold">Photos</div>
                </div>
              </div>
              <div className="absolute -right-12 top-1/2 -translate-y-1/2">
                <div className="text-right">
                  <div className="text-lg font-bold">5</div>
                  <div className="text-lg font-bold">4</div>
                  <div className="text-lg font-bold">3</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-background border border-border rounded-full p-1">
              {["visited", "reviewed", "photos"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? "bg-foreground text-background"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Leaderboard Type Toggle */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              <Button
                variant={leaderboardType === "friends" ? "default" : "outline"}
                onClick={() => setLeaderboardType("friends")}
                size="sm"
                className="rounded-full px-6"
              >
                Friends
              </Button>
              <Button
                variant={leaderboardType === "global" ? "default" : "outline"}
                onClick={() => setLeaderboardType("global")}
                size="sm"
                className="rounded-full px-6"
              >
                Global
              </Button>
            </div>
          </div>

          {/* Rankings List */}
          <div className="space-y-2">
            {mockUsers.map((user) => (
              <div
                key={user.username}
                className="flex items-center justify-between p-3"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-lg">{user.avatar}</span>
                  </div>
                  <span className="font-medium text-lg">
                    @{user.username}
                  </span>
                </div>
                <div className="text-lg font-bold">
                  {user.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;