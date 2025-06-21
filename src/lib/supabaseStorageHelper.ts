
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

export const checkBucketExists = async (bucketName: string): Promise<boolean> => {
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
      console.log(`Bucket '${bucketName}' exists`);
      return true;
    }
    
    console.log(`Bucket '${bucketName}' does not exist`);
    return false;
  } catch (error) {
    console.error(`Error checking bucket '${bucketName}':`, error);
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
    
    // Check if bucket exists first
    const bucketExists = await checkBucketExists(bucketName);
    if (!bucketExists) {
      const errorMsg = `Storage bucket '${bucketName}' does not exist. Please contact administrator to set up storage.`;
      console.error(errorMsg);
      toast({
        title: "Storage not available",
        description: errorMsg,
        variant: "destructive"
      });
      return { url: null, error: errorMsg };
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

// Initialize storage check (but don't auto-create buckets)
export const initializeStorage = async (): Promise<void> => {
  console.log('Checking storage availability...');
  
  try {
    // Just check if buckets exist, don't try to create them
    await checkBucketExists('avatars');
    await checkBucketExists('menu_images');
    
    console.log('Storage check completed');
  } catch (error) {
    console.error('Storage check failed:', error);
  }
};

// Initialize storage when this module is imported
initializeStorage();
