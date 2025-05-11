
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ProfileData } from "@/integrations/supabase/database.types";
import { safeQuery } from "./supabaseHelper";

export const profileService = {
  // Fetch user profile
  getProfile: async (userId: string): Promise<ProfileData | null> => {
    try {
      const { data, error } = await safeQuery('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data as ProfileData;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  },
  
  // Create or update user profile
  upsertProfile: async (profile: Partial<ProfileData>): Promise<boolean> => {
    try {
      const { error } = await safeQuery('profiles')
        .upsert(profile, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Profile update failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      return true;
    } catch (error: any) {
      console.error('Error in upsertProfile:', error);
      toast({
        title: "Profile update failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  },
  
  // Upload profile avatar
  uploadAvatar: async (userId: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Avatar upload failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  }
};
