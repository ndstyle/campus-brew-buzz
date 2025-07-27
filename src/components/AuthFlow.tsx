import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

type AuthStep = "email" | "name" | "username" | "password" | "college";

interface AuthData {
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  college: string;
}

const AuthFlow = ({ onBack, onComplete }: { onBack: () => void; onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [authData, setAuthData] = useState<AuthData>({
    email: "",
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    college: ""
  });

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 6;
    const hasLettersAndNumbers = /^(?=.*[A-Za-z])(?=.*\d)/.test(password);
    return { hasMinLength, hasLettersAndNumbers };
  };

  const passwordValidation = validatePassword(authData.password);
  const isPasswordValid = passwordValidation.hasMinLength && passwordValidation.hasLettersAndNumbers;

  const handleContinue = () => {
    const steps: AuthStep[] = ["email", "name", "username", "password", "college"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      // Complete registration
      console.log("Registration complete:", authData);
      onComplete();
    }
  };

  const handleBack = () => {
    const steps: AuthStep[] = ["email", "name", "username", "password", "college"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      onBack();
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case "email":
        return authData.email.includes("@");
      case "name":
        return authData.firstName.trim() && authData.lastName.trim();
      case "username":
        return authData.username.trim().length > 0;
      case "password":
        return isPasswordValid;
      case "college":
        return authData.college.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="mobile-container bg-background">
      <div className="mobile-safe-area py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mr-4"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>

        {/* Email Step */}
        {currentStep === "email" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-6">
                first, what's your email?
              </h2>
              <Input
                type="email"
                placeholder="email@example.com"
                value={authData.email}
                onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                className="text-lg h-12"
              />
            </div>
          </div>
        )}

        {/* Name Step */}
        {currentStep === "name" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-6">
                what's your name?
              </h2>
              <div className="space-y-4">
                <Input
                  placeholder="first name"
                  value={authData.firstName}
                  onChange={(e) => setAuthData({ ...authData, firstName: e.target.value })}
                  className="text-lg h-12"
                />
                <Input
                  placeholder="last name"
                  value={authData.lastName}
                  onChange={(e) => setAuthData({ ...authData, lastName: e.target.value })}
                  className="text-lg h-12"
                />
              </div>
            </div>
          </div>
        )}

        {/* Username Step */}
        {currentStep === "username" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-6">
                what's your username?
              </h2>
              <Input
                placeholder="@username"
                value={authData.username}
                onChange={(e) => setAuthData({ ...authData, username: e.target.value.replace("@", "") })}
                className="text-lg h-12"
              />
            </div>
          </div>
        )}

        {/* Password Step */}
        {currentStep === "password" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-6">
                create a password
              </h2>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="password"
                  value={authData.password}
                  onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
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
              
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">your password must have:</p>
                <div className="space-y-1">
                  <div className={`text-sm flex items-center ${
                    passwordValidation.hasMinLength ? "text-green-600" : "text-muted-foreground"
                  }`}>
                    • at least 6 characters
                  </div>
                  <div className={`text-sm flex items-center ${
                    passwordValidation.hasLettersAndNumbers ? "text-green-600" : "text-muted-foreground"
                  }`}>
                    • letters and numbers
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* College Step */}
        {currentStep === "college" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-6">
                find your college
              </h2>
              <Input
                placeholder="e.g. University of Washington"
                value={authData.college}
                onChange={(e) => setAuthData({ ...authData, college: e.target.value })}
                className="text-lg h-12"
              />
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="mt-8">
          <Button
            onClick={handleContinue}
            disabled={!canContinue()}
            className="w-full h-12 text-lg font-medium"
          >
            continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;