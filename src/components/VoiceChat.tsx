import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Speaker, X, Brain } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VoiceChatProps {
  isOpen: boolean;
  onClose: () => void;
  onMessage: (message: string) => Promise<string>;
}

const AudioVisualizer = ({ isActive }: { isActive: boolean }) => {
  return (
    <motion.div className="flex space-x-1">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            scaleY: isActive ? [1, 1.5 + i * 0.3, 1] : 1,
            backgroundColor: isActive ? '#60A5FA' : '#374151',
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.1,
            repeat: isActive ? Infinity : 0,
          }}
          className="w-1 h-12 bg-gray-700/50 rounded-full"
        />
      ))}
    </motion.div>
  );
};

const VoiceChat = ({ isOpen, onClose, onMessage }: VoiceChatProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [interpretation, setInterpretation] = useState('');
  
  const recognition = useRef<SpeechRecognition | null>(null);
  const synthesis = useRef(window.speechSynthesis);

  useEffect(() => {
    if (isOpen) {
      const greetings = [
        "Hello! I'm Nova. Just tap the circle when you want to talk.",
        "Welcome to voice chat! I'm listening whenever you're ready.",
        "Hi there! Tap the glowing circle to start our conversation.",
        "Voice chat activated. Ready when you are!",
        "I'm here to chat! Tap to start speaking."
      ];
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      
      // Short delay before greeting
      const timer = setTimeout(() => {
        setAiResponse(greeting);
        speakResponse(greeting);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        recognition.current = new SpeechRecognitionAPI();
        recognition.current.continuous = false;
        recognition.current.interimResults = false; // Changed to false to only get final results
        recognition.current.lang = 'en-US';
        
        recognition.current.onresult = (event) => {
          const result = event.results[event.resultIndex][0];
          if (result.confidence > 0) {
            const transcript = result.transcript;
            setTranscript(transcript);
            handleTranscriptProcessing(transcript);
          }
        };

        recognition.current.onerror = () => {
          setIsListening(false);
          recognition.current?.abort();
        };
      }
    }
    return () => {
      if (recognition.current) {
        recognition.current.abort();
        setIsListening(false);
      }
      synthesis.current.cancel();
    };
  }, [isOpen]);

  useEffect(() => {
    const loadVoices = () => {
      const voices = synthesis.current.getVoices();
      setAvailableVoices(voices);
      console.log('Available voices:', voices.map(v => v.name)); // Debug available voices
    };

    synthesis.current.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  const handleTranscriptProcessing = async (text: string) => {
    if (!text.trim()) return;
    
    setIsListening(false);
    try {
      const response = await onMessage(text);
      setAiResponse(response);
      speakResponse(response);
    } catch (error) {
      console.error('Processing error:', error);
    }
  };

  const startListening = () => {
    setTranscript('');
    setAiResponse('');
    try {
      recognition.current?.start();
    } catch (error) {
      console.log('Recognition already started');
    }
  };

  const stopListening = async () => {
    setIsListening(false);
    if (recognition.current) {
      recognition.current.stop();
    }
    
    if (transcript.trim()) {
      try {
        const response = await onMessage(transcript);
        setAiResponse(response);
        speakResponse(response);
      } catch (error) {
        console.error('Message processing error:', error);
      }
    }
  };

  const handleMessageWithInterpretation = async () => {
    if (transcript) {
      setIsListening(false);
      const response = await onMessage(transcript);
      setAiResponse(response);
      
      // Get interpretation
      const interpretation = await onMessage(`Interpret the following conversation:
        User: ${transcript}
        AI: ${response}`);
      setInterpretation(interpretation);
      
      speakResponse(response);
    }
  };

  const speakResponse = (text: string) => {
    setIsAiSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Priority list of preferred voices (add more based on available voices in your browser)
    const preferredVoices = [
      'Google UK English Male',
      'Microsoft Guy Online (Natural) - English (United Kingdom)',
      'en-GB-Neural2-B',
      'Microsoft David - English (United States)',
      'Microsoft James',
      'Daniel',
    ];

    // Find the best available voice
    const selectedVoice = availableVoices.find(voice => 
      preferredVoices.some(preferred => voice.name.includes(preferred))
    ) || availableVoices.find(voice => 
      voice.lang.includes('en') && voice.name.includes('Male')
    );

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Enhanced voice settings for clarity
    utterance.rate = 1.0;      // Normal speed
    utterance.pitch = 1.0;     // Natural pitch
    utterance.volume = 1.0;    // Full volume

    // Add SSML tags for better pronunciation
    const ssmlText = text
      .replace(/\n/g, ' ')
      .replace(/[.!?]+/g, match => `${match}<break time="500ms"/>`);
    
    utterance.text = ssmlText;

    // Add event handlers
    utterance.onstart = () => {
      setIsAiSpeaking(true);
      console.log('Speaking started with voice:', selectedVoice?.name);
    };

    utterance.onend = () => {
      setIsAiSpeaking(false);
      if (!isListening) {
        setTranscript('');
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsAiSpeaking(false);
    };

    synthesis.current.cancel(); // Cancel any ongoing speech
    synthesis.current.speak(utterance);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-50 flex flex-col items-center justify-center"
        >
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-purple-900/10 to-black/30" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay" />
          
          {/* Content container */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Close button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 text-white/60 p-2 hover:bg-white/5 rounded-full transition-all"
            >
              <X size={24} />
            </motion.button>

            {/* Main circle */}
            <motion.div
              className="relative cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsListening(!isListening)}
            >
              {/* Enhanced outer glow */}
              <motion.div
                animate={{
                  scale: isListening || isAiSpeaking ? [1, 1.2, 1] : 1,
                  opacity: isListening || isAiSpeaking ? [0.2, 0.4, 0.2] : 0.1,
                }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute inset-[-50px] bg-blue-500/30 rounded-full blur-3xl"
              />

              {/* Main circle container */}
              <motion.div
                animate={{
                  scale: isListening || isAiSpeaking ? [1, 1.05, 1] : 1,
                  borderColor: isListening ? 'rgb(59, 130, 246)' : isAiSpeaking ? 'rgb(16, 185, 129)' : 'rgb(75, 85, 99)',
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="relative w-56 h-56 rounded-full border-2 bg-black/50 backdrop-blur-xl flex items-center justify-center group-hover:border-opacity-100 border-opacity-50 shadow-2xl"
              >
                {/* Inner ring */}
                <motion.div
                  animate={{
                    scale: isListening || isAiSpeaking ? [0.8, 1, 0.8] : 0.8,
                    opacity: isListening || isAiSpeaking ? 1 : 0.3,
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-4 rounded-full border border-white/10"
                />

                {/* Audio visualizer */}
                <div className="absolute inset-0 flex items-center justify-center opacity-50">
                  <AudioVisualizer isActive={isListening || isAiSpeaking} />
                </div>

                {/* Single Icon Container */}
                <div className="relative z-20">
                  <motion.div
                    animate={{
                      scale: isListening || isAiSpeaking ? [1, 1.1, 1] : 1,
                      opacity: 1,
                    }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    {isListening ? (
                      <Mic className="w-12 h-12 text-blue-400" />
                    ) : isAiSpeaking ? (
                      <Speaker className="w-12 h-12 text-green-400" />
                    ) : (
                      <Brain className="w-12 h-12 text-purple-400" />
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Enhanced captions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-16 text-center space-y-4 w-full max-w-xl px-4"
            >
              <motion.p
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-white/90 text-xl font-medium"
              >
                {isListening ? 'Listening...' : 
                  isAiSpeaking ? 'Speaking...' : 
                  'Tap circle to start'}
              </motion.p>
              {(transcript || aiResponse) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-black/20 p-4 rounded-lg backdrop-blur-sm max-w-md mx-auto"
                >
                  <p className="text-white/70 text-sm">
                    {isListening ? transcript : aiResponse}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceChat;
