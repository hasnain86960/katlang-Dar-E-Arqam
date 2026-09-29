/**
 * Local Media Storage Service
 * Handles media handling locally via base64 data URLs without requiring any external cloud configuration (Cloudinary).
 */

export interface CloudinaryConfig {
  cloudName?: string;
  apiKey?: string;
  uploadPreset?: string;
}

export const CLOUDINARY_DEFAULTS = {
  cloudName: 'local_storage',
  apiKey: '',
  uploadPreset: '',
};

let runtimeCloudinaryConfig: CloudinaryConfig = {
  cloudName: 'local_storage',
  apiKey: '',
  uploadPreset: '',
};

export function setCloudinaryCredentials(_config: Partial<CloudinaryConfig>) {
  // No-op to satisfy existing callers without requiring any inputs
}

export function getCloudinaryConfig(): CloudinaryConfig {
  return runtimeCloudinaryConfig;
}

export interface CloudinaryUploadResult {
  success: boolean;
  url: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  error?: string;
}

/**
 * Convert a File or Blob into a base64 Data URL
 */
function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image or document locally via data URL without external cloud dependencies.
 */
export async function uploadToCloudinary(
  file: File | Blob | string,
  _options: {
    folder?: string;
    resourceType?: 'image' | 'raw' | 'auto';
  } = {}
): Promise<CloudinaryUploadResult> {
  let filePayload: string;
  if (typeof file === 'string') {
    filePayload = file;
  } else {
    try {
      filePayload = await fileToDataUrl(file);
    } catch (err: any) {
      return { success: false, url: '', error: 'Failed to read input file' };
    }
  }

  return {
    success: true,
    url: filePayload,
  };
}

/**
 * Delete asset helper
 */
export async function deleteFromCloudinary(_publicId: string, _resourceType: 'image' | 'raw' = 'image'): Promise<boolean> {
  return true;
}

/**
 * Optimized image URL helper (returns URL directly)
 */
export function getOptimizedImageUrl(
  url: string,
  _options: { width?: number; height?: number; crop?: string; quality?: string | number } = {}
): string {
  return url;
}
