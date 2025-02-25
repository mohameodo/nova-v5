import { motion } from 'framer-motion';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-[#1d1e20] flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.8,
          delay: 0.2,
          ease: [0, 0.71, 0.2, 1.01]
        }}
      >
        <div className="relative">
          <motion.span
            className="absolute inset-0 text-6xl font-bold text-transparent"
            style={{
              WebkitTextStroke: '2px rgba(255,255,255,0.2)',
            }}
          >
            NOVA
          </motion.span>
          <motion.span
            className="relative text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            NOVA
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
