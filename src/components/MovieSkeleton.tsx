import { motion } from 'framer-motion';

export const MovieSkeleton = () => {
  return (
    <div className="space-y-8 -mx-4 sm:mx-0">
      {[...Array(3)].map((_, sectionIndex) => (
        <div key={sectionIndex} className="relative">
          <div className="h-6 w-48 bg-gray-800 rounded animate-pulse mb-3 mx-4 sm:mx-0" />
          
          <div className="flex gap-4 px-4 sm:px-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="relative flex-none w-[180px] sm:w-[200px] aspect-[2/3] rounded-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 animate-pulse">
                  <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                    <div className="h-2 w-3/4 bg-gray-700 rounded" />
                    <div className="h-2 w-1/2 bg-gray-700 rounded" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
