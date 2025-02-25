import MessageAvatar from './MessageAvatar';
import MessageActions from './MessageActions';
import { Message as AIMessage } from '@/lib/models/types';

type MessageProps = Omit<AIMessage, 'role'> & {
  role: 'user' | 'assistant';  // Restrict to only user/assistant for display
};

const Message = ({ role, content }: MessageProps) => {
  return (
    <div className="py-6 group">
      <div className={`flex gap-4 ${role === 'user' ? 'flex-row-reverse' : ''}`}>
        <div className={`flex-1 space-y-2 ${role === 'user' ? 'flex justify-end' : ''}`}>
          <div className={`${role === 'user' ? 'bg-gray-700/50 rounded-[20px] px-4 py-2 inline-block' : ''}`}>
            {content}
          </div>
          {role === 'assistant' && <MessageActions content={content} />}
        </div>
      </div>
    </div>
  );
};

export default Message;