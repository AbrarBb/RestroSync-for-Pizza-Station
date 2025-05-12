
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ProfileData } from "@/integrations/supabase/database.types";
import { safeQuery, safeCast } from "./supabaseHelper";

export const profileService = {
  // Fetch user profile
  getProfile: async (userId: string): Promise<ProfileData | null> => {
    try {
      const { data, error } = await safeQuery('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        // If the error is that no rows were returned, it means the profile doesn't exist yet
        if (error.code === 'PGRST116') {
          console.log('No profile found for user:', userId);
          return null;
        }
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return safeCast<ProfileData>(data);
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  },
  
  // Create or update user profile
  upsertProfile: async (profile: Partial<ProfileData>): Promise<boolean> => {
    try {
      if (!profile.user_id) {
        console.error('Error in upsertProfile: Missing user_id');
        toast({
          title: "Profile update failed",
          description: "User ID is required to update profile",
          variant: "destructive",
        });
        return false;
      }

      // Check if profile already exists
      const { data: existingProfile, error: fetchError } = await safeQuery('profiles')
        .select('id')
        .eq('user_id', profile.user_id)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', fetchError);
        throw fetchError;
      }
      
      if (existingProfile) {
        // Update existing profile
        const { error } = await safeQuery('profiles')
          .update(profile)
          .eq('user_id', profile.user_id);
        
        if (error) throw error;
      } else {
        // Create new profile with generated UUID
        const newProfile = {
          id: crypto.randomUUID(),
          ...profile
        };
        
        const { error } = await safeQuery('profiles')
          .insert(newProfile);
        
        if (error) throw error;
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
  
  // Upload profile avatar - fixed to handle Supabase storage properly
  uploadAvatar: async (userId: string, file: File): Promise<string | null> => {
    try {
      // Generate a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Upload the file to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }
      
      // Get the public URL of the uploaded file
      const { data: publicURLData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      return publicURLData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Avatar upload failed",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }
};
