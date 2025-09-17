import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Coffee, UtensilsCrossed, Plus, X, Heart } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";

interface FavoritesManagerProps {
  userId?: string;
  showManageButton?: boolean;
}

const FavoritesManager = ({ userId, showManageButton = true }: FavoritesManagerProps) => {
  const { favorites, loading, addFavorite, removeFavorite } = useFavorites(userId);
  const [isOpen, setIsOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState<'coffee' | 'food'>('coffee');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddFavorite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    setIsAdding(true);
    const success = await addFavorite(itemName.trim(), itemType);
    if (success) {
      setItemName("");
      setItemType('coffee');
    }
    setIsAdding(false);
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    await removeFavorite(favoriteId);
  };

  const getIcon = (type: string) => {
    return type === 'coffee' ? <Coffee className="h-4 w-4" /> : <UtensilsCrossed className="h-4 w-4" />;
  };

  const getIconColor = (type: string) => {
    return type === 'coffee' ? 'text-amber-600' : 'text-green-600';
  };

  if (loading) {
    return (
      <Card data-testid="favorites-loading">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading favorites...</div>
        </CardContent>
      </Card>
    );
  }

  const content = (
    <Card data-testid="favorites-manager">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-red-500" />
          My Favorites
          <Badge variant="secondary" className="ml-auto">
            {favorites.length}/2
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {favorites.length > 0 ? (
          <div className="space-y-2">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="flex items-center justify-between p-3 border rounded-lg"
                data-testid={`favorite-item-${favorite.id}`}
              >
                <Badge
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-2 h-auto"
                >
                  <span className={getIconColor(favorite.item_type)}>
                    {getIcon(favorite.item_type)}
                  </span>
                  <span className="text-sm">{favorite.item_name}</span>
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFavorite(favorite.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  data-testid={`button-remove-${favorite.id}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4" data-testid="text-no-favorites">
            No favorites yet. Add your favorite coffee orders or foods!
          </div>
        )}

        {favorites.length < 2 && (
          <form onSubmit={handleAddFavorite} className="space-y-3 border-t pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Type:</label>
              <Select value={itemType} onValueChange={(value: 'coffee' | 'food') => setItemType(value)}>
                <SelectTrigger data-testid="select-item-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coffee">Coffee</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Item Name:</label>
              <Input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., Vanilla Latte, Chocolate Croissant"
                disabled={isAdding}
                data-testid="input-item-name"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!itemName.trim() || isAdding}
              data-testid="button-add-favorite"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isAdding ? 'Adding...' : 'Add to Favorites'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );

  if (showManageButton) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" data-testid="button-manage-favorites">
            <Heart className="h-4 w-4 mr-2" />
            Manage Favorites
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Your Favorites</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return content;
};

export default FavoritesManager;