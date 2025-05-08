
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { User, Settings } from "lucide-react";

const CustomerProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.user_metadata?.name || "Customer",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "",
    address: user?.user_metadata?.address || "",
    preferences: user?.user_metadata?.preferences || "No preferences set"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would update the user profile in Supabase
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully."
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Profile</CardTitle>
          <CardDescription>Manage your personal information and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg" alt="Profile" />
              <AvatarFallback>
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-lg">{profileData.name}</h3>
              <p className="text-sm text-muted-foreground">{profileData.email}</p>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={profileData.name} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  value={profileData.phone} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Input 
                  id="address" 
                  name="address"
                  value={profileData.address} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="preferences">Dietary Preferences</Label>
                <Input 
                  id="preferences" 
                  name="preferences"
                  value={profileData.preferences} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 font-medium">Phone:</div>
                <div className="col-span-2">{profileData.phone || "Not provided"}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 font-medium">Address:</div>
                <div className="col-span-2">{profileData.address || "Not provided"}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 font-medium">Preferences:</div>
                <div className="col-span-2">{profileData.preferences}</div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {isEditing ? (
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Your recent orders and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-center py-6 text-muted-foreground">Your order history will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerProfile;
