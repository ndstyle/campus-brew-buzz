import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

const COLLEGES = [
  "University of Washington",
  "University of California, Berkeley",
  "University of California, Los Angeles",
  "Stanford University",
  "Massachusetts Institute of Technology",
  "Harvard University",
  "Yale University",
  "Princeton University",
  "Columbia University",
  "University of Pennsylvania",
  "Cornell University",
  "Dartmouth College",
  "Brown University",
  "University of Chicago",
  "Northwestern University",
  "Duke University",
  "Vanderbilt University",
  "Rice University",
  "University of Notre Dame",
  "Georgetown University",
  "Carnegie Mellon University",
  "University of California, San Diego",
  "University of California, Santa Barbara",
  "University of California, Irvine",
  "University of California, Davis",
  "University of Southern California",
  "New York University",
  "Boston University",
  "Northeastern University",
  "University of Michigan",
  "University of Wisconsin-Madison",
  "University of Illinois Urbana-Champaign",
  "Ohio State University",
  "Pennsylvania State University",
  "University of Florida",
  "University of Texas at Austin",
  "Texas A&M University",
  "University of Georgia",
  "University of North Carolina at Chapel Hill",
  "Virginia Tech",
  "University of Virginia",
  "Arizona State University",
  "University of Arizona",
  "University of Colorado Boulder",
  "University of Oregon",
  "Oregon State University",
  "Washington State University"
];

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
  const [showCollegeSuggestions, setShowCollegeSuggestions] = useState(false);
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

  const filteredColleges = COLLEGES.filter(college =>
    college.toLowerCase().includes(authData.college.toLowerCase())
  ).slice(0, 6);

  const handleCollegeSelect = (college: string) => {
    setAuthData({ ...authData, college });
    setShowCollegeSuggestions(false);
  };

  const handleCollegeInputChange = (value: string) => {
    setAuthData({ ...authData, college: value });
    setShowCollegeSuggestions(value.length > 0 && filteredColleges.length > 0);
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
            <div className="relative">
              <h2 className="text-2xl font-semibold mb-6">
                find your college
              </h2>
              <div className="relative">
                <Input
                  placeholder="e.g. University of Washington"
                  value={authData.college}
                  onChange={(e) => handleCollegeInputChange(e.target.value)}
                  onFocus={() => authData.college.length > 0 && setShowCollegeSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCollegeSuggestions(false), 150)}
                  className="text-lg h-12"
                />
                
                {/* Autofill Dropdown */}
                {showCollegeSuggestions && filteredColleges.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                    {filteredColleges.map((college, index) => (
                      <button
                        key={index}
                        onClick={() => handleCollegeSelect(college)}
                        className="w-full text-left px-4 py-3 hover:bg-accent hover:text-accent-foreground text-sm transition-colors"
                      >
                        {college}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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