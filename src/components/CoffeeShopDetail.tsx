import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Globe, Phone, Calendar } from "lucide-react";

const CoffeeShopDetail = () => {
  return (
    <div className="mobile-container bg-background pb-20 min-h-screen">
      <div className="mobile-safe-area">
        {/* Map Section */}
        <div className="h-40 bg-blue-100 relative mb-4">
          {/* Mock Mini Map */}
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-200 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            {/* Mock streets */}
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-px bg-gray-400 absolute top-1/3"></div>
              <div className="w-full h-px bg-gray-400 absolute top-2/3"></div>
              <div className="h-full w-px bg-gray-400 absolute left-1/3"></div>
              <div className="h-full w-px bg-gray-400 absolute left-2/3"></div>
            </div>
          </div>
        </div>

        <div className="px-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-muted rounded-full text-sm">Casual Dinner</span>
            <span className="px-3 py-1 bg-muted rounded-full text-sm">Date Night</span>
            <span className="px-3 py-1 bg-muted rounded-full text-sm">Outdoor Seating</span>
            <span className="px-3 py-1 bg-muted rounded-full text-sm">Lunch</span>
          </div>

          {/* Restaurant Info */}
          <div className="mb-4">
            <p className="text-lg font-medium text-muted-foreground mb-1">$$ | Italian, Pizza</p>
            <p className="text-muted-foreground">South Village, New York, NY</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-around mb-6">
            <Button variant="outline" size="sm" className="flex flex-col items-center p-4 h-auto">
              <Globe className="w-6 h-6 mb-1" />
              <span className="text-xs">Website</span>
            </Button>
            <Button variant="outline" size="sm" className="flex flex-col items-center p-4 h-auto">
              <Phone className="w-6 h-6 mb-1" />
              <span className="text-xs">Call</span>
            </Button>
            <Button variant="outline" size="sm" className="flex flex-col items-center p-4 h-auto">
              <Calendar className="w-6 h-6 mb-1" />
              <span className="text-xs">Reserve</span>
            </Button>
          </div>

          {/* Scores Section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Scores</h3>
            
            <div className="flex justify-between mb-4">
              <Card className="flex-1 mr-2 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-bold text-green-600">8.3</div>
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">2k</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Rec Score</p>
                  <p className="text-xs text-muted-foreground">How much we think you will like it</p>
                </div>
              </Card>

              <Card className="flex-1 ml-2 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-bold text-green-600">8.2</div>
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                </div>
                <div>
                  <p className="font-medium">Friend Score</p>
                  <p className="text-xs text-muted-foreground">What your friends think</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Popular Dishes */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Popular dishes</h3>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold">See all photos</span>
                <span className="text-2xl">→</span>
              </div>
            </div>
            
            <div className="flex space-x-3 overflow-x-auto">
              <img
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=120&h=120&fit=crop"
                alt="Pizza"
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
              <img
                src="https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=120&h=120&fit=crop"
                alt="Pasta"
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
            </div>
          </div>

          {/* All Photos Link */}
          <div className="text-right">
            <span className="text-lg font-semibold">All photos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoffeeShopDetail;