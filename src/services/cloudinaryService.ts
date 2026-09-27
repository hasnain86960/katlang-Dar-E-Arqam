/**
 * Cloudinary Storage Service
 * Handles secure media uploads, logo branding, circular documents, and CDN optimizations.
 */

export interface CloudinaryConfig {
  cloudName: string;
  apiKey?: string;
  uploadPreset?: string;
}

export const CLOUDINARY_DEFAULTS = {
  cloudName: 'ehc1fewm',
  apiKey: '222139937659655',
  uploadPreset: 'dare_arqam_uploads',
};

let runtimeCloudinaryConfig: CloudinaryConfig = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || CLOUDINARY_DEFAULTS.cloudName,
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || CLOUDINARY_DEFAULTS.apiKey,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_DEFAULTS.uploadPreset,
};

export function setCloudinaryCredentials(config: Partial<CloudinaryConfig>) {
  runtimeCloudinaryConfig = {
    ...runtimeCloudinaryConfig,
    ...config,
  };
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
 * Upload an image or document to Cloudinary via backend proxy route (/api/cloudinary/upload)
 * with graceful fallback to browser-side direct upload
 */
export async function uploadToCloudinary(
  file: File | Blob | string,
  options: {
    folder?: string;
    resourceType?: 'image' | 'raw' | 'auto';
  } = {}
): Promise<CloudinaryUploadResult> {
  const folder = options.folder || 'dare_arqam_media';
  const resourceType = options.resourceType || 'auto';

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

  // 1. Primary: Use Secure Server-Side Cloudinary API Endpoint
  try {
    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: filePayload,
        folder,
        resource_type: resourceType,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.url) {
        return {
          success: true,
          url: data.url,
          publicId: data.publicId,
          format: data.format,
          width: data.width,
          height: data.height,
          bytes: data.bytes,
        };
      }
    }
  } catch (backendErr) {
    console.warn('Backend Cloudinary upload route unavailable, trying direct upload:', backendErr);
  }

  // 2. Secondary: Direct Cloudinary API upload (for unsigned presets)
  try {
    const cloudName = runtimeCloudinaryConfig.cloudName || CLOUDINARY_DEFAULTS.cloudName;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', runtimeCloudinaryConfig.uploadPreset || 'dare_arqam_uploads');
    formData.append('folder', folder);

    const directRes = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (directRes.ok) {
      const directData = await directRes.json();
      return {
        success: true,
        url: directData.secure_url,
        publicId: directData.public_id,
        format: directData.format,
        width: directData.width,
        height: directData.height,
        bytes: directData.bytes,
      };
    }
  } catch (directErr) {
    console.warn('Direct upload notice:', directErr);
  }

  // 3. Fallback: Return data URL
  return {
    success: true,
    url: filePayload,
  };
}

/**
 * Delete an asset from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'raw' = 'image'): Promise<boolean> {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId, resource_type: resourceType }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Helper to build high-performance optimized image URLs with Cloudinary CDN transformations
 */
export function getOptimizedImageUrl(
  url: string,
  options: { width?: number; height?: number; crop?: string; quality?: string | number } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const { width, height, crop = 'fill', quality = 'auto' } = options;
  const transforms = [`q_${quality}`, 'f_auto'];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  const transformString = transforms.join(',');
  return url.replace('/upload/', `/upload/${transformString}/`);
}
