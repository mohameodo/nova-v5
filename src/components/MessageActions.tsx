import { Copy, ThumbsUp, ThumbsDown, Volume2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from '@/hooks/use-toast';

interface MessageActionsProps {
  content: string;
}

const MessageActions = ({ content }: MessageActionsProps) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-gray-400 hover:text-gray-100"
        onClick={handleCopy}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-gray-400 hover:text-gray-100"
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-gray-400 hover:text-gray-100"
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-gray-400 hover:text-gray-100"
      >
        <Volume2 className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-gray-400 hover:text-gray-100"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MessageActions;