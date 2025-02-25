import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Camera, 
  Download, 
  ArrowLeft, 
  User, 
  Mail, 
  Lock,
  Globe,
  Database,
  Moon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    displayName: user?.displayName || '',
    username: '',
    email: user?.email || '',
    photoURL: user?.photoURL || '',
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ')[1] || '',
    bio: '',
  });

  const [preferences, setPreferences] = useState({
    offlineMode: localStorage.getItem('offlineMode') === 'true',
    darkMode: localStorage.getItem('theme') === 'dark',
    notifications: true,
  });

  // Fetch additional user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [user]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsLoading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      await Promise.all([
        updateProfile(user, { photoURL }),
        updateDoc(doc(db, 'users', user.uid), { photoURL })
      ]);

      setUserData(prev => ({ ...prev, photoURL }));
      toast({ description: "Profile picture updated" });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to update profile picture"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const displayName = `${userData.firstName} ${userData.lastName}`.trim();
      await Promise.all([
        updateProfile(user, { displayName }),
        updateDoc(doc(db, 'users', user.uid), {
          displayName,
          username: userData.username,
          bio: userData.bio,
          updatedAt: new Date().toISOString()
        })
      ]);
      toast({ description: "Profile updated successfully" });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to update profile"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOfflineModeToggle = (enabled: boolean) => {
    setPreferences(prev => ({ ...prev, offlineMode: enabled }));
    localStorage.setItem('offlineMode', String(enabled));
    
    toast({
      title: enabled ? "Offline Mode Enabled" : "Offline Mode Disabled",
      description: enabled ? "Basic features will work offline" : "Back to online mode"
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#1d1e20] p-4 md:p-8 overflow-y-auto scrollbar-hide"
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Separator />

        {/* Profile Section */}
        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </h2>

          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={userData.photoURL || '/default-avatar.png'}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
              />
              <label className="absolute bottom-0 right-0 p-2 bg-gray-800 rounded-full cursor-pointer hover:bg-gray-700 transition-colors">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={isLoading}
                />
              </label>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={userData.firstName}
                  onChange={e => setUserData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="bg-gray-800/50"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={userData.lastName}
                  onChange={e => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="bg-gray-800/50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={userData.username}
                onChange={e => setUserData(prev => ({ ...prev, username: e.target.value }))}
                className="bg-gray-800/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={userData.email}
                disabled
                className="bg-gray-800/50 opacity-50"
              />
            </div>
          </div>

          {/* Change Bio to About section */}
          <div className="space-y-2">
            <Label>About Me</Label>
            <p className="text-sm text-gray-400 mb-2">
              Help Nova understand you better. Share your interests, preferences, and anything that would help personalize your experience.
            </p>
            <textarea
              value={userData.bio}
              onChange={e => setUserData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="E.g., I'm a software developer interested in AI and machine learning. I prefer detailed technical explanations and practical examples..."
              className="w-full h-32 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-md"
            />
          </div>

          <Button 
            onClick={handleProfileUpdate}
            disabled={isLoading}
            className="w-full"
          >
            Save Changes
          </Button>
        </motion.section>

        <Separator />

        {/* Preferences Section with improved toggle visibility */}
        <motion.section className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Preferences
          </h2>

          <div className="space-y-6 bg-gray-800/30 rounded-lg p-6">
            {/* Offline Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors">
              <div className="space-y-1">
                <Label className="text-base font-semibold">Offline Mode</Label>
                <p className="text-sm text-gray-400">Enable offline functionality and data caching</p>
              </div>
              <Switch
                checked={preferences.offlineMode}
                onCheckedChange={handleOfflineModeToggle}
                disabled={isLoading}
              />
            </div>
            
            {preferences.offlineMode && (
              <div className="p-4 bg-blue-900/20 rounded-lg">
                <h3 className="text-sm font-medium text-blue-400 mb-2">Offline Features Available:</h3>
                <ul className="text-sm text-gray-300 space-y-1 ml-4 list-disc">
                  <li>Basic chat functionality</li>
                  <li>Cached responses</li>
                  <li>Message history</li>
                  <li>User profile data</li>
                </ul>
              </div>
            )}

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between group hover:bg-gray-800/50 p-3 rounded-lg transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Dark Mode</Label>
                <p className="text-sm text-gray-400">Toggle dark/light theme</p>
              </div>
              <Switch
                checked={preferences.darkMode}
                onCheckedChange={(checked) => {
                  setPreferences(prev => ({ ...prev, darkMode: checked }));
                  localStorage.setItem('theme', checked ? 'dark' : 'light');
                }}
                className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-700"
              />
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between group hover:bg-gray-800/50 p-3 rounded-lg transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Notifications</Label>
                <p className="text-sm text-gray-400">Receive push notifications</p>
              </div>
              <Switch
                checked={preferences.notifications}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, notifications: checked }))
                }
                className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-700"
              />
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default Settings;
