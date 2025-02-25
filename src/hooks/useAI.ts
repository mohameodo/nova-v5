import { useState } from 'react';
import { Message } from '@/lib/models/types';
import { getProvider } from '@/lib/providers';
import { modelConfigs } from '@/lib/models/config';
import { useAuth } from '@/hooks/useAuth';

export const useAI = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const sendMessage = async (message: string, model: string = 'gpt-4o-mini-2024-07-18') => {
    setIsProcessing(true);
    try {
      const currentModelConfig = modelConfigs.find(m => m.value === model);
      if (!currentModelConfig) {
        throw new Error('Invalid model selected');
      }

      const provider = getProvider(currentModelConfig.type);
      const userName = user?.displayName?.split(' ')[0] || 'User';

      const systemMessage = `You are Nova, a helpful and intelligent assistant. You're talking to ${userName}. Always be friendly and personable, and occasionally use their name in responses when appropriate.`;

      const messages: Message[] = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: message }
      ];

      const response = await provider.sendMessage(messages, currentModelConfig.value);
      return response.replace(/^Nova:\s*/i, '').trim();
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    sendMessage,
    isProcessing
  };
};
