import { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2, Plus, Upload, Image, FileText, Link } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FilePreview } from './FilePreview';
import { ProcessingIndicator } from './ProcessingIndicator';
import { motion } from "framer-motion";
import { analyzeFile, storeFileInFirebase } from '@/lib/services/fileAnalysisService';
import { useAI } from '@/hooks/useAI';
import { useAuth } from '@/hooks/useAuth';

const commandHints = [
  { command: '/weather', description: 'Get current weather', examples: ['current location', 'New York'] },
  { command: '/image', description: 'Create AI artwork', examples: ['sunset in paris', 'cosmic cat'] },
  { command: '/vlop', description: 'Find movies', examples: ['action movies', 'comedy'] },
  { command: '/deepthink', description: 'Deep analysis', examples: ['climate change', 'AI future'] },
  { command: '/search', description: 'Web search', examples: ['latest news', 'tutorials'] },
  { command: '/search image', description: 'Image search', examples: ['nature photos', 'space'] },
  { command: '/search video', description: 'Video search', examples: ['cooking tutorials', 'music'] },
  { command: '/call', description: 'Voice chat', examples: ['start voice call'] },
  { 
    command: '/news', 
    description: 'Get latest news', 
    examples: ['tech news', 'world news', 'sports'] 
  },
  // Add more commands here
];

const COMMANDS = [
  {
    name: 'weather',
    description: 'Get weather information',
    examples: [
      '/weather London',
      '/weather New York',
      'What is the weather?',
      'What is the weather in Tokyo?',
      'How is the weather today?',
      'Tell me the weather in my location'
    ]
  },
  // ...existing commands...
];

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

const ChatInput = ({ onSend, isLoading: parentIsLoading = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<{
    type: 'image' | 'file';
    url?: string;
    name: string;
    content?: string;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState(COMMANDS);
  const { currentModel = 'gpt-4' } = useAI();
  const [isLocalLoading, setLocalLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleSlashCommand = (input: string) => {
      if (input === '/') {
        setShowCommands(true);
        setFilteredCommands(COMMANDS);
      } else if (input.startsWith('/')) {
        setShowCommands(true);
        setFilteredCommands(
          COMMANDS.filter(cmd => 
            cmd.name.toLowerCase().includes(input.slice(1).toLowerCase()) ||
            cmd.examples?.some(ex => ex.toLowerCase().includes(input.toLowerCase()))
          )
        );
      } else if (input.toLowerCase().includes('weather')) {
        setShowCommands(true);
        setFilteredCommands(COMMANDS.filter(cmd => cmd.name === 'weather'));
      }
    };

    handleSlashCommand(message);
  }, [message]);

  const handleFileUpload = async (file: File, type: 'file' | 'image') => {
    if (!user) return;
    setIsProcessing(true);
    try {
      // Store file in Firebase
      const fileUrl = await storeFileInFirebase(file, user.uid);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const preview = {
          type,
          url: fileUrl, // Use the stored URL
          name: file.name,
          content: type === 'file' ? e.target?.result as string : undefined
        };
        setPreviewData(preview);
      };

      if (type === 'image') {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendWithFile = async () => {
    if (!previewData) return;
    
    setLocalLoading(true);
    try {
      if (previewData.type === 'image') {
        const prompt = message.trim() || "What do you see in this image? Describe it in detail.";
        // Keep text and image separate with double newline
        const analysis = `${prompt}\n\n![Image](${previewData.url})`;
        onSend(analysis);
      } else {
        const analysis = `Analyze this ${previewData.type}: ${previewData.name}\n\n${previewData.content}`;
        onSend(analysis);
      }
      
      setPreviewData(null);
      setMessage("");
    } catch (error) {
      console.error('Error sending file:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!message.trim()) return;

    if (previewData) {
      handleSendWithFile();
    } else {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '/') {
      setShowCommands(true);
    }
    if (e.key === 'Enter' && !e.shiftKey && !parentIsLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const showCommandHints = message.startsWith('/') && 
    !commandHints.some(cmd => message.startsWith(cmd.command + ' '));

  return (
    <div className="relative flex w-full flex-col items-center">
      <FilePreview 
        file={previewData} 
        isProcessing={isProcessing} 
        onRemove={() => setPreviewData(null)} // Add remove option
      />
      {isProcessing && <ProcessingIndicator />}
      
      <div className="relative w-full">
        <textarea
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={previewData 
            ? "Add a message about this file or press Enter to analyze..." 
            : "Message Nova..."
          }
          className="w-full resize-none rounded-full bg-[#2F2F2F] px-12 py-4 pr-12 focus:outline-none no-scrollbar"
          style={{ 
            maxHeight: "200px",
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          disabled={parentIsLoading || isLocalLoading}
        />
        <Popover>
          <PopoverTrigger asChild>
            <button 
              className="absolute left-2 top-[45%] -translate-y-[50%] p-1.5 border border-white/10 bg-gray-800 rounded-full hover:bg-gray-700/50 transition-colors"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 text-white/40 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 text-white/40" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2 bg-gray-900 border border-gray-800">
            <div className="flex flex-col gap-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'file');
                }}
                className="hidden"
                accept=".txt,.js,.py,.jsx,.tsx,.md,.json,.csv"
              />
              <input
                type="file"
                ref={imageInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'image');
                }}
                className="hidden"
                accept="image/*"
              />
              <button 
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg text-sm text-white/70 transition-colors"
              >
                <Image className="h-4 w-4" />
                <span>Upload Image</span>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 p-2 hover:bg-gray-800 rounded-lg text-sm text-white/70 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Upload File</span>
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <button 
          onClick={previewData ? handleSendWithFile : handleSubmit}
          disabled={parentIsLoading || isLocalLoading || (!message.trim() && !previewData)}
          className="absolute right-3 top-[50%] -translate-y-[50%] p-1.5 bg-white rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {(parentIsLoading || isLocalLoading) ? (
            <Loader2 className="h-4 w-4 text-black animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4 text-black" />
          )}
        </button>
      </div>

      {showCommandHints && (
        <motion.div 
          className="absolute bottom-full mb-2 w-full bg-gray-800/95 backdrop-blur-lg rounded-lg border border-gray-700/50 shadow-2xl overflow-hidden no-scrollbar"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div 
            className="max-h-[300px] overflow-y-auto no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 p-1.5">
              {commandHints
                .filter(hint => 
                  !message.trim() || 
                  hint.command.toLowerCase().includes(message.slice(1).toLowerCase()) ||
                  hint.description.toLowerCase().includes(message.toLowerCase())
                )
                .map((hint) => (
                  <div 
                    key={hint.command}
                    className="p-3 hover:bg-gray-900/70 rounded-md transition-colors cursor-pointer group"
                    onClick={() => {
                      setMessage(hint.command + ' ');
                      setShowCommands(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-200 font-mono text-[14px] font-medium">{hint.command}</span>
                      <span className="text-gray-400 text-[13px]">{hint.description}</span>
                    </div>
                    {hint.examples && (
                      <div className="mt-1.5 pl-4 text-[11px] text-gray-500 group-hover:text-gray-400">
                        Try: {hint.examples[0]}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Update the global CSS
const globalStyles = `
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Remove old custom-scrollbar styles as they're no longer needed */
textarea::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
}

textarea {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}
`;

export default ChatInput;