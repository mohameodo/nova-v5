import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { generateImage } from '@/lib/providers/fireworks';
import { uploadImage } from '@/lib/db/storage';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { Download, X, Loader2 } from 'lucide-react';

const ImageGenerator = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [remainingGenerations, setRemainingGenerations] = useState(10);

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return;
    
    setIsGenerating(true);
    try {
      const imageUrl = await generateImage(prompt);
      
      // Add watermark
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      img.src = imageUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      
      if (ctx) {
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Add watermark
        ctx.font = '30px "Permanent Marker"';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'center';
        ctx.fillText('Nova by Nexiloop', canvas.width / 2, canvas.height - 30);
      }

      const timestamp = Date.now();
      const watermarkedImage = canvas.toDataURL('image/jpeg', 0.95);
      
      const { url } = await uploadImage(user.uid, watermarkedImage, timestamp);
      setSelectedImage(url);
      setRemainingGenerations(prev => prev - 1);
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate image',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedImage) return;
    const response = await fetch(selectedImage);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nova-image-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          disabled={isGenerating || remainingGenerations === 0}
        />
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt || remainingGenerations === 0}
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Generate'
          )}
        </Button>
      </div>
      
      <p className="text-sm text-gray-400">
        {remainingGenerations} generations remaining today
      </p>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-2xl p-4" onClick={e => e.stopPropagation()}>
              <img
                src={selectedImage}
                alt="Generated"
                className="rounded-lg border-2 border-gray-700"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button size="icon" variant="ghost" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setSelectedImage(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageGenerator;
