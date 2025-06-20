
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Enhanced storage service for handling file uploads and management
 */

// Define bucket configurations
const BUCKET_CONFIGS = {
  avatars: {
    name: 'avatars',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },
  menu_images: {
    name: 'menu_images', 
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
  }
};

export const ensureBucketExists = async (bucketName: string, isPublic: boolean = true): Promise<boolean> => {
  try {
    console.log(`Checking if bucket '${bucketName}' exists...`);
    
    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    // Check if bucket already exists
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`Bucket '${bucketName}' already exists`);
      return true;
    }
    
    // Create the bucket if it doesn't exist
    console.log(`Creating bucket '${bucketName}'...`);
    const { data: createData, error: createError } = await supabase.storage.createBucket(bucketName, {
      public: isPublic,
      allowedMimeTypes: BUCKET_CONFIGS[bucketName as keyof typeof BUCKET_CONFIGS]?.allowedMimeTypes,
      fileSizeLimit: BUCKET_CONFIGS[bucketName as keyof typeof BUCKET_CONFIGS]?.maxFileSize
    });
    
    if (createError) {
      console.error(`Error creating bucket '${bucketName}':`, createError);
      toast({
        title: "Storage setup failed",
        description: `Failed to create ${bucketName} bucket: ${createError.message}`,
        variant: "destructive"
      });
      return false;
    }
    
    console.log(`Bucket '${bucketName}' created successfully:`, createData);
    return true;
  } catch (error) {
    console.error(`Unexpected error with bucket '${bucketName}':`, error);
    return false;
  }
};

export const uploadFile = async (
  bucketName: string, 
  filePath: string, 
  file: File
): Promise<{ url: string | null; error: string | null }> => {
  try {
    console.log(`Uploading file to ${bucketName}/${filePath}...`);
    
    // Ensure bucket exists first
    const bucketReady = await ensureBucketExists(bucketName, true);
    if (!bucketReady) {
      return { url: null, error: `Bucket ${bucketName} is not ready` };
    }
    
    // Validate file type and size
    const config = BUCKET_CONFIGS[bucketName as keyof typeof BUCKET_CONFIGS];
    if (config) {
      if (!config.allowedMimeTypes.includes(file.type)) {
        return { url: null, error: `File type ${file.type} not allowed` };
      }
      
      if (file.size > config.maxFileSize) {
        return { url: null, error: `File size exceeds ${config.maxFileSize / 1024 / 1024}MB limit` };
      }
    }
    
    // Remove existing file if it exists (for updates)
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (deleteError) {
      console.log('No existing file to delete or deletion failed:', deleteError.message);
    }
    
    // Upload the new file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { url: null, error: uploadError.message };
    }
    
    console.log('File uploaded successfully:', uploadData);
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    if (!urlData?.publicUrl) {
      console.error('Failed to get public URL for uploaded file');
      return { url: null, error: 'Failed to get public URL' };
    }
    
    console.log('Public URL generated:', urlData.publicUrl);
    return { url: urlData.publicUrl, error: null };
    
  } catch (error: any) {
    console.error('Unexpected upload error:', error);
    return { url: null, error: error.message || 'Unexpected error during upload' };
  }
};

export const deleteFile = async (bucketName: string, filePath: string): Promise<boolean> => {
  try {
    console.log(`Deleting file from ${bucketName}/${filePath}...`);
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      console.error('Delete error:', error);
      return false;
    }
    
    console.log('File deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Unexpected delete error:', error);
    return false;
  }
};

export const getPublicUrl = (bucketName: string, filePath: string): string => {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

// Initialize all required storage buckets
export const setupStorage = async (): Promise<void> => {
  console.log('Setting up storage buckets...');
  
  try {
    // Create avatars bucket
    await ensureBucketExists('avatars', true);
    
    // Create menu images bucket
    await ensureBucketExists('menu_images', true);
    
    console.log('Storage setup completed successfully');
  } catch (error) {
    console.error('Storage setup failed:', error);
    toast({
      title: "Storage initialization failed",
      description: "Some features may not work properly. Please contact support.",
      variant: "destructive"
    });
  }
};

// Auto-setup storage when this module is imported
setupStorage();
