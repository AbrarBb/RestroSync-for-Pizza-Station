import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ProfileData } from "@/integrations/supabase/database.types";
import { safeQuery, safeCast } from "./supabaseHelper";
import { uploadFile } from "./supabaseStorageHelper";

export const profileService = {
  // Fetch user profile
  getProfile: async (userId: string): Promise<ProfileData | null> => {
    try {
      console.log('Fetching profile for user:', userId);
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
      
      console.log('Profile fetched successfully:', data);
      return safeCast<ProfileData>(data);
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  },
  
  // Create or update user profile
  upsertProfile: async (profile: Partial<ProfileData>): Promise<boolean> => {
    try {
      console.log('Upserting profile:', profile);
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
        console.log('Updating existing profile');
        const { error } = await safeQuery('profiles')
          .update(profile)
          .eq('user_id', profile.user_id);
        
        if (error) throw error;
      } else {
        // Create new profile with generated UUID
        console.log('Creating new profile');
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
  
  // Upload profile avatar - improved to handle errors better
  uploadAvatar: async (userId: string, file: File): Promise<string | null> => {
    try {
      console.log('Uploading avatar for user:', userId, file);
      
      // Validate file
      if (!file || file.size === 0) {
        throw new Error("Please select a valid image file");
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error("Please select a valid image file (JPEG, PNG, GIF, or WEBP)");
      }
      
      // Generate a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      // Direct upload to supabase storage to bypass potential issues with helper
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Error uploading avatar to storage:', error);
        throw error;
      }
      
      // Get public URL directly
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(data?.path || filePath);
      
      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded avatar');
      }
      
      const publicUrl = urlData.publicUrl;
      console.log('Avatar uploaded successfully, URL:', publicUrl);
      
      // Update user profile with new avatar URL
      await profileService.upsertProfile({
        user_id: userId,
        avatar_url: publicUrl
      });
      
      return publicUrl;
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
