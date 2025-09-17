import { Trophy, Map, Plus, Star, User, Coffee, Heart } from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: "leaderboard", icon: Trophy, label: "Rankings" },
    { id: "map", icon: Map, label: "Discover" },
    { id: "search", icon: Coffee, label: "Review", isCenter: true },
    { id: "feed", icon: Heart, label: "Social" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe-bottom">
      {/* Social Template Bottom Navigation */}
      <div className="glass-card border-t border-white/10 backdrop-blur-xl bg-background/95 w-full">
        <div className="flex items-center justify-around px-6 py-3 h-20">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isCenter = tab.isCenter;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center transition-all duration-200 ${
                  isCenter ? '-mt-8' : 'p-2'
                }`}
                data-testid={`nav-${tab.id}`}
              >
                {isCenter ? (
                  // Center FAB with social gradient
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full shadow-xl border-4 border-background hover:scale-110 transition-transform">
                    <Icon 
                      size={28} 
                      className="text-white"
                    />
                  </div>
                ) : (
                  // Regular nav items with enhanced hover states
                  <div className={`flex flex-col items-center justify-center transition-all duration-200 ${
                    isActive ? 'transform -translate-y-1' : ''
                  }`}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary/10 shadow-lg' 
                        : 'hover:bg-muted/50'
                    }`}>
                      <Icon 
                        size={22} 
                        className={`${
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        } transition-colors`}
                      />
                    </div>
                    
                    <span className={`text-xs mt-1 font-medium transition-all duration-200 ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {tab.label}
                    </span>
                    
                    {/* Active indicator dot */}
                    {isActive && (
                      <div className="w-1 h-1 bg-primary rounded-full mt-1 animate-pulse" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;