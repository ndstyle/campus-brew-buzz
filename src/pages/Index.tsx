import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import AuthFlow from "@/components/AuthFlow";
import OnboardingFlow from "@/components/OnboardingFlow";
import FeedPage from "@/components/FeedPage";
import LeaderboardPage from "@/components/LeaderboardPage";
import BottomNavigation from "@/components/BottomNavigation";

type AppState = "landing" | "auth" | "onboarding" | "app";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("landing");
  const [activeTab, setActiveTab] = useState("feed");

  const renderCurrentState = () => {
    switch (appState) {
      case "landing":
        return <LandingPage />;
      case "auth":
        return <AuthFlow onBack={() => setAppState("landing")} />;
      case "onboarding":
        return <OnboardingFlow onComplete={() => setAppState("app")} />;
      case "app":
        return (
          <div className="relative">
            {activeTab === "feed" && <FeedPage />}
            {activeTab === "leaderboard" && <LeaderboardPage />}
            {activeTab === "map" && (
              <div className="mobile-container bg-background pb-20 flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-semibold">Map View</h2>
                  <p className="text-muted-foreground">Coffee shop map coming soon!</p>
                </div>
              </div>
            )}
            {activeTab === "search" && (
              <div className="mobile-container bg-background pb-20 flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-semibold">Search & Review</h2>
                  <p className="text-muted-foreground">Review interface coming soon!</p>
                </div>
              </div>
            )}
            {activeTab === "profile" && (
              <div className="mobile-container bg-background pb-20 flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-semibold">My Profile</h2>
                  <p className="text-muted-foreground">Profile page coming soon!</p>
                </div>
              </div>
            )}
            <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        );
      default:
        return <LandingPage />;
    }
  };

  // Debug: Add click handlers to test navigation
  const handleLandingClick = () => {
    if (appState === "landing") {
      setAppState("auth");
    }
  };

  const handleAuthComplete = () => {
    setAppState("onboarding");
  };

  // Override the landing page click to start auth flow
  if (appState === "landing") {
    return (
      <div onClick={handleLandingClick}>
        <LandingPage />
      </div>
    );
  }

  if (appState === "auth") {
    return <AuthFlow onBack={() => setAppState("landing")} />;
  }

  return renderCurrentState();
};

export default Index;
