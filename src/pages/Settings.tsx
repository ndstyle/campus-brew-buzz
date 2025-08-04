import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Camera,
  MapPin,
  GraduationCap
} from "lucide-react";

const Settings = () => {
  const [notifications, setNotifications] = useState({
    reviews: true,
    likes: true,
    comments: false,
    newCafes: true
  });

  const user = {
    name: "Sarah Chen",
    username: "@sarahc",
    email: "sarah.chen@nyu.edu",
    university: "NYU",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612c108?w=64&h=64&fit=crop&crop=face",
    location: "New York, NY"
  };

  const settingSections = [
    {
      title: "Account",
      icon: User,
      items: [
        { label: "Edit Profile", action: "profile" },
        { label: "Change Password", action: "password" },
        { label: "Email Preferences", action: "email" }
      ]
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      items: [
        { label: "Privacy Settings", action: "privacy" },
        { label: "Blocked Users", action: "blocked" },
        { label: "Data & Analytics", action: "data" }
      ]
    },
    {
      title: "Support",
      icon: HelpCircle,
      items: [
        { label: "Help Center", action: "help" },
        { label: "Contact Support", action: "contact" },
        { label: "Report a Problem", action: "report" }
      ]
    }
  ];

  return (
    <div className="mobile-container bg-background min-h-screen">
      <div className="mobile-safe-area py-6 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        {/* Profile Card */}
        <Card className="p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1">
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground text-lg">{user.name}</h3>
              <p className="text-muted-foreground text-sm">{user.username}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  {user.university}
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 mr-1" />
                  {user.location}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-4 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">New Reviews</p>
                <p className="text-sm text-muted-foreground">Get notified when friends post reviews</p>
              </div>
              <Switch 
                checked={notifications.reviews}
                onCheckedChange={(checked) => setNotifications({...notifications, reviews: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Likes & Reactions</p>
                <p className="text-sm text-muted-foreground">When someone likes your reviews</p>
              </div>
              <Switch 
                checked={notifications.likes}
                onCheckedChange={(checked) => setNotifications({...notifications, likes: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Comments</p>
                <p className="text-sm text-muted-foreground">When someone comments on your reviews</p>
              </div>
              <Switch 
                checked={notifications.comments}
                onCheckedChange={(checked) => setNotifications({...notifications, comments: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">New Cafes</p>
                <p className="text-sm text-muted-foreground">Discover new cafes near your campus</p>
              </div>
              <Switch 
                checked={notifications.newCafes}
                onCheckedChange={(checked) => setNotifications({...notifications, newCafes: checked})}
              />
            </div>
          </div>
        </Card>

        {/* Settings Sections */}
        {settingSections.map((section, index) => (
          <Card key={index} className="p-4 mb-4">
            <div className="flex items-center space-x-3 mb-3">
              <section.icon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
            </div>
            <div className="space-y-2">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="font-medium text-foreground">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </Card>
        ))}

        {/* Sign Out */}
        <Button variant="destructive" className="w-full h-12 mb-6" size="lg">
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