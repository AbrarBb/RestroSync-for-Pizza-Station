
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
  
  // Upload profile avatar
  uploadAvatar: async (userId: string, file: File): Promise<string | null> => {
    try {
      // First, ensure the avatars bucket exists
      await ensureStorageBucketExists('avatars');
      
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

// Helper function to ensure the storage bucket exists
const ensureStorageBucketExists = async (bucketName: string) => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // If bucket doesn't exist, create it
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true
      });
      
      if (error) {
        console.error(`Error creating bucket ${bucketName}:`, error);
      }
    }
  } catch (error) {
    console.error(`Error ensuring bucket ${bucketName} exists:`, error);
  }
};
