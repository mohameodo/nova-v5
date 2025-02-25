import { useState, useEffect } from 'react';

interface TypeWriterProps {
  text: string;
  speed?: number;
}

export const TypeWriter = ({ text, speed = 30 }: TypeWriterProps) => {
  const [displayText, setDisplayText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    setDisplayText('');
    setIsTypingComplete(false);
    let index = 0;
    
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText((prev) => prev + text.charAt(index));
        index++;
      } else {
        setIsTypingComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <div className="whitespace-pre-wrap">
      {displayText}
      {!isTypingComplete && (
        <span className="inline-block w-[2px] h-[14px] bg-gray-400 ml-[2px] animate-blink" />
      )}
    </div>
  );
};
