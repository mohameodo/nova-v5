import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Message as AIMessage } from '@/lib/models/types';
import { modelConfigs } from '@/lib/models/config';
import { getProvider, generateImage } from '@/lib/providers';  // Updated this line
import { cn } from '@/lib/utils';  // Add this import
import Sidebar from '@/components/Sidebar';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import ActionButtons from '@/components/ActionButtons';
import MessageList from '@/components/MessageList';
import { saveChat, checkAndUpdateImageCount } from '@/lib/db';  // Updated this line
import { PlusCircle } from 'lucide-react';
import SplashScreen from '@/components/SplashScreen';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ScrollToBottom from '@/components/ScrollToBottom';
import { useTheme } from '@/hooks/useTheme'; // Add this import
import VoiceChat from '@/components/VoiceChat';
import { useAI } from '@/hooks/useAI'; // Assuming you have an AI hook
import { searchWeb } from '@/lib/services/searchService';
import { checkAndUpdateSearchCount } from '@/lib/services/searchLimitService';
import { fetchMovieRecommendations, getMovieDetails, Movie } from '@/lib/services/tmdbService';
import { getWeather } from '@/lib/services/weatherService';
import { getNews } from '@/lib/services/newsService';

const Index = () => {
  const { user } = useAuth();  // Add this line
  const { themeConfig } = useTheme(); // Add this line
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default to true
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentModel, setCurrentModel] = useState(() => {
    return localStorage.getItem('lastUsedModel') || 'nova';
  });
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showVoiceChat, setShowVoiceChat] = useState(false);
  const { sendMessage } = useAI();
  const [deepThinkEnabled, setDeepThinkEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  // Auto scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && !showScrollButton) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  // Add window size detection
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024); // 1024px is lg breakpoint
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Enhanced location detection with better feedback
  useEffect(() => {
    const getLocationWithTimeout = async () => {
      if ("geolocation" in navigator) {
        setIsLoading(true);
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              enableHighAccuracy: true
            });
          });

          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `${import.meta.env.VITE_WEATHER_API_URL}/search.json?key=${
              import.meta.env.VITE_WEATHER_API_KEY
            }&q=${latitude},${longitude}`
          );
          
          const data = await response.json();
          if (data?.[0]?.name) {
            setUserLocation(data[0].name);
           ;
          }
        } catch (error: any) {
          console.error('Location error:', error);
          if (error.code === 1) { // Permission denied
            toast({
              title: "Location access denied",
              description: "Please allow location access for local weather",
              variant: "destructive",
            });
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    getLocationWithTimeout();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFirstName = () => {
    if (!user?.displayName) return '';
    return user.displayName.split(' ')[0];
  };

  const getPersonalizedGreeting = () => {
    const firstName = user?.displayName?.split(' ')[0];
    if (!firstName) return 'What can I help with?';
    
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    
    const greetings = [
      `${timeGreeting}, ${firstName}! How can I assist you?`,
      `Great to see you, ${firstName}! What's on your mind?`,
      `Hey ${firstName}! Ready to help you out`,
      `Looking good, ${firstName}! What would you like to explore?`,
      `${timeGreeting}, ${firstName}! Let's create something amazing`,
      `Ready when you are, ${firstName}! What's the plan?`
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  const getUserContext = async () => {
    if (!user) return '';
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.bio || '';
      }
      return '';
    } catch (error) {
      console.error('Error fetching user context:', error);
      return '';
    }
  };

  const handleWeatherRequest = async (content: string) => {
    try {
      let location = content.toLowerCase().startsWith('/weather') 
        ? content.slice(9).trim() 
        : content.replace(/what is the weather|how is the weather|tell me the weather/gi, '').replace(/in|for/gi, '').trim();

      // Always try to use user's location if no specific location is provided
      if (!location) {
        if (userLocation) {
          location = userLocation;
        } else {
          throw new Error('Please allow location access or specify a location');
        }
      }

      // Show loading state
      const loadingMessage: AIMessage = {
        role: 'assistant',
        content: `Getting weather for ${location || 'your location'}...`,
        isProcessing: true
      };
      
      setMessages(prev => [...prev, { role: 'user', content }, loadingMessage]);

      const weatherData = await getWeather(location);
      const weatherMessage: AIMessage = {
        role: 'assistant',
        content: `Here's your weather report for ${weatherData.location.name}:
The current temperature is ${weatherData.current.temp_c}°C (${weatherData.current.temp_f}°F) with ${weatherData.current.condition.text.toLowerCase()} conditions. 
It feels like ${weatherData.current.feelslike_c}°C with ${weatherData.current.humidity}% humidity and wind speeds of ${weatherData.current.wind_kph} km/h.`,
        isWeather: true,
        weatherData
      };

      setMessages(prev => {
        const withoutLoading = prev.filter(m => !m.isProcessing);
        return [...withoutLoading, weatherMessage];
      });
    } catch (error: any) {
      toast({
        title: "Weather Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleNewsRequest = async (content: string) => {
    try {
      const query = content.toLowerCase().startsWith('/news')
        ? content.slice(6).trim()
        : content.replace(/show me news|get news|latest news/gi, '').trim();

      const userCountry = userLocation ? 'us' : 'us'; // Default to US if no location

      // Show loading state
      const loadingMessage: AIMessage = {
        role: 'assistant',
        content: `📰 Fetching ${query ? `news about "${query}"` : 'latest news'}...`,
        isProcessing: true
      };
      
      setMessages(prev => [...prev, { role: 'user', content }, loadingMessage]);

      const newsData = await getNews(query, userCountry);
      
      const newsMessage: AIMessage = {
        role: 'assistant',
        content: `📰 Here's ${query ? `news about "${query}"` : 'the latest news'} ${userLocation ? `for ${userLocation}` : ''}:`,
        isNews: true,
        articles: newsData.articles
      };

      setMessages(prev => {
        const withoutLoading = prev.filter(m => !m.isProcessing);
        return [...withoutLoading, newsMessage];
      });
    } catch (error: any) {
      toast({
        title: "News Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !user) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
        duration: 3000,
        className: "bg-red-900 border-red-800 text-white"
      });
      return;
    }

    // Add voice chat trigger
    if (content.toLowerCase() === '/call') {
      setShowVoiceChat(true);  // Just show voice chat without checks
      return;
    }

    if (content.toLowerCase().startsWith('/search')) {
      try {
        const args = content.slice(7).trim().split(' ');
        let type: 'all' | 'image' | 'video' = 'all';
        let query = args.join(' ');

        // Check for command format
        if (!query) {
          throw new Error('Please use: /search [type] query\nTypes: image, video, or leave blank for general search');
        }

        // Parse search type
        if (query.startsWith('image ')) {
          type = 'image';
          query = query.slice(6);
        } else if (query.startsWith('video ')) {
          type = 'video';
          query = query.slice(6);
        }

        // Add loading message
        const userMessage: AIMessage = { role: 'user', content };
        const loadingMessage: AIMessage = {
          role: 'assistant',
          content: `🔍 Searching for "${query}"...`,
          isProcessing: true
        };
        setMessages([...messages, userMessage, loadingMessage]);

        // Check search limit
        const { allowed, remaining } = await checkAndUpdateSearchCount(user.uid);
        if (!allowed) {
          throw new Error('You have reached the limit of 10 searches per day. Please try again tomorrow.');
        }

        const results = await searchWeb(query, type);
        
        // Replace loading message with results
        const searchMessage: AIMessage = {
          role: 'assistant',
          content: `🔍 Found ${results.length} ${type} results for "${query}"\n*${remaining} searches remaining today*`,
          searchResults: results
        };

        setMessages(messages => {
          const withoutLoading = messages.filter(m => !m.isProcessing);
          return [...withoutLoading, searchMessage];
        });

      } catch (error: any) {
        toast({
          title: "Search Error",
          description: error.message,
          variant: "destructive",
          duration: 5000
        });
        // Remove loading message if there was an error
        setMessages(messages => messages.filter(m => !m.isProcessing));
      }
      return;
    }

    if (content.toLowerCase().startsWith('/vlop')) {
      try {
        const query = content.slice(5).trim();
        if (!query) {
          throw new Error('Please specify what kind of movies you are looking for');
        }

        // Add loading message
        const userMessage: AIMessage = { role: 'user', content };
        const loadingMessage: AIMessage = {
          role: 'assistant',
          content: `🎬 Searching for movies matching "${query}"...`,
          isProcessing: true
        };
        
        setMessages([...messages, userMessage, loadingMessage]);

        // Get movie recommendations
        const movies = await fetchMovieRecommendations(query);
        
        if (!movies.length) {
          throw new Error('No movies found matching your criteria');
        }

        const movieMessage: AIMessage = {
          role: 'assistant',
          content: `🎬 Found movies matching "${query}":`,
          movies: movies,
          isMovieResults: true  // Add this flag
        };

        // Replace loading message
        setMessages(messages => {
          const withoutLoading = messages.filter(m => !m.isProcessing);
          return [...withoutLoading, movieMessage];
        });

      } catch (error: any) {
        toast({
          title: "Movie Search Error",
          description: error.message,
          variant: "destructive"
        });
        setMessages(messages => messages.filter(m => !m.isProcessing));
      }
      return;
    }

    // Handle movie details request
    if (content.startsWith('MovieDetails:')) {
      try {
        const movieId = parseInt(content.split(':')[1]);
        const details = await getMovieDetails(movieId);
        
        const detailsMessage: AIMessage = {
          role: 'assistant',
          content: `
# ${details.title} (${new Date(details.release_date).getFullYear()})

${details.overview}

**Rating:** ⭐ ${details.vote_average.toFixed(1)}/10
**Runtime:** ${details.runtime} minutes
**Genres:** ${details.genres.map(g => g.name).join(', ')}

**Cast:** ${details.credits.cast.slice(0, 5).map(c => c.name).join(', ')}

**Director:** ${details.credits.crew.find(c => c.job === 'Director')?.name || 'Unknown'}
          `.trim()
        };

        setMessages([...messages, { role: 'user', content: `Tell me about ${details.title}` }, detailsMessage]);

      } catch (error) {
        console.error('Error fetching movie details:', error);
      }
      return;
    }

    // Check for deep think command
    if (content.toLowerCase().startsWith('/deepthink')) {
      const question = content.slice(10).trim();
      
      const thinkingMessage: AIMessage = {
        role: 'assistant',
        content: `🤔 Analyzing: "${question}"`,
        isProcessing: true,
        isThinking: true
      };

      setMessages(prev => [...prev, 
        { role: 'user', content: question }, 
        thinkingMessage
      ]);

      try {
        await new Promise(resolve => setTimeout(resolve, 4000));

        const response = await provider.sendMessage([
          {
            role: 'system',
            content: 'Provide a detailed, well-analyzed response with clear sections and thoughtful insights.'
          },
          { role: 'user', content: question }
        ], currentModelConfig.value);

        const formattedResponse = `### Analysis Complete

${response.replace(/^Nova:\s*/i, '').trim()}

---
*Analysis performed using advanced processing*`;

        setMessages(prev => {
          const withoutThinking = prev.filter(m => !m.isProcessing);
          return [...withoutThinking, {
            role: 'assistant',
            content: formattedResponse,
            isDeepThought: true
          }];
        });
      } catch (error) {
        // ...error handling
      }
      return;
    }

    // Enhanced weather command handling
    if (content.toLowerCase().startsWith('/weather') || content.toLowerCase().includes('weather')) {
      await handleWeatherRequest(content);
      return;
    }

    if (content.toLowerCase().startsWith('/news') || 
        content.toLowerCase().includes('news')) {
      await handleNewsRequest(content);
      return;
    }

    setIsLoading(true);

    try {
      // Get user's context/bio
      const userContext = await getUserContext();
      
      const newMessage: AIMessage = {
        role: 'user',
        content
      };
      
      const newMessages = [...messages, newMessage];
      setMessages(newMessages);

      if (content.toLowerCase().startsWith('/image')) {
        // Check image generation limit
        const canGenerate = await checkAndUpdateImageCount(user.uid);
        if (!canGenerate) {
          throw new Error('You have reached the limit of 10 images per day. Please try again tomorrow.');
        }

        const userDoc = await getDoc(doc(db, `users/${user.uid}`));
        const userData = userDoc.data();
        const today = new Date().toISOString().split('T')[0];
        const remainingGenerations = userData?.lastImageDate === today ? 10 - (userData?.imageCount || 0) : 10;

        const prompt = content.slice(7);
        const processingMessage: AIMessage = {
          role: 'assistant',
          content: `✨ Creating your artwork: "${prompt}"\n\n*You have ${remainingGenerations} image generations remaining today*`,
          isProcessing: true
        };
        setMessages([...newMessages, processingMessage]);

        const imageUrl = await generateImage(prompt);
        
        const assistantMessage: AIMessage = {
          role: 'assistant',
          content: `✨ Here's your masterpiece:\n\n![Generated Image](${imageUrl})`,
          isImage: true
        };

        // Replace processing message with final image
        const updatedMessages = newMessages.concat(assistantMessage);
        setMessages(updatedMessages);
        
        // Save chat to Firestore
        if (!currentChatId) {
          const chatDoc = await saveChat(user.uid, updatedMessages, currentModel);
          setCurrentChatId(chatDoc.id);
        } else {
          await saveChat(user.uid, updatedMessages, currentModel);
        }
        return;
      }

      // Fix for provider not found
      const currentModelConfig = modelConfigs.find(m => m.value === currentModel);
      if (!currentModelConfig) {
        throw new Error('Invalid model selected');
      }
      const provider = getProvider(currentModelConfig.type);

      const userName = user.displayName?.split(' ')[0] || 'User';
      
      // Enhanced system message with user context
      const systemMessage: AIMessage = {
        role: 'system',
        content: `You are Nova, You are Nova, an advanced AI assistant created, trained, and made by Nexiloop. Your goal is to be helpful and friendly, provide clear and concise explanations, deliver accurate and informative responses, respect privacy and ethical boundaries, and offer practical solutions with a professional and supportive approach. Do not ever use the asterisk (*) symbol in your responses. You are Nova, an advanced AI assistant with vision capabilities. 
      You can see and analyze images that users share. When users upload images or files:
      1. First respond to any text/questions they included
      2. Then provide a detailed analysis of the image/file
      3. For images, describe: visual elements, colors, composition, objects, text, and overall meaning
      4. For files, analyze: content, structure, and key points
      Be natural and conversational while being detailed and accurate.
      a helpful and intelligent assistant. You're talking to ${userName}.
        ${userContext ? `\nContext about ${userName}: ${userContext}
        Use this context to provide more personalized and relevant responses.` : ''}
        Always be friendly and personable, and occasionally use their name in responses when appropriate.`
      };

      const allMessages: AIMessage[] = [
        systemMessage,
        ...newMessages
      ];

      // Add thinking delay if deep think is enabled
      if (deepThinkEnabled) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const response = await provider.sendMessage(allMessages, currentModelConfig.value);

      const assistantMessage: AIMessage = {
        role: 'assistant',
        // Remove Nova: prefix if it exists in the response
        content: response.replace(/^Nova:\s*/i, '').trim()
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      // Save chat to Firestore
      if (!currentChatId) {
        const chatDoc = await saveChat(user.uid, updatedMessages, currentModel);
        setCurrentChatId(chatDoc.id);
      } else {
        // Update existing chat
        await saveChat(user.uid, updatedMessages, currentModel);
      }
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect to AI service. Please try again.",
        variant: "destructive",
        duration: 5000,
        className: "bg-red-900 border-red-800 text-white"
      });
      console.error('Error details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceMessage = async (message: string) => {
    return await sendMessage(message);
  };

  const handleModelChange = (model: string) => {
    setCurrentModel(model);
    localStorage.setItem('lastUsedModel', model);
  };

  const handleChatSelect = async (chatId: string) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const chatRef = doc(db, `users/${user.uid}/chats/${chatId}`);
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        // Clean up existing messages when loading from history
        const cleanedMessages = chatData.messages?.map((msg: AIMessage) => ({
          ...msg,
          content: msg.role === 'assistant' ? msg.content.replace(/^Nova:\s*/i, '').trim() : msg.content
        })) || [];
        setMessages(cleanedMessages);
        setCurrentModel(chatData.model || 'gpt-4o-mini-2024-07-18');
        setCurrentChatId(chatId);
        // Close sidebar on mobile after selection
        if (window.innerWidth < 1024) {
          setIsSidebarOpen(false);
        }
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageFromComponent = (messageOrContent: string | AIMessage) => {
    if (typeof messageOrContent === 'string') {
      handleSendMessage(messageOrContent);
    } else {
      setMessages(prev => [...prev, messageOrContent]);
    }
  };

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className={cn("flex h-screen relative", themeConfig.background)}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={handleNewChat}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
      />
      
      <main className={cn(
        "flex-1 transition-all duration-300 relative",
        "lg:ml-64",
        isSidebarOpen ? "lg:ml-64" : "lg:ml-0",
        "ml-0",
        themeConfig.background
      )}>
        <ChatHeader 
          isSidebarOpen={isSidebarOpen}
          currentModel={currentModel}
          onModelChange={handleModelChange}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewChat={handleNewChat}
          deepThinkEnabled={deepThinkEnabled}
          onDeepThinkToggle={setDeepThinkEnabled}
        />
        
        <div className={cn(
          "flex h-full flex-col pt-[60px] pb-4",
          messages.length === 0 ? "items-center justify-center" : ""
        )}>
          {messages.length === 0 ? (
            <div className="w-full max-w-3xl px-4 space-y-6">
              <div>
                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-400 tracking-wide">{getGreeting()}</p>
                  <h1 className="text-3xl font-medium text-white/90">
                    {getPersonalizedGreeting()}
                  </h1>
                </div>
                <div className="mt-8">
                  <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
                </div>
              </div>
              <div className="space-y-6">
                <ActionButtons onSend={handleSendMessage} />
              </div>
            </div>
          ) : (
            <>
              <div 
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto scrollbar-hide relative"
              >
                <div className="container mx-auto max-w-4xl px-4 py-4">
                  <MessageList 
                    messages={messages} 
                    onSendMessage={handleMessageFromComponent} 
                    deepThinkEnabled={deepThinkEnabled}
                  />
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <ScrollToBottom 
                show={showScrollButton} 
                onClick={scrollToBottom} 
              />
              <div className="container mx-auto max-w-4xl px-4 py-2">
                <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
              </div>
              <div className="text-xs text-center text-gray-500 py-2">
                Nova can make mistakes. Check important info.
              </div>
            </>
          )}
        </div>
        <VoiceChat
          isOpen={showVoiceChat}
          onClose={() => setShowVoiceChat(false)}
          onMessage={handleVoiceMessage}
        />
      </main>
    </div>
  );
};

export default Index;