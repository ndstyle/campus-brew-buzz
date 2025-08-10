import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const SignInFlow = ({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    setIsLoading(false);
    
    if (!error) {
      onComplete();
    }
  };

  const canSignIn = validateEmail(email) && password.length >= 6;

  return (
    <div className="mobile-container bg-background">
      <div className="mobile-safe-area py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="mr-4"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              welcome back!
            </h2>
            
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-lg h-12"
              />
              
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-lg h-12 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sign In Button */}
        <div className="mt-8">
          <Button
            onClick={handleSignIn}
            disabled={!canSignIn || isLoading}
            className="w-full h-12 text-lg font-medium"
          >
            {isLoading ? "Signing in..." : "sign in"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignInFlow;