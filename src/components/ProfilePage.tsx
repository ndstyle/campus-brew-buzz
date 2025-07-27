import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bell, Menu, CheckCircle, Bookmark, Heart, Lock, Trophy, Plus } from "lucide-react";

const ProfilePage = () => {
  return (
    <div className="mobile-container bg-background pb-20 min-h-screen">
      <div className="mobile-safe-area">
        {/* Header */}
        <div className="flex items-center justify-between py-4 px-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg text-muted-foreground">my profile</span>
            <h1 className="text-xl font-bold">
              rate<span className="text-primary">ur</span>coffee
            </h1>
          </div>
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
          {/* Profile Section */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-medium text-muted-foreground">N</span>
            </div>
            <h2 className="text-2xl font-semibold mb-1">@niranjand</h2>
            <p className="text-muted-foreground mb-4">Member since July 2025</p>
            
            <div className="flex space-x-4 justify-center">
              <Button variant="outline" size="sm" className="rounded-full">
                Edit profile
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                Share profile
              </Button>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between p-4 bg-background border rounded-xl">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg font-medium">Been</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">0</span>
                <span className="text-muted-foreground">→</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-background border rounded-xl">
              <div className="flex items-center space-x-3">
                <Bookmark className="w-6 h-6" />
                <span className="text-lg font-medium">Want to Try</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">0</span>
                <span className="text-muted-foreground">→</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-background border rounded-xl">
              <div className="flex items-center space-x-3">
                <Heart className="w-6 h-6" />
                <span className="text-lg font-medium">Recs for You</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Achievement Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Rank on</p>
              <p className="text-xl font-bold">-</p>
            </Card>

            <Card className="p-4 text-center">
              <div className="w-8 h-8 mx-auto mb-2 text-blue-500 text-2xl">💧</div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-xl font-bold">0 weeks</p>
            </Card>
          </div>

          {/* Goal Setting */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Set your 2025 goal</h3>
                <p className="text-muted-foreground">How many restaurants do you want</p>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
            
            <Button variant="outline" size="icon" className="w-12 h-12 rounded-xl mx-auto block">
              <Plus className="w-6 h-6" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;