import imageCompression from 'browser-image-compression';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Compresses an image file to a maximum size.
 * @param file The file to compress
 * @param maxSizeMB The maximum size in MB
 */
export async function compressImage(file: File, maxSizeMB: number = 5): Promise<File> {
  const options = {
    maxSizeMB: maxSizeMB,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };
  
  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Compression error:', error);
    return file; // Return original if compression fails
  }
}

/**
 * Uploads a file to Cloudinary using Unsigned Uploads.
 * @param file The file to upload
 * @returns The secure URL of the uploaded image
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration missing');
  }

  // First, compress the image
  const compressedFile = await compressImage(file, 5);

  const formData = new FormData();
  formData.append('file', compressedFile);
  formData.append('upload_preset', UPLOAD_PRESET);
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Upload failed');
  }

  const data = await response.json();
  return data.secure_url;
}
