
import { supabase } from "@/integrations/supabase/client";

/**
 * Create a storage bucket if it doesn't exist
 */
export const ensureBucketExists = async (bucketName: string, isPublic: boolean = false) => {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic
      });
      
      if (error) {
        console.error(`Error creating bucket ${bucketName}:`, error);
        return false;
      }
      console.log(`Bucket ${bucketName} created successfully`);
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    return false;
  }
};

// Initialize storage with required buckets
export const initStorage = async () => {
  await ensureBucketExists('avatars', true);
  await ensureBucketExists('menu_images', true);
};
