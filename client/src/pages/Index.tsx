import { useState, useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import AuthFlow from "@/components/AuthFlow";
import SignInFlow from "@/components/SignInFlow";
import OnboardingFlow from "@/components/OnboardingFlow";
import FeedPage from "@/components/FeedPage";
import LeaderboardPage from "@/components/LeaderboardPage";
import MapPage from "@/components/MapPage";
import ProfilePage from "@/components/ProfilePage";
import CoffeeShopDetail from "@/components/CoffeeShopDetail";
import BottomNavigation from "@/components/BottomNavigation";
import Editor from "@/pages/Editor";
import Preview from "@/pages/Preview";
import CampusDebugger from "@/components/CampusDebugger";
import { useAuth } from "@/contexts/AuthContext";

type AppState = "landing" | "auth" | "signin" | "onboarding" | "app";
type AppView = "feed" | "leaderboard" | "map" | "search" | "profile" | "editor" | "preview" | "detail";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("landing");
  const [activeTab, setActiveTab] = useState("feed");
  const [currentView, setCurrentView] = useState<AppView>("feed");
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        setAppState("app");
      } else {
        setAppState("landing");
      }
    }
  }, [user, loading]);

  const handleReviewSubmitted = () => {
    // Trigger refresh of the feed
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAddReview = () => {
    if (!user) {
      // If user is not authenticated, redirect to sign in
      setAppState("signin");
      return;
    }
    setCurrentView("editor");
  };

  if (loading) {
    return (
      <div className="mobile-container bg-background flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const renderCurrentState = () => {
    switch (appState) {
      case "landing":
        return <LandingPage onSignUp={() => setAppState("auth")} onSignIn={() => setAppState("signin")} />;
      case "auth":
        return (
          <AuthFlow 
            onBack={() => setAppState("landing")} 
            onComplete={() => setAppState("onboarding")}
          />
        );
      case "signin":
        return (
          <SignInFlow 
            onBack={() => setAppState("landing")} 
            onComplete={() => setAppState("app")}
          />
        );
      case "onboarding":
        return <OnboardingFlow onComplete={() => setAppState("app")} />;
      case "app":
        return (
          <div className="relative min-h-screen">
            {/* Debug component - invisible but logs campus data */}
            <CampusDebugger />
            <div className="pb-20">
              {currentView === "feed" && (
                <FeedPage 
                  onReviewClick={(review) => {
                    setSelectedReview(review);
                    setCurrentView("preview");
                  }}
                  onAddReview={handleAddReview}
                  refreshTrigger={refreshTrigger}
                />
              )}
              {currentView === "leaderboard" && <LeaderboardPage />}
              {currentView === "map" && <MapPage onAddReview={handleAddReview} />}
              {currentView === "search" && (
                <FeedPage 
                  searchMode={true}
                  onReviewClick={(review) => {
                    setSelectedReview(review);
                    setCurrentView("preview");
                  }}
                  onAddReview={handleAddReview}
                  refreshTrigger={refreshTrigger}
                />
              )}
              {currentView === "profile" && (
                <ProfilePage 
                  onStatClick={(statType) => {
                    // Handle stat navigation here if needed
                  }}
                />
              )}
              {currentView === "editor" && (
                <Editor 
                  onBack={() => setCurrentView(activeTab as AppView)}
                  onReviewSubmitted={handleReviewSubmitted}
                />
              )}
              {currentView === "preview" && (
                <Preview 
                  review={selectedReview}
                  onBack={() => setCurrentView(activeTab as AppView)}
                />
              )}
            </div>
            <BottomNavigation 
              activeTab={activeTab} 
              onTabChange={(tab) => {
                setActiveTab(tab);
                setCurrentView(tab as AppView);
              }} 
            />
          </div>
        );
      default:
        return <LandingPage />;
    }
  };

  return renderCurrentState();
};

export default Index;