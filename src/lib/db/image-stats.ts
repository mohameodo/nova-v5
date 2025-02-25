import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';

export interface ImageStats {
  dailyUploads: number;
  lastUpload: Date;
}

export const updateImageStats = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];
  const statsRef = doc(db, `users/${userId}/imageStats/${today}`);

  try {
    const statsDoc = await getDoc(statsRef);
    
    if (!statsDoc.exists()) {
      // Create new stats for today
      await setDoc(statsRef, {
        dailyUploads: 1,
        lastUpload: new Date()
      });
    } else {
      // Update existing stats
      await setDoc(statsRef, {
        dailyUploads: increment(1),
        lastUpload: new Date()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error updating image stats:', error);
    throw error;
  }
};

export const getDailyUploads = async (userId: string): Promise<number> => {
  const today = new Date().toISOString().split('T')[0];
  const statsRef = doc(db, `users/${userId}/imageStats/${today}`);
  
  try {
    const statsDoc = await getDoc(statsRef);
    return statsDoc.exists() ? statsDoc.data().dailyUploads : 0;
  } catch (error) {
    console.error('Error getting daily uploads:', error);
    return 0;
  }
};
