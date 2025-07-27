import { Button } from "@/components/ui/button";
import { Bell, Menu } from "lucide-react";

const MapPage = () => {
  return (
    <div className="mobile-container bg-background min-h-screen relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between py-4 px-4">
          <h1 className="text-xl font-bold">
            rate<span className="text-primary">ur</span>coffee
          </h1>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-screen bg-blue-100 relative">
        {/* Mock Map Background */}
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-200 relative overflow-hidden">
          {/* Mock Street Grid */}
          <svg className="absolute inset-0 w-full h-full opacity-30">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#9CA3AF" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* New York Label */}
          <div className="absolute top-32 left-1/2 -translate-x-1/2">
            <span className="text-2xl font-light text-gray-500">New York</span>
          </div>

          {/* Coffee Shop Pins */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>

          <div className="absolute top-1/3 left-1/3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>

          <div className="absolute top-2/3 left-2/3">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>

          <div className="absolute top-1/4 right-1/4">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>

          <div className="absolute bottom-1/3 left-1/4">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>

          {/* Mock Areas */}
          <div className="absolute top-20 right-8 text-sm text-gray-500">BROOKLYN</div>
          <div className="absolute top-40 left-8 text-sm text-gray-500">MANHATTAN</div>
          <div className="absolute bottom-40 right-16 text-sm text-gray-500">QUEENS</div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;