import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, MapPin, Users, UserPlus } from "lucide-react";

const FriendInvitation = ({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) => {
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const mockContacts = [
    { id: "1", name: "Sarah Johnson", friends: 12 },
    { id: "2", name: "Mike Chen", friends: 8 },
    { id: "3", name: "Emma Davis", friends: 15 },
    { id: "4", name: "Alex Rodriguez", friends: 6 },
    { id: "5", name: "Maya Patel", friends: 20 },
    { id: "6", name: "Chris Wong", friends: 9 }
  ];

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFriendToggle = (friendId: string) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      } else if (prev.length < 3) {
        return [...prev, friendId];
      }
      return prev;
    });
  };

  const selectedFriendsData = mockContacts.filter(contact => 
    selectedFriends.includes(contact.id)
  );

  const unselectedContacts = filteredContacts.filter(contact => 
    !selectedFriends.includes(contact.id)
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-6">invite your friends</h2>
        
        {/* Selected friends at top */}
        <div className="flex justify-center space-x-4 mb-6">
          {[0, 1, 2].map((index) => {
            const friend = selectedFriendsData[index];
            return (
              <div 
                key={index} 
                className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${
                  friend 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-muted border-dashed border-muted-foreground/30"
                }`}
              >
                {friend ? (
                  <span className="text-sm font-medium">
                    {friend.name.split(' ').map(n => n[0]).join('')}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Select up to 3 friends ({selectedFriends.length}/3)
        </p>
      </div>

      {/* Search contacts */}
      <div>
        <Input
          placeholder="Search your contacts"
          className="h-12 text-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Contact list */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {/* Selected friends first */}
        {selectedFriendsData.map((contact) => (
          <div key={contact.id} className="flex items-center justify-between py-3 px-1 bg-primary/5 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">
                  {contact.friends} friends on rateurcoffee
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="default"
              onClick={() => handleFriendToggle(contact.id)}
            >
              Remove
            </Button>
          </div>
        ))}
        
        {/* Unselected contacts */}
        {unselectedContacts.map((contact) => (
          <div key={contact.id} className="flex items-center justify-between py-3 px-1">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {contact.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted-foreground">
                  {contact.friends} friends on rateurcoffee
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleFriendToggle(contact.id)}
              disabled={selectedFriends.length >= 3}
            >
              Add
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Button onClick={onComplete} className="w-full h-12 text-lg">
          invite friends ({selectedFriends.length})
        </Button>
        <Button onClick={onSkip} variant="ghost" className="w-full h-12 text-lg">
          skip for now
        </Button>
      </div>
    </div>
  );
};

type OnboardingStep = "notifications" | "location" | "social" | "invite";

const OnboardingFlow = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("notifications");

  const handleAllow = () => {
    const steps: OnboardingStep[] = ["notifications", "location", "social", "invite"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    const steps: OnboardingStep[] = ["notifications", "location", "social", "invite"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      onComplete();
    }
  };

  return (
    <div className="mobile-container bg-background">
      <div className="mobile-safe-area py-12">
        
        {/* Notifications Permission */}
        {currentStep === "notifications" && (
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bell className="w-12 h-12 text-primary" />
                </div>
                {/* Sound waves animation */}
                <div className="absolute -top-2 -right-2">
                  <div className="w-6 h-6 bg-primary/20 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 w-6 h-6 bg-primary/30 rounded-full animate-ping animation-delay-200"></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">stay connected</h2>
              <p className="text-muted-foreground px-4">
                find out when your friends interact with you and when new friends join!
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleAllow} className="w-full h-12 text-lg">
                allow notifications
              </Button>
              <Button onClick={handleSkip} variant="ghost" className="w-full h-12 text-lg">
                not now
              </Button>
            </div>
          </div>
        )}

        {/* Location Permission */}
        {currentStep === "location" && (
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-12 h-12 text-primary" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">anytime, anywhere</h2>
              <p className="text-muted-foreground px-4">
                to show the maps/friends feature turn on location services
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleAllow} className="w-full h-12 text-lg">
                allow location
              </Button>
              <Button onClick={handleSkip} variant="ghost" className="w-full h-12 text-lg">
                not now
              </Button>
            </div>
          </div>
        )}

        {/* Social Integration */}
        {currentStep === "social" && (
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="flex space-x-2">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">find friends</h2>
              <div className="space-y-2 text-left px-4">
                <div className="flex items-center space-x-3">
                  <span>🚀</span>
                  <span>share coffee with friends</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span>⭐</span>
                  <span>see friends' reviews</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span>🏆</span>
                  <span>compete with friends</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={handleAllow} className="w-full h-12 text-lg">
                allow contacts
              </Button>
              <Button onClick={handleSkip} variant="ghost" className="w-full h-12 text-lg">
                not now
              </Button>
            </div>
          </div>
        )}

        {/* Friend Invitation */}
        {currentStep === "invite" && (
          <FriendInvitation onComplete={handleAllow} onSkip={handleSkip} />
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;