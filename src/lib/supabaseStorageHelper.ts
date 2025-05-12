
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
    console.log(`Uploading file to ${bucketName}/${filePath}`, file);
    
    // Ensure file is valid
    if (!file || file.size === 0) {
      throw new Error("Invalid file. Please select a valid file to upload.");
    }
    
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} doesn't exist, creating it...`);
      await createBucket(bucketName, true);
    }
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Set to true to overwrite existing files
      });
    
    if (error) {
      console.error(`Error uploading to ${bucketName}:`, error);
      throw error;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data?.path || filePath);
    
    console.log(`File uploaded successfully, URL: ${urlData.publicUrl}`);
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

/**
 * Get a file from a storage bucket
 */
export const getFileUrl = (bucketName: string, filePath: string): string => {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

// Initialize storage buckets on app load
export const setupStorage = () => {
  initializeStorage()
    .then(success => {
      if (success) {
        console.log('Supabase storage successfully initialized');
      } else {
        console.warn('Supabase storage initialization had issues');
        // Try again after a short delay
        setTimeout(() => {
          initializeStorage()
            .then(retry => console.log('Retry initialization result:', retry))
            .catch(err => console.error('Retry initialization failed:', err));
        }, 2000);
      }
    })
    .catch(error => {
      console.error('Failed to initialize storage:', error);
    });
};
