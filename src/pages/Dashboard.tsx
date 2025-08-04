import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, TrendingUp, Users, Star } from "lucide-react";

const Dashboard = () => {
  const stats = [
    { label: "Reviews Posted", value: "12", icon: Coffee, trend: "+3 this week" },
    { label: "Average Rating", value: "4.2", icon: Star, trend: "Consistent" },
    { label: "Cafes Visited", value: "8", icon: TrendingUp, trend: "+2 this month" },
    { label: "Friends", value: "24", icon: Users, trend: "+1 new" }
  ];

  const recentReviews = [
    { cafe: "Blue Bottle Coffee", rating: 4.5, date: "2 days ago", campus: "NYU" },
    { cafe: "Starbucks Reserve", rating: 3.8, date: "1 week ago", campus: "UCSD" },
    { cafe: "Local Coffee Co", rating: 4.9, date: "2 weeks ago", campus: "NYU" }
  ];

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="mobile-safe-area py-6 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Your coffee journey at a glance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 text-primary" />
                <Badge variant="secondary" className="text-xs">
                  {stat.trend}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Reviews */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Reviews</h2>
          <div className="space-y-3">
            {recentReviews.map((review, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-foreground">{review.cafe}</h3>
                  <Badge variant="outline">{review.campus}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{review.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{review.date}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <Button className="w-full h-12" size="lg">
            <Coffee className="w-5 h-5 mr-2" />
            Write New Review
          </Button>
          <Button variant="outline" className="w-full h-12" size="lg">
            <TrendingUp className="w-5 h-5 mr-2" />
            Explore Trending Cafes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;