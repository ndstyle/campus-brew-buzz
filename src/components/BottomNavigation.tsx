interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: "leaderboard", emoji: "🏆", label: "leaderboard" },
    { id: "map", emoji: "🗺️", label: "find coffee" },
    { id: "search", emoji: "➕", label: "search + review", isCenter: true },
    { id: "feed", emoji: "⭐", label: "feed" },
    { id: "profile", emoji: "👤", label: "my profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="mobile-container">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isCenter = tab.isCenter;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 ${
                  isCenter ? 'relative' : ''
                }`}
              >
                <div className={`flex items-center justify-center ${
                  isCenter 
                    ? 'w-12 h-12 bg-primary rounded-full shadow-lg' 
                    : 'w-8 h-8'
                } ${
                  isActive && !isCenter ? 'text-primary' : ''
                } ${
                  isCenter ? 'text-white' : 'text-muted-foreground'
                }`}>
                  <span className={`${isCenter ? 'text-lg' : 'text-base'}`}>
                    {tab.emoji}
                  </span>
                </div>
                <span className={`text-xs mt-1 text-center ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                } ${isCenter ? 'text-primary' : ''}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;