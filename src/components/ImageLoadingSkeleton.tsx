import { motion } from 'framer-motion';

export const ImageLoadingSkeleton = () => (
  <div className="space-y-4">
    <motion.div
      className="w-[250px] h-[250px] relative bg-gray-900/80 rounded-xl overflow-hidden"
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800/10 to-transparent"
        animate={{ x: ['-200%', '200%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />

      {/* Grid pattern */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <motion.div
            key={i}
            className="bg-gray-800/40 rounded-lg"
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [0.98, 1, 0.98],
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
            }}
          />
        ))}
      </div>

      {/* Stars effect */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            repeat: Infinity,
          }}
        />
      ))}

      {/* Status text */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="text-sm text-gray-400"
        >
          Creating your masterpiece...
        </motion.div>
      </div>
    </motion.div>
  </div>
);
