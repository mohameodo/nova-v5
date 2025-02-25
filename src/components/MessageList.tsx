import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Message as AIMessage } from '@/lib/models/types';
import { CodeBlock } from './CodeBlock';
import { cn } from "@/lib/utils";
import { Download, Brain, Copy, Share, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import ImageLoadingBox from './ImageLoadingBox';
import { downloadImage } from '@/lib/utils/imageUtils';
import { SearchResults } from './SearchResults';
import { SearchSkeleton } from './SearchSkeleton';
import { MovieCarousel } from './MovieCarousel';
import { MovieSkeleton } from './MovieSkeleton';
import { getMovieDetails } from '@/lib/services/tmdbService'; // Fixed import path
import { Movie } from '@/lib/services/tmdbService';
import { DeepThinkAnimation } from './DeepThinkAnimation';
import { ImageLoadingSkeleton } from './ImageLoadingSkeleton';
import { ThinkingIndicator } from './ThinkingIndicator';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { saveFeedback } from '@/lib/db';
import { getWeather } from '@/lib/services/weatherService';
import { WeatherCard } from './WeatherCard';
import { WeatherSkeleton } from './WeatherSkeleton';
import { NewsCard } from './NewsCard';
import { NewsSkeleton } from './NewsSkeleton';
import { analyzeNewsArticle } from '@/lib/services/newsService';

interface MessageListProps {
  messages: AIMessage[];
  onSendMessage: (message: AIMessage) => void;
  deepThinkEnabled?: boolean;
}

export const ThinkingAnimation = () => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800/50"
  >
    {/* Thinking Process Animation */}
    <div className="flex items-center gap-3">
      <Brain className="w-5 h-5 text-purple-400/50" />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-purple-300/70 text-sm"
      >
        <TypewriterText text="Processing your request..." />
      </motion.p>
    </div>

    {/* Thought Process Steps */}
    <div className="space-y-2 pl-8">
      {[
        "Analyzing context...",
        "Considering perspectives...",
        "Formulating response...",
        "Refining thoughts..."
      ].map((step, index) => (
        <motion.div
          key={step}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.5 }}
          className="text-gray-500 text-xs"
        >
          <TypewriterText text={step} delay={index * 500} />
        </motion.div>
      ))}
    </div>

    {/* Neural Pattern Animation */}
    <div className="grid grid-cols-5 gap-1 mt-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          className="h-0.5 bg-purple-500/20 rounded-full"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scaleX: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            delay: i * 0.1,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  </motion.div>
);

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <span>{displayText}</span>;
};

const ImageGenerationLoading = () => (
  <motion.div
    className="w-[256px] h-[256px] relative overflow-hidden bg-gray-800/80 rounded-xl border border-gray-700/50" // Changed size and colors
  >
    {/* Gradient Overlay */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-gray-700/20 via-gray-600/20 to-gray-700/20" // Updated gradient colors
      animate={{
        x: ['-100%', '100%'],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      }}
    />

    {/* Loading Grid */}
    <div className="grid grid-cols-3 grid-rows-3 gap-1 p-3 h-full"> {/* Reduced grid size */}
      {Array.from({ length: 9 }).map((_, i) => ( // Reduced number of cells
        <motion.div
          key={i}
          className="bg-gray-700/30 rounded-lg"
          animate={{
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 1.5,
            delay: i * 0.1,
            repeat: Infinity,
          }}
        />
      ))}
    </div>

    {/* Status Text */}
    <div className="absolute bottom-3 left-3 right-3"> {/* Adjusted padding */}
      <motion.div
        className="text-xs text-gray-400/70 text-center" // Reduced text size
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <TypewriterText text="Creating artwork..." /> {/* Shortened text */}
      </motion.div>
    </div>
  </motion.div>
);

const MessageActions = ({ message, onRetry }: { message: AIMessage; onRetry?: () => void }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFeedback = async (type: 'like' | 'dislike') => {
    if (!user) return;

    const isLike = type === 'like';
    if (isLike) {
      setLiked(!liked);
      setDisliked(false);
    } else {
      setDisliked(!disliked);
      setLiked(false);
    }

    await saveFeedback(user.uid, message.id || Date.now().toString(), {
      liked: isLike ? !liked : false,
      disliked: !isLike ? !disliked : false
    });
  };

  if (message.role === 'user') return null; // Don't show actions for user messages

  return (
    <div className="flex items-center gap-2 mt-2 text-gray-500">
      <button
        onClick={() => onRetry?.()}
        className="p-1 hover:bg-gray-800/50 rounded-md transition-colors"
        title="Regenerate response"
      >
        <RotateCcw className="w-4 h-4 hover:text-gray-300" />
      </button>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(message.content);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="p-1 hover:bg-gray-800/50 rounded-md transition-colors"
        title={copied ? "Copied!" : "Copy message"}
      >
        <Copy className={cn("w-4 h-4", copied && "text-green-500")} />
      </button>
      <button
        onClick={() => {
          if (navigator.share) {
            navigator.share({
              title: 'Shared from Nova AI',
              text: message.content,
            }).catch(console.error);
          }
        }}
        className="p-1 hover:bg-gray-800/50 rounded-md transition-colors"
        title="Share message"
      >
        <Share className="w-4 h-4 hover:text-gray-300" />
      </button>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleFeedback('like')}
          className={cn(
            "p-1 hover:bg-gray-800/50 rounded-md transition-colors",
          )}
          title="Helpful"
        >
          <ThumbsUp className={cn(
            "w-4 h-4",
            liked ? "text-green-500" : "hover:text-gray-300"
          )} />
        </button>
        <button
          onClick={() => handleFeedback('dislike')}
          className={cn(
            "p-1 hover:bg-gray-800/50 rounded-md transition-colors",
          )}
          title="Not helpful"
        >
          <ThumbsDown className={cn(
            "w-4 h-4",
            disliked ? "text-red-500" : "hover:text-gray-300"
          )} />
        </button>
      </div>
    </div>
  );
};

