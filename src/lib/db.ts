import { db } from './firebase';
import { collection, addDoc, query, where, orderBy, getDocs, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

export const saveChat = async (userId: string, messages: any[], model: string) => {
  const chatRef = collection(db, `users/${userId}/chats`);
  return addDoc(chatRef, {
    createdAt: new Date(),
    model,
    messages,
    lastMessage: messages[messages.length - 1].content
  });
};

export const getUserChats = async (userId: string) => {
  const chatsRef = collection(db, `users/${userId}/chats`);
  const q = query(chatsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const searchChats = async (userId: string, searchTerm: string) => {
  try {
    const chatsRef = collection(db, `users/${userId}/chats`);
    const q = query(
      chatsRef,
      where('searchableContent', 'array-contains', searchTerm.toLowerCase()),
      orderBy('updatedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

export const getChat = async (userId: string, chatId: string) => {
  const chatRef = doc(db, `users/${userId}/chats/${chatId}`);
  const chatDoc = await getDoc(chatRef);
  if (!chatDoc.exists()) return null;
  return { id: chatDoc.id, ...chatDoc.data() };
};

export const checkAndUpdateImageCount = async (userId: string): Promise<boolean> => {
  const userDoc = doc(db, `users/${userId}`);
  const userSnap = await getDoc(userDoc);
  const today = new Date().toISOString().split('T')[0];
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    if (data.lastImageDate === today && data.imageCount >= 10) {
      return false; // Limit reached
    }
    
    if (data.lastImageDate !== today) {
      await updateDoc(userDoc, {
        imageCount: 1,
        lastImageDate: today
      });
    } else {
      await updateDoc(userDoc, {
        imageCount: increment(1)
      });
    }
  } else {
    await setDoc(userDoc, {
      imageCount: 1,
      lastImageDate: today
    }, { merge: true });
  }
  
  return true;
};

export const saveFeedback = async (userId: string, messageId: string, feedback: {
  liked?: boolean;
  disliked?: boolean;
}) => {
  try {
    const feedbackRef = doc(db, `users/${userId}/feedback/${messageId}`);
    await setDoc(feedbackRef, {
      ...feedback,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving feedback:', error);
  }
};
