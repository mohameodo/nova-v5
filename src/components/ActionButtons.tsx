import { ImagePlus, FileText, Brain, Search, Film, Code, HelpCircle, CheckSquare } from "lucide-react";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from 'react';

interface ActionButtonsProps {
  onSend: (message: string) => void;
}

const ActionButtons = ({ onSend }: ActionButtonsProps) => {
  const { user } = useAuth();
  const [remainingGenerations, setRemainingGenerations] = useState<number>(10);

  useEffect(() => {
    const checkRemainingGenerations = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, `users/${user.uid}`));
      const userData = userDoc.data();
      const today = new Date().toISOString().split('T')[0];
      const remaining = userData?.lastImageDate === today ? 10 - (userData?.imageCount || 0) : 10;
      setRemainingGenerations(remaining);
    };

    checkRemainingGenerations();
  }, [user]);

  const actions = [
    {
      icon: <Film className="h-4 w-4 text-pink-400" />,
      label: "Movie Search",
      type: "movies",
      tooltip: "Find movies and shows",
      command: "/vlop",
      examples: [
        "Find sci-fi movies like Inception",
        "Show me popular comedy movies",
        "What are the best action movies of 2023",
        "Recommend movies like The Dark Knight"
      ]
    },
    {
      icon: <Brain className="h-4 w-4 text-violet-400" />,
      label: "Deep Think",
      type: "deepthink",
      tooltip: "Get detailed analysis",
      command: "/deepthink",
      examples: [
        "Analyze the impact of social media",
        "Compare different programming languages",
        "Explain quantum mechanics simply"
      ]
    },
    {
      icon: <ImagePlus className="h-4 w-4 text-purple-400" />,
      label: "Create image",
      type: "image",
      examples: [
        "A magical forest at night",
        "Futuristic city landscape",
        "Abstract digital art"
      ]
    },
    {
      icon: <Search className="h-4 w-4 text-blue-400" />,
      label: "Search Web",
      type: "search",
      examples: [
        "Latest tech news",
        "Find cute cat images",
        "Search coding tutorials"
      ]
    },
    {
      icon: <FileText className="h-4 w-4 text-green-400" />,
      label: "Write Essay",
      type: "essay",
      tooltip: "Generate essays on topics",
      command: "/essay",
      examples: [
        "Write an essay about climate change",
        "Essay about artificial intelligence impact",
        "Compare ancient civilizations"
      ]
    },
    {
      icon: <HelpCircle className="h-4 w-4 text-yellow-400" />,
      label: "Get Advice",
      type: "advice",
      tooltip: "Get personal advice",
      command: "/advice",
      examples: [
        "Career development tips",
        "Productivity improvement advice",
        "Learning new skills effectively"
      ]
    },
    {
      icon: <CheckSquare className="h-4 w-4 text-blue-400" />,
      label: "Today's Tasks",
      type: "tasks",
      tooltip: "Generate task suggestions",
      command: "/tasks",
      examples: [
        "Generate productive daily tasks",
        "Create a study schedule",
        "Plan weekly goals"
      ]
    }
  ];

  const handleAction = (action: typeof actions[0]) => {
    const randomExample = action.examples[Math.floor(Math.random() * action.examples.length)];
    onSend(`${action.command} ${randomExample}`);
  };

  return (
    <div className="flex gap-2 flex-wrap justify-center mt-4">
      {actions.map((action) => (
        <TooltipProvider key={action.label}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => handleAction(action)}
                className="relative flex h-[42px] items-center gap-1.5 rounded-full border border-[#383737] px-3 py-2 text-start text-[13px] shadow-xxs transition hover:bg-gray-800/50 active:scale-95 xl:gap-2 xl:text-[14px]"
              >
                {action.icon}
                {action.label}
                {action.type === 'image' && (
                  <span className="text-xs text-gray-400 ml-1">
                    ({remainingGenerations})
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{action.tooltip}</p>
              {action.type === 'image' && (
                <p className="text-xs text-gray-400">
                  {remainingGenerations} remaining today
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
};

export default ActionButtons;