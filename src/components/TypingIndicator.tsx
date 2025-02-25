import { motion } from 'framer-motion';

export const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-2 px-4 py-2">
      <motion.div 
        className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-4 py-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-sm text-gray-400">typing</span>
        <motion.div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-gray-400 rounded-full"
              animate={{
                y: ["0%", "-40%", "0%"]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
