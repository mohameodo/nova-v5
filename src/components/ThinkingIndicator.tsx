import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const thoughts = [
  "Analyzing context and intent...",
  "Processing information...",
  "Formulating detailed response...",
  "Reviewing data points...",
  "Finalizing thoughts..."
];

export const ThinkingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-3 text-purple-400/70 mb-4"
  >
    <motion.div
      animate={{
        rotate: [0, 360],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <Brain className="w-5 h-5" />
    </motion.div>
    <motion.div
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
    >
      {thoughts.map((thought, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.5 }}
          className="text-sm"
        >
          {thought}
        </motion.div>
      ))}
    </motion.div>
  </motion.div>
);
