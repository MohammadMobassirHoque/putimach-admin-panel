import { AppConfig } from '../types';

export const uploadImageToCloudinary = async (file: File, config: AppConfig): Promise<string> => {
  if (!config.cloudinaryCloudName || !config.cloudinaryUploadPreset) {
    throw new Error("Cloudinary not configured");
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', config.cloudinaryUploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Image upload failed');
  }

  const data = await response.json();
  return data.secure_url;
};

/**
 * Extracts the public_id from a Cloudinary URL.
 * Example: https://res.cloudinary.com/demo/image/upload/v12345/sample.jpg -> sample
 */
const extractPublicId = (url: string): string | null => {
  try {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    const publicIdWithExtension = lastPart.split('?')[0]; // Remove query params
    return publicIdWithExtension.split('.')[0]; // Remove extension
  } catch (e) {
    return null;
  }
};

/**
 * Generates a SHA-1 signature for Cloudinary signed requests
 */
const generateSignature = async (params: string, secret: string): Promise<string> => {
  const msgUint8 = new TextEncoder().encode(params + secret);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const deleteImageFromCloudinary = async (imageUrl: string, config: AppConfig): Promise<boolean> => {
  if (!config.cloudinaryCloudName || !config.cloudinaryApiKey || !config.cloudinaryApiSecret) {
    console.warn("Cloudinary API Key or Secret missing. Skipping remote file deletion.");
    return false;
  }

  const publicId = extractPublicId(imageUrl);
  if (!publicId) return false;

  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = await generateSignature(paramsToSign, config.cloudinaryApiSecret);

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('signature', signature);
  formData.append('api_key', config.cloudinaryApiKey);
  formData.append('timestamp', timestamp.toString());

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const data = await response.json();
    return data.result === 'ok';
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    return false;
  }
};