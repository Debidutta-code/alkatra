import React from 'react';
import { Bot } from 'lucide-react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-end gap-2 animate-in slide-in-from-bottom-2 duration-300">
      {/* Enhanced Bot avatar with brand gradient */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-[#076DB3] to-[#054B8F] rounded-full flex items-center justify-center shadow-md">
          <Bot className="h-4 w-4 text-white" />
        </div>
      </div>

      <div className="flex flex-col max-w-[85%]">
        {/* Enhanced typing bubble with brand colors */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 text-sm rounded-2xl px-4 py-3 
                        border border-gray-200 shadow-sm relative">

          <div className="flex items-center gap-3">
            {/* Enhanced bouncing dots with brand colors */}
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-[#076DB3] rounded-full animate-bounce opacity-70"></div>
              <div
                className="w-2 h-2 bg-[#076DB3] rounded-full animate-bounce opacity-70"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 bg-[#076DB3] rounded-full animate-bounce opacity-70"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>

            {/* Enhanced typing text */}
            <span className="text-xs text-gray-600 font-noto-sans font-medium">
              Al-Hajz Assistant is typing...
            </span>
          </div>

          {/* Message tail/pointer */}
          <div className="absolute bottom-0 -left-1.5 w-3 h-3 bg-gray-100 border-r border-b border-gray-200 
                          transform rotate-45"></div>
        </div>

        {/* Enhanced timestamp */}
        <div className="text-xs text-gray-500 mt-2 flex items-center justify-start font-noto-sans">
          <span className="bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
            Just now
          </span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;