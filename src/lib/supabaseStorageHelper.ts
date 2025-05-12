
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Create a storage bucket if it doesn't exist
 * This function should be called at app startup
 */
export const initializeStorage = async () => {
  console.log('Initializing Supabase storage buckets...');
  
  try {
    // Get list of existing buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return false;
    }
    
    // Check for required buckets
    const requiredBuckets = ['avatars', 'menu_images', 'reports'];
    const existingBucketNames = buckets?.map(b => b.name) || [];
    
    // Create any missing buckets
    for (const bucketName of requiredBuckets) {
      if (!existingBucketNames.includes(bucketName)) {
        console.log(`Creating bucket: ${bucketName}`);
        await createBucket(bucketName);
      }
    }
    
    console.log('Storage initialization complete');
    return true;
  } catch (error) {
    console.error('Storage initialization failed:', error);
    return false;
  }
};

/**
 * Create a new storage bucket
 */
export const createBucket = async (bucketName: string, isPublic: boolean = true) => {
  try {
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: isPublic,
      fileSizeLimit: 10485760, // 10MB
    });
    
    if (error) {
      console.error(`Error creating bucket ${bucketName}:`, error);
      return false;
    }
    
    console.log(`Bucket ${bucketName} created successfully`);
    return true;
  } catch (error) {
    console.error(`Error creating bucket ${bucketName}:`, error);
    return false;
  }
};

/**
 * Upload a file to a storage bucket
 */
export const uploadFile = async (
  bucketName: string, 
  filePath: string, 
  file: File
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error(`Error uploading to ${bucketName}:`, error);
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('File upload error:', error);
    toast({
      title: "Upload failed",
      description: error.message || "File upload failed. Please try again.",
      variant: "destructive",
    });
    return null;
  }
};

// Initialize storage buckets on app load
export const setupStorage = () => {
  initializeStorage()
    .then(success => {
      if (success) {
        console.log('Supabase storage successfully initialized');
      } else {
        console.warn('Supabase storage initialization had issues');
      }
    })
    .catch(error => {
      console.error('Failed to initialize storage:', error);
    });
};
