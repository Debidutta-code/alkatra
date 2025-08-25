import React from 'react';
import { X, Smile, Paperclip, Send, Bot } from 'lucide-react';
import Button from '../UserProfileComponents/Button';
import Avatar from '../UserProfileComponents/Avatar';
import { ChatBotApi } from '../../../api'

interface ChatbotConversationProps {
  onClose: () => void;
  onFeedback: () => void;
  userFirstName: string;
}

const ChatbotConversation: React.FC<ChatbotConversationProps> = ({ onClose, onFeedback, userFirstName }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Header area - matching initial page style */}
      <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-4 pb-2 rounded-t-2xl w-full max-w-md">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-md font-semibold text-white">Al-Hajz Chatbot</h4>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Close chatbot"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Body area - matching initial page style */}
      <div className="bg-gray-50 w-full max-w-md rounded-b-2xl shadow-lg p-4">

        {/* Your existing chat messages */}
        <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
          <div className="flex items-end gap-2">
            <Avatar size="sm" fallback={<Bot className="h-4 w-4" />} />
            <div className="bg-purple-100 text-[var(--color-secondary-black)] text-sm rounded-lg p-3 max-w-[80%]">
              Welcome, {userFirstName}! 👋
            </div>
            <p className="text-xs text-[var(--color-secondary-black)]/50">1h ago</p>
          </div>
          <div className="flex items-end gap-2">
            <Avatar size="sm" fallback={<Bot className="h-4 w-4" />} />
            <div className="bg-purple-100 text-[var(--color-secondary-black)] text-sm rounded-lg p-3 max-w-[80%]">
              I'm your Al-Hajz Chat Bot, here to assist you with booking management, account queries, and more. ✨
            </div>
            <p className="text-xs text-[var(--color-secondary-black)]/50">1h ago</p>
          </div>
          <div className="flex items-end gap-2">
            <Avatar size="sm" fallback={<Bot className="h-4 w-4" />} />
            <div className="bg-purple-100 text-[var(--color-secondary-black)] text-sm rounded-lg p-3 max-w-[80%]">
              How can I help you today?
            </div>
            <p className="text-xs text-[var(--color-secondary-black)]/50">1h ago</p>
          </div>
          <div className="flex items-end gap-2 justify-end">
            <div className="bg-blue-100 text-[var(--color-secondary-black)] text-sm rounded-lg p-3 max-w-[80%]">
              Can you tell me more about your product?
            </div>
            <p className="text-xs text-[var(--color-secondary-black)]/50">1m ago</p>
          </div>
          <div className="flex items-end gap-2">
            <Avatar size="sm" fallback={<Bot className="h-4 w-4" />} />
            <div className="bg-purple-100 text-[var(--color-secondary-black)] text-sm rounded-lg p-3 max-w-[80%]">
              Our platform is an innovative solution that helps users manage their bookings efficiently. ✨
            </div>
            <p className="text-xs text-[var(--color-secondary-black)]/50">7:20</p>
          </div>
        </div>

        {/* Your existing input area */}
        <div className="border-t border-gray-200 pt-4 pb-1">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything ..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <Smile className="h-5 w-5 text-gray-500 cursor-pointer" />
            <Paperclip className="h-5 w-5 text-gray-500 cursor-pointer" />
            <Button variant="ghost" size="sm" className="p-1">
              <Send className="h-5 w-5 text-purple-600" />
            </Button>
          </div>
        </div>

        {/* Your existing feedback button */}
        {/* <Button variant="outline" size="sm" className="w-full" onClick={onFeedback}>
        Provide Feedback
      </Button> */}
      </div>
    </div>
  )
};

export default ChatbotConversation;