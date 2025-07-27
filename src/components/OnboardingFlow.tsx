import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, MapPin, Users, UserPlus } from "lucide-react";

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
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-6">invite your friends</h2>
              
              {/* Placeholder avatars */}
              <div className="flex justify-center space-x-4 mb-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-16 h-16 bg-muted rounded-full border-2 border-dashed border-muted-foreground/30"></div>
                ))}
              </div>
            </div>

            {/* Search contacts */}
            <div>
              <Input
                placeholder="Search your contacts"
                className="h-12 text-lg"
              />
            </div>

            {/* Mock contact list */}
            <div className="space-y-3">
              {[
                { name: "Sarah Johnson", friends: 12 },
                { name: "Mike Chen", friends: 8 },
                { name: "Emma Davis", friends: 15 }
              ].map((contact, index) => (
                <div key={index} className="flex items-center justify-between py-3 px-1">
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
                  <Button size="sm" variant="outline">
                    Add
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Button onClick={handleAllow} className="w-full h-12 text-lg">
                invite friends
              </Button>
              <Button onClick={handleSkip} variant="ghost" className="w-full h-12 text-lg">
                skip for now
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;