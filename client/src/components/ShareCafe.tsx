import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, MapPin, Coffee } from "lucide-react";
import { useCafeSharing } from "@/hooks/useCafeSharing";

interface ShareCafeProps {
  cafeId: string;
  cafeName: string;
  cafeAddress?: string;
  trigger?: React.ReactNode;
}

const ShareCafe = ({ cafeId, cafeName, cafeAddress, trigger }: ShareCafeProps) => {
  const { shareCafe } = useCafeSharing();
  const [isOpen, setIsOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSharing(true);
    
    const success = await shareCafe(cafeId, cafeName, caption);
    if (success) {
      setCaption("");
      setIsOpen(false);
    }
    
    setIsSharing(false);
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" data-testid="button-share-cafe">
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Cafe
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Cafe Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Coffee className="h-4 w-4 text-primary" />
              <h3 className="font-medium" data-testid="text-cafe-name">{cafeName}</h3>
            </div>
            {cafeAddress && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span data-testid="text-cafe-address">{cafeAddress}</span>
              </div>
            )}
          </div>

          {/* Share Form */}
          <form onSubmit={handleShare} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Caption (optional)
              </label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Tell your friends why you love this place..."
                rows={3}
                maxLength={280}
                disabled={isSharing}
                data-testid="textarea-caption"
              />
              <div className="text-xs text-muted-foreground text-right">
                {caption.length}/280
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSharing}
                className="flex-1"
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSharing}
                className="flex-1"
                data-testid="button-confirm-share"
              >
                {isSharing ? 'Sharing...' : 'Share Cafe'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareCafe;