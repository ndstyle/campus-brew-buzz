import { Trophy, Map, Plus, Star, User } from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: "leaderboard", icon: Trophy, label: "Leaderboard" },
    { id: "map", icon: Map, label: "Find Coffee" },
    { id: "search", icon: Plus, label: "Add Review", isCenter: true },
    { id: "feed", icon: Star, label: "Feed" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe">
      <div className="flex items-center justify-around px-4 py-2 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isCenter = tab.isCenter;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center p-2 transition-colors ${
                isCenter ? '-mt-6' : ''
              }`}
            >
              {isCenter ? (
                <div className="flex items-center justify-center w-14 h-14 bg-primary rounded-full shadow-lg">
                  <Icon 
                    size={24} 
                    className="text-white"
                  />
                </div>
              ) : (
                <Icon 
                  size={20} 
                  className={`${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  } transition-colors`}
                />
              )}
              
              <span className={`text-xs mt-1 transition-colors ${
                isActive || isCenter ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;