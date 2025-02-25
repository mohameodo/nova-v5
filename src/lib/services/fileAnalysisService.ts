import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface AnalysisResult {
  type: string;
  summary: string;
  details: {
    [key: string]: any;
  };
}

const MAX_TOKENS_PER_MESSAGE = 100000; // Set reasonable limit
const IMAGE_COMPRESSION_SIZE = 800; // Max width/height for images

export const analyzeFile = async (file: File): Promise<AnalysisResult> => {
  const fileType = file.type.split('/')[0];
  const fileExt = file.name.split('.').pop()?.toLowerCase();

  // Upload file to Firebase Storage
  const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  switch (fileType) {
    case 'image':
      return analyzeImage(url);
    case 'application':
      return analyzeDocument(url, fileExt);
    default:
      throw new Error('Unsupported file type');
  }
};

export const storeFileInFirebase = async (file: File, userId: string): Promise<string> => {
  try {
    // Compress and convert image to JPEG
    if (file.type.startsWith('image/')) {
      const compressedFile = await compressImage(file);
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(compressedFile);
      });

      // Return data URL directly for immediate use
      return dataUrl;
    }

    // For non-image files
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `user-uploads/${userId}/${timestamp}-${safeFileName}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error handling file:', error);
    throw new Error('Failed to process file. Please try again.');
  }
};

const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Resize to max 800x800 while maintaining aspect ratio
      if (width > 800 || height > 800) {
        const ratio = Math.min(800 / width, 800 / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          }
        },
        'image/jpeg',
        0.8
      );
    };
    img.src = URL.createObjectURL(file);
  });
};

const analyzeImage = async (url: string): Promise<AnalysisResult> => {
  // TODO: Integrate with Google Cloud Vision or similar
  return {
    type: 'image',
    summary: 'Image analysis results',
    details: {
      objects: [],
      text: '',
      faces: [],
      colors: [],
      url
    }
  };
};

const analyzeDocument = async (url: string, ext?: string): Promise<AnalysisResult> => {
  // TODO: Integrate with document processing API
  return {
    type: 'document',
    summary: 'Document analysis results',
    details: {
      text: '',
      keywords: [],
      summary: '',
      url
    }
  };
};
