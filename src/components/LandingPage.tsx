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
    <div className="mobile-container bg-background min-h-screen">
      <div className="mobile-safe-area py-8 px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-3">
            rate<span className="text-primary">ur</span>coffee
          </h1>
          <p className="text-muted-foreground text-xl">
            rate, discover, and share
          </p>
        </div>

        {/* Hero Section - Coffee Shop Cards */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Left Card */}
            <div className="relative">
              <Card className="w-40 h-52 overflow-hidden bg-black rounded-3xl">
                <div className="relative h-full">
                  <img
                    src={coffeeShops[0].image}
                    alt={coffeeShops[0].name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-semibold text-lg mb-1">
                      {coffeeShops[0].name}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {coffeeShops[0].university}, {coffeeShops[0].location}
                    </p>
                  </div>
                  {/* Navigation arrows */}
                  <button 
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            </div>

            {/* Right Card */}
            <div className="relative">
              <Card className="w-40 h-52 overflow-hidden bg-black rounded-3xl">
                <div className="relative h-full">
                  <img
                    src={coffeeShops[1].image}
                    alt={coffeeShops[1].name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="font-semibold text-lg mb-1">
                      {coffeeShops[1].name}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {coffeeShops[1].university}, {coffeeShops[1].location}
                    </p>
                  </div>
                  {/* Navigation arrows */}
                  <button 
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mb-12">
          <div className="bg-background border border-border rounded-2xl p-6 mb-6">
            <h3 className="text-primary font-semibold text-3xl mb-3">
              {features[0].title}
            </h3>
            <p className="text-foreground text-lg leading-relaxed">
              {features[0].description}
            </p>
          </div>
          
          {/* Feature dots indicator */}
          <div className="flex justify-center space-x-2">
            {features.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === 0 ? "bg-foreground" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-6">
          <Button className="w-full h-14 text-xl font-medium rounded-full">
            sign up • login
          </Button>
          
          <p className="text-sm text-muted-foreground text-center px-4">
            by signing up, you accept our{" "}
            <span className="text-primary underline">terms of service</span> and{" "}
            <span className="text-primary underline">privacy policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;