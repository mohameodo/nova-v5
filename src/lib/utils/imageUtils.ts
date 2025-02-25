export const addWatermark = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (!ctx) return reject('Could not get canvas context');

      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Add watermark
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '20px Arial';
      ctx.textBaseline = 'bottom';
      
      // Add paint icon emoji and text
      const watermarkText = '🎨 Nova by Nexiloop';
      const padding = 20;
      
      // Add semi-transparent background for watermark
      const textMetrics = ctx.measureText(watermarkText);
      const textHeight = 24;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(
        padding - 5,
        canvas.height - padding - textHeight - 5,
        textMetrics.width + 10,
        textHeight + 10
      );
      
      // Add text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(watermarkText, padding, canvas.height - padding);

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => reject('Error loading image');
    img.src = imageUrl;
  });
};

export const downloadImage = async (imageUrl: string, prompt: string) => {
  try {
    const watermarkedImage = await addWatermark(imageUrl);
    const link = document.createElement('a');
    link.href = watermarkedImage;
    link.download = `nova-${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading image:', error);
  }
};
