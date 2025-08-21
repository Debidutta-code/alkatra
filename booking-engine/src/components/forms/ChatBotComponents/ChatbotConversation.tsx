import React from 'react';
import { X, Smile, Paperclip, Send, Bot } from 'lucide-react';
import Button from '../UserProfileComponents/Button';
import Avatar from '../UserProfileComponents/Avatar';

interface ChatbotConversationProps {
  onClose: () => void;
  onFeedback: () => void;
  userFirstName: string; 
}

const ChatbotConversation: React.FC<ChatbotConversationProps> = ({ onClose, onFeedback, userFirstName }) => (
  <div>
    <div className="bg-blue-500 text-white p-4 rounded-t-2xl flex justify-between items-center">
      <h3 className="text-lg font-semibold">Al-Hajz Chat Bot</h3>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
    <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
      <div className="flex items-end gap-2">
        <Avatar size="sm" fallback={<Bot className="h-4 w-4" />} />
        <div className="bg-purple-100 text-[var(--color-secondary-black)] rounded-lg p-3 max-w-[80%]">
          Welcome, {userFirstName}! 👋
        </div>
        <p className="text-xs text-[var(--color-secondary-black)]/50">1h ago</p>
      </div>
      <div className="flex items-end gap-2">
        <Avatar size="sm" fallback={<Bot className="h-4 w-4" />} />
        <div className="bg-purple-100 text-[var(--color-secondary-black)] rounded-lg p-3 max-w-[80%]">
          I’m your Al-Hajz Chat Bot, here to assist you with booking management, account queries, and more. ✨
        </div>
        <p className="text-xs text-[var(--color-secondary-black)]/50">1h ago</p>
      </div>
      <div className="flex items-end gap-2">
        <Avatar size="sm" fallback={<Bot className="h-4 w-4" />} />
        <div className="bg-purple-100 text-[var(--color-secondary-black)] rounded-lg p-3 max-w-[80%]">
          How can I help you today?
        </div>
        <p className="text-xs text-[var(--color-secondary-black)]/50">1h ago</p>
      </div>
      <div className="flex items-end gap-2 justify-end">
        <div className="bg-blue-100 text-[var(--color-secondary-black)] rounded-lg p-3 max-w-[80%]">
          Can you tell me more about your product?
        </div>
        <p className="text-xs text-[var(--color-secondary-black)]/50">1m ago</p>
      </div>
      <div className="flex items-end gap-2">
        <Avatar size="sm" fallback={<Bot className="h-4 w-4" />} />
        <div className="bg-purple-100 text-[var(--color-secondary-black)] rounded-lg p-3 max-w-[80%]">
          Our platform is an innovative solution that helps users manage their bookings efficiently. ✨
        </div>
        <p className="text-xs text-[var(--color-secondary-black)]/50">7:20</p>
      </div>
    </div>
    <div className="p-4 border-t border-gray-200">
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
    <div className="p-4 pt-0">
      <Button variant="outline" size="sm" className="w-full" onClick={onFeedback}>
        Provide Feedback
      </Button>
    </div>
  </div>
);

export default ChatbotConversation;