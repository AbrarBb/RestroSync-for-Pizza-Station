
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { User, Settings, Upload, Loader2 } from "lucide-react";
import { profileService } from "@/lib/profileService";
import { ProfileData } from "@/integrations/supabase/database.types";

const StaffProfile = () => {
  const { user, userRole } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState<Partial<ProfileData>>({
    full_name: "",
    phone: "",
    avatar_url: null
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    setIsLoading(true);
    if (user) {
      const profile = await profileService.getProfile(user.id);
      if (profile) {
        setProfileData({
          ...profile
        });
      } else {
        setProfileData({
          user_id: user.id,
          full_name: user.user_metadata?.name || "",
          avatar_url: user.user_metadata?.avatar_url || null,
          phone: ""
        });
      }
    }
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    const dataToSave = {
      user_id: user.id,
      ...profileData
    };
    
    const success = await profileService.upsertProfile(dataToSave);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 2MB",
        variant: "destructive"
      });
      setIsUploading(false);
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      setIsUploading(false);
      return;
    }
    
    const avatarUrl = await profileService.uploadAvatar(user.id, file);
    if (avatarUrl) {
      setProfileData(prev => ({
        ...prev,
        avatar_url: avatarUrl
      }));
      
      await profileService.upsertProfile({
        user_id: user.id,
        ...profileData,
        avatar_url: avatarUrl
      });
    }
    
    setIsUploading(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{userRole === "admin" ? "Admin" : "Staff"} Profile</CardTitle>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileData.avatar_url || ""} alt="Profile" />
                <AvatarFallback>
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              
              {!isUploading ? (
                <div className="absolute bottom-0 right-0">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="bg-primary text-primary-foreground p-1 rounded-full">
                      <Upload className="h-4 w-4" />
                    </div>
                  </Label>
                  <Input 
                    id="avatar-upload" 
                    type="file" 
                    className="hidden" 
                    onChange={handleAvatarUpload} 
                    accept="image/*"
                  />
                </div>
              ) : (
                <div className="absolute bottom-0 right-0">
                  <div className="bg-primary text-primary-foreground p-1 rounded-full">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-lg">
                {profileData.full_name || (userRole === "admin" ? "Admin" : "Staff")}
              </h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize font-medium">
                {userRole} Role
              </p>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input 
                  id="full_name" 
                  name="full_name"
                  value={profileData.full_name || ""} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  value={profileData.phone || ""} 
                  onChange={handleChange} 
                  placeholder="+880"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 font-medium">Name:</div>
                <div className="col-span-2">{profileData.full_name || "Not set"}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 font-medium">Email:</div>
                <div className="col-span-2">{user?.email}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 font-medium">Phone:</div>
                <div className="col-span-2">{profileData.phone || "Not provided"}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 font-medium">Role:</div>
                <div className="col-span-2 capitalize">{userRole}</div>
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
    </div>
  );
};

export default StaffProfile;
