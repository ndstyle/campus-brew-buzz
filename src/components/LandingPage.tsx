import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const coffeeShops = [
    {
      name: "Copa Vida",
      university: "UCSD",
      location: "San Diego",
      image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop"
    },
    {
      name: "Whistle & Fizz", 
      university: "NYU",
      location: "New York City",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop"
    }
  ];

  const features = [
    {
      title: "rate",
      description: "rate every latte, matcha, or cold brew you try, your way"
    },
    {
      title: "discover", 
      description: "find hidden gems and trending spots near your campus"
    },
    {
      title: "share",
      description: "connect with friends and see what everyone's drinking"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % coffeeShops.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + coffeeShops.length) % coffeeShops.length);
  };

  return (
    <div className="mobile-container bg-background">
      <div className="mobile-safe-area py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            rate<span className="text-primary">ur</span>coffee
          </h1>
          <p className="text-muted-foreground text-lg">
            rate, discover, and share
          </p>
        </div>

        {/* Hero Section - Coffee Shop Cards */}
        <div className="mb-8">
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevSlide}
                className="rounded-full"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <div className="flex-1 mx-4">
                <Card className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={coffeeShops[currentSlide].image}
                      alt={coffeeShops[currentSlide].name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <h3 className="text-white font-semibold text-lg">
                        {coffeeShops[currentSlide].name}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {coffeeShops[currentSlide].university}, {coffeeShops[currentSlide].location}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextSlide}
                className="rounded-full"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center space-x-2">
              {coffeeShops.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mb-8">
          <div className="text-center">
            <div className="bg-accent rounded-xl p-6 mb-4">
              <h3 className="text-primary font-semibold text-xl mb-2">
                {features[0].title}
              </h3>
              <p className="text-accent-foreground text-sm">
                {features[0].description}
              </p>
            </div>
            
            {/* Feature dots indicator */}
            <div className="flex justify-center space-x-2">
              {features.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === 0 ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button className="w-full h-12 text-lg font-medium">
            sign up • login
          </Button>
          
          <p className="text-xs text-muted-foreground text-center px-4">
            by signing up, you accept our{" "}
            <span className="underline">terms of service</span> and{" "}
            <span className="underline">privacy policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;