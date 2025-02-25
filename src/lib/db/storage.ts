import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export const uploadImage = async (userId: string, imageData: string, timestamp: number) => {
  const imagePath = `users/${userId}/images/${timestamp}.jpg`;
  const imageRef = ref(storage, imagePath);
  
  await uploadString(imageRef, imageData, 'data_url');
  const url = await getDownloadURL(imageRef);
  
  return { url, path: imagePath };
};
