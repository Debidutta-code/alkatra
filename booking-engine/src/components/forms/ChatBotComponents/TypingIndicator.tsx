import React from 'react';
import { Bot } from 'lucide-react';
import Avatar from '../UserProfileComponents/Avatar';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-end gap-2 animate-in slide-in-from-bottom-2 duration-300">
      <Avatar size="sm" fallback={<Bot className="h-4 w-4" />} />
      <div className="bg-purple-100 text-gray-800 text-sm rounded-lg p-3">
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div 
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div 
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
          <span className="text-xs text-gray-500 ml-2">Bot is typing...</span>
        </div>
      </div>
      <div className="text-xs text-gray-500 self-end mb-1">
        Just now
      </div>
    </div>
  );
};

export default TypingIndicator;