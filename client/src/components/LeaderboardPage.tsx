import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award, Crown, Coffee, Users, TrendingUp } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";

interface LeaderboardPageProps {
  onUserClick?: (userId: string) => void;
}

const LeaderboardPage = ({ onUserClick }: LeaderboardPageProps) => {
  const { leaderboard, currentUserRank, loading, filters, updateFilters } = useLeaderboard();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
      default:
        return "bg-background border-border";
    }
  };

  const getDisplayName = (user: any) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user.first_name) {
      return user.first_name;
    } else {
      return user.username;
    }
  };

  const getAvatarInitials = (user: any) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    } else if (user.first_name) {
      return user.first_name[0].toUpperCase();
    } else {
      return user.username[0].toUpperCase();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b p-4 space-y-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Leaderboard</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Time Filter */}
          <div className="flex bg-muted/50 rounded-lg p-1">
            <Button
              variant={filters.timeRange === "month" ? "default" : "ghost"}
              size="sm"
              className="flex-1 text-sm"
              onClick={() => updateFilters({ timeRange: "month" })}
            >
              This Month
            </Button>
            <Button
              variant={filters.timeRange === "all-time" ? "default" : "ghost"}
              size="sm"
              className="flex-1 text-sm"
              onClick={() => updateFilters({ timeRange: "all-time" })}
            >
              All Time
            </Button>
          </div>

          {/* Scope Filter */}
          <div className="flex bg-muted/50 rounded-lg p-1">
            <Button
              variant={filters.scope === "global" ? "default" : "ghost"}
              size="sm"
              className="flex-1 text-sm"
              onClick={() => updateFilters({ scope: "global" })}
            >
              <Users className="h-4 w-4 mr-1" />
              Global
            </Button>
            <Button
              variant={filters.scope === "friends" ? "default" : "ghost"}
              size="sm"
              className="flex-1 text-sm"
              onClick={() => updateFilters({ scope: "friends" })}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Friends
            </Button>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-background border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-6" />
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-4 w-8 ml-auto" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No rankings yet</h3>
            <p className="text-sm text-muted-foreground">
              Be the first to review coffee shops and climb the leaderboard!
            </p>
          </div>
        ) : (
          leaderboard.map((user) => (
            <Card 
              key={user.id} 
              className={`transition-all hover:scale-[1.02] cursor-pointer ${getRankColor(user.rank)}`}
              onClick={() => onUserClick?.(user.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-10">
                    {getRankIcon(user.rank)}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getAvatarInitials(user)}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">{getDisplayName(user)}</h3>
                      {user.rank <= 3 && (
                        <span className="text-lg">
                          {user.rank === 1 ? '👑' : user.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                  </div>

                  {/* Visit Count */}
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-primary">
                      <Coffee className="h-4 w-4" />
                      <span className="font-bold text-sm">{user.unique_cafes_count}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">shops visited</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Current User Rank (Sticky) */}
      {currentUserRank && (
        <div className="sticky bottom-0 bg-background/90 backdrop-blur-md border-t p-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10">
                  <span className="text-sm font-bold text-primary">#{currentUserRank.rank}</span>
                </div>
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {getAvatarInitials(currentUserRank)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-primary">You</h3>
                  <p className="text-xs text-muted-foreground">@{currentUserRank.username}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-primary">
                    <Coffee className="h-4 w-4" />
                    <span className="font-bold text-sm">{currentUserRank.unique_cafes_count}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">shops visited</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;