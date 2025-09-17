import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { ProfileEdit } from "@/components/ProfileEdit";
import { UserPreferences } from "@/components/UserPreferences";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="mobile-container bg-background min-h-screen pb-20">
      <div className="mobile-safe-area py-6 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Profile Edit Section */}
        <div className="mb-6">
          <ProfileEdit />
        </div>

        {/* User Preferences Section */}
        <div className="mb-6">
          <UserPreferences />
        </div>

        {/* Sign Out */}
        <Button 
          onClick={handleSignOut}
          variant="destructive" 
          className="w-full h-12 mb-6" 
          size="lg"
          data-testid="button-sign-out"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>RateUrCoffee v1.0.0</p>
          <p className="mt-1">© 2024 Campus Brew Buzz</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;