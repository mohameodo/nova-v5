import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const checkAndUpdateSearchCount = async (userId: string) => {
  const userDoc = await getDoc(doc(db, `users/${userId}`));
  const userData = userDoc.data() || {};
  const today = new Date().toISOString().split('T')[0];

  if (userData.lastSearchDate !== today) {
    // Reset counter for new day
    await setDoc(doc(db, `users/${userId}`), {
      ...userData,
      lastSearchDate: today,
      searchCount: 1
    }, { merge: true });
    return { allowed: true, remaining: 9 };
  }

  if (userData.searchCount >= 10) {
    return { allowed: false, remaining: 0 };
  }

  // Increment counter
  await setDoc(doc(db, `users/${userId}`), {
    ...userData,
    searchCount: (userData.searchCount || 0) + 1
  }, { merge: true });

  return { allowed: true, remaining: 9 - (userData.searchCount || 0) };
};
