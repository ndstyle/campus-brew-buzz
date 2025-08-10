import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, TrendingUp, Users, Star } from "lucide-react";
import { useUserStats } from '@/hooks/useUserStats';
import { format } from 'date-fns';

const Dashboard = () => {
  const { stats, recentReviews, loading } = useUserStats();

  // Real user statistics from database
  const userStats = stats ? [
    { label: 'Reviews Posted', value: stats.reviews_count, icon: Star },
    { label: 'Average Rating', value: stats.average_rating.toFixed(1), icon: TrendingUp },
    { label: 'Cafes Visited', value: stats.places_visited, icon: Coffee },
    { label: 'Current Streak', value: stats.current_streak, icon: Users }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

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
          {userStats.map((stat, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 text-primary" />
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
            {recentReviews.length > 0 ? (
              recentReviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-foreground">{review.cafe.name}</h3>
                    {review.cafe.campus && (
                      <Badge variant="outline">{review.cafe.campus}</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{review.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {review.blurb && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {review.blurb}
                    </p>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No reviews yet!</p>
                <p className="text-sm">Start reviewing cafes to see them here.</p>
              </div>
            )}
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