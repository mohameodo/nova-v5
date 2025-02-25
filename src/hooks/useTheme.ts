import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { Theme, themes } from '@/lib/theme';

export const useTheme = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>('default');

  useEffect(() => {
    const loadTheme = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, `users/${user.uid}`));
        const data = userDoc.data();
        if (data?.theme) {
          setTheme(data.theme as Theme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, [user]);

  const updateTheme = async (newTheme: Theme) => {
    if (!user) return;

    setTheme(newTheme);
    try {
      await setDoc(doc(db, `users/${user.uid}`), {
        theme: newTheme
      }, { merge: true });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return { theme, updateTheme, themeConfig: themes[theme] };
};
