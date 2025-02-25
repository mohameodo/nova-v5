import { motion } from 'framer-motion';

export const SearchSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 w-full max-w-2xl"
    >
      {/* Image Grid Skeleton */}
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse"
          />
        ))}
      </div>

      {/* Text Results Skeleton */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-4 rounded-lg border border-gray-800 space-y-2"
        >
          <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-gray-800 rounded w-full animate-pulse" />
          <div className="h-3 bg-gray-800 rounded w-1/2 animate-pulse" />
        </motion.div>
      ))}

      {/* Loading Indicator */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
      />
    </motion.div>
  );
};
