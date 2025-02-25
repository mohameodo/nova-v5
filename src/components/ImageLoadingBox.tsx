import { motion } from 'framer-motion';
import { Paintbrush, Sparkles } from 'lucide-react';

const ImageLoadingBox = () => {
  return (
    <div className="relative">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-[256px] h-[256px] rounded-lg relative overflow-hidden backdrop-blur-xl"
      >
        {/* Dark gray background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/90 to-gray-900/90" />
        
        {/* Subtle color orbs */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute -inset-[50px] animate-orbit-1">
            <div className="w-16 h-16 bg-gray-600/30 rounded-full blur-xl" />
          </div>
          <div className="absolute -inset-[50px] animate-orbit-2">
            <div className="w-16 h-16 bg-gray-700/30 rounded-full blur-xl" />
          </div>
        </div>

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3 z-10">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <Paintbrush className="w-8 h-8 text-gray-400/90" />
            </motion.div>
            <motion.p 
              className="text-base text-gray-300/90 font-medium"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              Creating artwork...
            </motion.p>
          </div>
        </div>

        {/* Border overlay */}
        <div className="absolute inset-0 border border-gray-700/50 rounded-lg" />
      </motion.div>
    </div>
  );
};

export default ImageLoadingBox;
