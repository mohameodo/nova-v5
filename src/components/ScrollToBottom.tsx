import { ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface ScrollToBottomProps {
  show: boolean;
  onClick: () => void;
}

const ScrollToBottom = ({ show, onClick }: ScrollToBottomProps) => {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-32 right-4 z-10" // Changed from bottom-20 to bottom-32
    >
      <Button
        onClick={onClick}
        size="icon"
        className="rounded-full bg-gray-800/90 shadow-lg hover:bg-gray-700/90"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};

export default ScrollToBottom;
