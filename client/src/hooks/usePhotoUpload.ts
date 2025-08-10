import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const usePhotoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const validatePhoto = (file: File): { valid: boolean; error?: string } => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'Photo must be smaller than 10MB' };
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Photo must be JPG or PNG format' };
    }

    return { valid: true };
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!user) {
      toast.error('Authentication required');
      return null;
    }

    const validation = validatePhoto(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid photo');
      return null;
    }

    setUploading(true);
    try {
      console.log('📸 [PHOTO UPLOAD] Starting upload for file:', file.name);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${uuidv4()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('review-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ [PHOTO UPLOAD] Upload failed:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('review-photos')
        .getPublicUrl(data.path);

      console.log('✅ [PHOTO UPLOAD] Upload successful, URL:', publicUrl);
      toast.success('Photo uploaded successfully');
      
      return publicUrl;
    } catch (error: any) {
      console.error('❌ [PHOTO UPLOAD] Error:', error);
      toast.error(error.message || 'Photo upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadPhoto,
    uploading,
    validatePhoto
  };
};