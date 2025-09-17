import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coffee, UtensilsCrossed } from "lucide-react";

interface UserFavorite {
  id: string;
  item_name: string;
  item_type: 'coffee' | 'food';
  created_at: Date;
}

interface UserProfileProps {
  username: string;
  favoriteItems: UserFavorite[];
}

const UserProfile = ({ username, favoriteItems }: UserProfileProps) => {
  // Limit to 2 favorite items as per requirements
  const displayItems = favoriteItems.slice(0, 2);

  const getIcon = (itemType: string) => {
    return itemType === 'coffee' ? <Coffee className="h-4 w-4" /> : <UtensilsCrossed className="h-4 w-4" />;
  };

  const getIconColor = (itemType: string) => {
    return itemType === 'coffee' ? 'text-amber-600' : 'text-green-600';
  };

  return (
    <Card className="w-full max-w-md" data-testid="user-profile">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold" data-testid="text-username">
          {username}'s Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Favorites:</h3>
          {displayItems.length > 0 ? (
            <div className="space-y-2">
              {displayItems.map((item, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-2 h-auto justify-start"
                  data-testid={`badge-favorite-${index}`}
                >
                  <span className={getIconColor(item.item_type)}>
                    {getIcon(item.item_type)}
                  </span>
                  <span className="text-sm">{item.item_name}</span>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic" data-testid="text-no-favorites">
              No favorites yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;