import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// Thinking time estimator based on prompt length and complexity
const estimateThinkingTime = (topic: string) => {
  const wordCount = topic.split(' ').length;
  const hasComplexTerms = /\b(technical|analysis|explain|compare|evaluate|code|programming)\b/i.test(topic);
  return hasComplexTerms ? 7000 : Math.max(4000, wordCount * 500);
};

export const DeepThinkAnimation = ({ topic, onComplete }: { topic: string, onComplete: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<number>(estimateThinkingTime(topic));
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { text: "Initial analysis...", time: 1000 },
    { text: "Processing context...", time: 1500 },
    { text: "Connecting concepts...", time: 1500 },
    { text: "Formulating response...", time: 1500 },
    { text: "Finalizing answer...", time: 1000 }
  ];

  useEffect(() => {
    if (timeLeft === 0) {
      // Show completion message before completing
      setCurrentStep(steps.length - 1);
      setTimeout(() => {
        onComplete?.();
      }, 1000);
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1000));
    }, 1000);

    const stepTimer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        onComplete();
      }
    }, timeLeft);

    return () => {
      clearInterval(timer);
      clearTimeout(stepTimer);
    };
  }, [timeLeft, currentStep]);

  return (
    <motion.div className="space-y-3 text-sm">
      <motion.div className="text-purple-400/70">
        Analyzing: {topic}
      </motion.div>

      {/* Thinking progress */}
      <motion.div className="text-gray-400/60">
        Time remaining: {Math.ceil(timeLeft / 1000)}s
      </motion.div>

      {/* Current step */}
      <motion.div 
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gray-400"
      >
        {steps[currentStep].text}
      </motion.div>

      {/* Progress bar */}
      <motion.div className="h-1 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-purple-500/30"
          animate={{
            width: ['0%', '100%']
          }}
          transition={{
            duration: timeLeft / 1000,
            ease: 'linear'
          }}
        />
      </motion.div>
    </motion.div>
  );
};