const formatAIResponse = (content: string): string => {
  // Add line breaks between sections marked with headers or bullet points
  let formatted = content
    // Add spacing after headers
    .replace(/#{1,6} (.+)/g, '\n$&\n')
    // Add spacing around bullet points
    .replace(/([•\-\*] .+)/g, '\n$1\n')
    // Add spacing around numbered lists
    .replace(/(\d+\. .+)/g, '\n$1\n')
    // Add spacing around colons in key-value pairs
    .replace(/(\w+:)/g, '\n**$1**')
    // Add spacing around emojis
    .replace(/([\u{1F300}-\u{1F9FF}])/gu, '\n$1 ')
    // Add spacing around code blocks
    .replace(/(```[\s\S]*?```)/g, '\n\n$1\n\n')
    // Add spacing around horizontal rules
    .replace(/---/g, '\n\n---\n\n')
    // Add spacing around quotes
    .replace(/(\> .+)/g, '\n$1\n')
    // Clean up multiple newlines
    .replace(/\n\s*\n/g, '\n\n')
    .trim();

  // Format key points and summaries
  if (formatted.includes('Key Points:')) {
    formatted = formatted.replace(
      /(Key Points:.*?)(?=\n\n|$)/s,
      '\n\n### $1\n'
    );
  }

  if (formatted.includes('Summary:')) {
    formatted = formatted.replace(
      /(Summary:.*?)(?=\n\n|$)/s,
      '\n\n### $1\n'
    );
  }

  return formatted;
};

const MessageList = ({ messages, onSendMessage }: MessageListProps) => {
  const handleMovieClick = async (movie: Movie) => {
    try {
      const movieDetails = await getMovieDetails(movie.id);
      
      const aiMessage: AIMessage = {
        role: 'assistant',
        content: `🎬 Let me tell you about ${movie.title}:

📅 Released: ${new Date(movieDetails.release_date).toLocaleDateString()}
⭐ Rating: ${movieDetails.vote_average.toFixed(1)}/10
⏱️ Runtime: ${movieDetails.runtime} minutes

${movieDetails.overview}

🎭 Starring: ${movieDetails.credits.cast.slice(0, 5).map(c => c.name).join(', ')}
🎬 Directed by: ${movieDetails.credits.crew.find(c => c.job === 'Director')?.name || 'Unknown'}
🎯 Genres: ${movieDetails.genres.map(g => g.name).join(', ')}

${movieDetails.similar?.results?.length ? 
  `\n💡 You might also like: ${movieDetails.similar.results.slice(0, 3).map(m => m.title).join(', ')}` 
  : ''}

🎥 Watch now: https://www.vlop.fun/#/media/tmdb-movie-${movie.id}`
      };

      onSendMessage(aiMessage);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      onSendMessage({
        role: 'assistant',
        content: 'Sorry, I could not fetch the movie details at this time.'
      });
    }
  };

  const handleRetry = (message: AIMessage) => {
    if (message.role === 'user') {
      onSendMessage(message);
    }
  };

  const handleAnalyzeArticle = async (article: any) => {
    try {
      const analysis = await analyzeNewsArticle(article);
      onSendMessage({
        role: 'assistant',
        content: analysis
      });
    } catch (error) {
      console.error('Error analyzing article:', error);
      onSendMessage({
        role: 'assistant',
        content: 'Sorry, I could not analyze this article at the moment.'
      });
    }
  };

  const displayMessages = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => ({
      ...msg,
      content: msg.role === 'assistant' ? msg.content.replace(/^Nova:\s*/i, '').trim() : msg.content
    }));

  const renderContent = (message: AIMessage) => {
    // Base message properties
    const { content = '', isImage = false, isProcessing = false } = message;

    // Check for special message types first
    if (message.isMovieResults && message.movies) {
      return (
        <div className="w-full -mx-4 sm:mx-0 overflow-hidden">
          <p className="text-purple-400/80 px-4 sm:px-0 mb-4">{message.content}</p>
          <MovieCarousel 
            movies={message.movies} 
            onMovieClick={handleMovieClick}
          />
        </div>
      );
    }

    if (message.isProcessing && message.isThinking) {
      return (
        <DeepThinkAnimation
          topic={message.content.replace('Analyzing: "', '').replace('"', '')}
          onComplete={() => {
            // Animation complete callback
          }}
        />
      );
    }

    if (message.isImage || message.content.includes('![')) {
      const imageMatch = message.content.match(/\((.*?)\)/);
      const promptMatch = message.content.match(/Creating artwork: "(.*?)"|What do you see in this image/);
      const textContent = message.content.split('\n\n')[0]; // Get text before image
      
      const imageUrl = imageMatch?.[1];
      const prompt = promptMatch?.[1] || 'Image';
      const isGeneratedArt = message.content.includes('Creating artwork');
      
      if (!imageUrl) return null;

      return (
        <div className="space-y-4">
          {textContent && (
            <div className="text-gray-200">
              {textContent}
            </div>
          )}
          <motion.div 
            className={cn(
              "relative group",
              isGeneratedArt ? "w-[512px]" : "w-[256px]" // Updated sizes
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img 
              src={imageUrl} 
              alt={prompt}
              className={cn(
                "object-cover rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-all cursor-pointer",
                isGeneratedArt ? "w-[512px] h-[512px]" : "w-[256px] h-[256px]" // Updated sizes
              )}
              loading="lazy"
              onClick={() => downloadImage(imageUrl, prompt)}
              crossOrigin="anonymous"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all rounded-lg" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                imageUrl && downloadImage(imageUrl, prompt);
              }}
              className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70"
            >
              <Download className="h-3 w-3" /> {/* Smaller icon */}
            </button>
            <div className="absolute bottom-1 left-1 text-[10px] text-white/90 bg-black/50 px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all truncate max-w-[90px]">
              {prompt}
            </div>
          </motion.div>
        </div>
      );
    }

    if (message.isWeather && message.weatherData) {
      return (
        <WeatherCard 
          weatherData={message.weatherData}
          summary={message.content}
        />
      );
    }

    if (message.isNews && message.articles) {
      return (
        <div className="w-full space-y-4">
          <p className="text-gray-400/80 mb-4">{message.content}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {message.articles.slice(0, 4).map((article, index) => (
              <NewsCard 
                key={index} 
                article={article}
                onAnalyze={handleAnalyzeArticle}
              />
            ))}
          </div>
        </div>
      );
    }

    if (message.isProcessing && message.content.includes('news')) {
      return <NewsSkeleton />;
    }

    // Update weather loading state
    if (message.isProcessing && message.content.includes('weather')) {
      return <WeatherSkeleton />;
    }

    // Handle loading states
    if (message.isProcessing) {
      if (message.content.includes('Creating your artwork')) {
        return <ImageLoadingSkeleton />;
      }
      if (message.content.includes('Searching')) {
        return <SearchSkeleton />;
      }
      if (message.content.includes('movies')) {
        return <MovieSkeleton />;
      }
      return <ImageLoadingBox />;
    }

    // Regular message content
    if (message.role === 'assistant') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gray-100 prose prose-invert prose-sm max-w-none
            prose-headings:text-gray-200 prose-headings:font-medium prose-headings:mt-4 prose-headings:mb-2
            prose-p:my-2 prose-p:leading-relaxed
            prose-li:my-1
            prose-strong:text-gray-300
            prose-pre:bg-gray-800/50 prose-pre:border prose-pre:border-gray-700/50
            prose-blockquote:border-l-2 prose-blockquote:border-gray-700 prose-blockquote:pl-4
            prose-hr:border-gray-800"
        >
          <ReactMarkdown components={{ code: CodeBlock }}>
            {formatAIResponse(message.content)}
          </ReactMarkdown>
        </motion.div>
      );
    }

    // User message
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-gray-100"
      >
        <ReactMarkdown components={{ code: CodeBlock }}>
          {message.content}
        </ReactMarkdown>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {displayMessages.map((message, index) => (
        <motion.div 
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex",
            message.role === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          <div className={cn(
            "max-w-[85%] px-4 py-2 rounded-2xl text-sm",
            message.role === 'user' 
              ? 'bg-gray-700/80 text-gray-100 ml-12' 
              : 'bg-gray-800 text-gray-100 mr-12'
          )}>
            <div className="prose prose-invert prose-sm max-w-none">
              {renderContent(message)}
            </div>
            <MessageActions 
              message={message} 
              onRetry={() => handleRetry(message)}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MessageList;