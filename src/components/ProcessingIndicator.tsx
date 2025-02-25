import { motion } from "framer-motion";

export const ProcessingIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <motion.div
            animate={{
              y: [0, -10, 0],
              transition: { duration: 1, repeat: Infinity, delay: 0 }
            }}
            className="w-3 h-3 bg-white rounded-full"
          />
          <motion.div
            animate={{
              y: [0, -10, 0],
              transition: { duration: 1, repeat: Infinity, delay: 0.2 }
            }}
            className="w-3 h-3 bg-white rounded-full"
          />
          <motion.div
            animate={{
              y: [0, -10, 0],
              transition: { duration: 1, repeat: Infinity, delay: 0.4 }
            }}
            className="w-3 h-3 bg-white rounded-full"
          />
        </div>
        <span className="text-sm text-white/70">Processing your request...</span>
      </div>
    </motion.div>
  );
};
