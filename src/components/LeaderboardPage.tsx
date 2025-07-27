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
    { username: "barackobama", score: 300, rank: 1, avatar: "BO" },
    { username: "donaldtrump", score: 275, rank: 2, avatar: "DT" },
    { username: "sarah_coffee", score: 250, rank: 3, avatar: "SC" },
    { username: "mike_java", score: 230, rank: 4, avatar: "MJ" },
    { username: "emma_espresso", score: 215, rank: 5, avatar: "EE" },
    { username: "you", score: userStats[activeTab as keyof typeof userStats] * 10, rank: 8, avatar: "YOU", isCurrentUser: true },
  ];

  return (
    <div className="mobile-container bg-background pb-20">
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
          <h2 className="text-3xl font-bold mb-6">leaderboard</h2>

          {/* User Stats Circle */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-32 h-32 border-4 border-primary rounded-full flex flex-col items-center justify-center bg-primary/5">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {userStats[activeTab as keyof typeof userStats]}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    {activeTab}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">YOU</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Display */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-lg font-semibold">Visited</div>
              <div className="text-2xl font-bold text-primary">{userStats.visited}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">Reviewed</div>
              <div className="text-2xl font-bold text-primary">{userStats.reviewed}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">Photos</div>
              <div className="text-2xl font-bold text-primary">{userStats.photos}</div>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-muted rounded-lg p-1">
              {["visited", "reviewed", "photos"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
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
              >
                Friends
              </Button>
              <Button
                variant={leaderboardType === "global" ? "default" : "outline"}
                onClick={() => setLeaderboardType("global")}
                size="sm"
              >
                Global
              </Button>
            </div>
          </div>

          {/* Rankings List */}
          <div className="space-y-3">
            {mockUsers.map((user) => (
              <div
                key={user.username}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  user.isCurrentUser ? "bg-primary/10 border border-primary/20" : "bg-muted/30"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    user.rank <= 3 ? "bg-yellow-500 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {user.rank}
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    user.isCurrentUser ? "bg-primary text-white" : "bg-background text-foreground"
                  }`}>
                    {user.avatar}
                  </div>
                  <span className={`font-medium ${
                    user.isCurrentUser ? "text-primary" : "text-foreground"
                  }`}>
                    @{user.username}
                  </span>
                </div>
                <div className={`text-lg font-bold ${
                  user.isCurrentUser ? "text-primary" : "text-foreground"
                }`}>
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