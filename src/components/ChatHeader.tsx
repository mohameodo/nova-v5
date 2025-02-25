import { ChevronDown, Menu, Sparkles, Brain, Zap, Bot, Cpu, Code2, Wind, CloudCog, Laptop, CircuitBoard, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";  // Add this import
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

interface ChatHeaderProps {
  isSidebarOpen?: boolean;
  currentModel: string;
  onModelChange: (model: string) => void;
  onToggle: () => void;
  onNewChat: () => void;
  isOffline?: boolean;
  deepThinkEnabled?: boolean;
  onDeepThinkToggle?: (value: boolean) => void;
}

const ChatHeader = ({ 
  isSidebarOpen = true, 
  currentModel, 
  onModelChange,
  onToggle,
  onNewChat,
  isOffline = false 
}: ChatHeaderProps) => {
  const { user } = useAuth();
  const { themeConfig } = useTheme();

  return (
    <div className={cn(
      "fixed top-0 z-30 w-full ",
      themeConfig.border,
      themeConfig.background
    )}>
      <div className="flex h-[60px] items-center justify-between px-4">
        {/* Left Section - Always visible */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggle}
            className="p-2 hover:bg-gray-800/50 rounded-md"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Model selector - Desktop: Left side, Mobile: Center */}
          <div className="hidden lg:block">
            <ModelSelector currentModel={currentModel} onModelChange={onModelChange} />
          </div>
        </div>

        {/* Center Section - Mobile only */}
        <div className="absolute left-1/2 -translate-x-1/2 lg:hidden">
          <ModelSelector currentModel={currentModel} onModelChange={onModelChange} />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 md:mr-[250px]">
        {user ? (
          <Link to="/settings" className="flex items-center gap-3 hover:bg-gray-800/50 px-3 py-2 rounded-lg">
            <div className="text-right hidden">
              <p className="text-sm font-medium text-gray-200">{user.displayName}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            <Avatar className="h-8 w-8 border border-gray-700 hover:border-gray-500 transition-colors">
              <AvatarImage src={user.photoURL} />
              <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Link to="/login">
            <Button variant="outline" size="icon" className="rounded-full">
              Sign In
            </Button>
          </Link>
        )}
        {isOffline && (
          <div className="flex items-center gap-1 text-sm text-yellow-500">
            <WifiOff className="w-4 h-4" />
            <span>Offline Mode</span>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

// Add ModelSelector component
const ModelSelector = ({ currentModel, onModelChange }: { currentModel: string, onModelChange: (model: string) => void }) => {
  const models = [
    { 
      name: "nova", 
      value: "gpt-4o-mini-2024-07-18", 
      icon: <Brain className="w-4 h-4 text-purple-400" />
    },
    { 
      name: "nova plus", 
      value: "nova", 
      icon: <Sparkles className="w-4 h-4 text-blue-400" />
    },
    { 
      name: "Nova Local", 
      value: "nlp/nova", 
      icon: <Laptop className="w-4 h-4 text-green-400" />
    },
    { 
      name: "nova super", 
      value: "llama2", 
      icon: <Bot className="w-4 h-4 text-orange-400" />
    },
    { 
      name: "codenova", 
      value: "codellama", 
      icon: <Code2 className="w-4 h-4 text-pink-400" />
    },
    { 
      name: "nv", 
      value: "mistral", 
      icon: <Wind className="w-4 h-4 text-cyan-400" />
    },
    { 
      name: "nova Pro", 
      value: "gemini-pro", 
      icon: <Cpu className="w-4 h-4 text-red-400" />
    },
    { 
      name: "noky", 
      value: "grok-1", 
      icon: <CircuitBoard className="w-4 h-4 text-violet-400" />
    },
    { 
      name: "nexiloop AI", 
      value: "cloudflare-ai", 
      icon: <CloudCog className="w-4 h-4 text-gray-400" />
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-800/50">
          <div className="flex items-center gap-2">
            {models.find(m => m.value === currentModel)?.icon}
            <span className="font-semibold text-sm whitespace-nowrap">
              {models.find(m => m.value === currentModel)?.name || "Select Model"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="bg-[#1d1e20] border-gray-800 w-[200px]">
        {models.map((model) => (
          <DropdownMenuItem 
            key={model.value}
            onClick={() => onModelChange(model.value)}
            className="flex items-center gap-2 cursor-pointer"
          >
            {model.icon}
            <span>{model.name}</span>
            {model.value === currentModel && (
              <Sparkles className="w-3 h-3 text-green-400 ml-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatHeader;
