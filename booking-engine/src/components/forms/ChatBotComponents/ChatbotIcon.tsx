import React from 'react';
import { Bot } from 'lucide-react';
import Button from '../UserProfileComponents/Button';

interface ChatbotIconProps {
  onClick: () => void;
}

const ChatbotIcon: React.FC<ChatbotIconProps> = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="bg-transparent border-none p-0 cursor-pointer hover:opacity-80 transition-opacity"
  >
    <img 
      src="/assets/chatbot.png" 
      alt="Chatbot Icon" 
      className="h-12 w-15"
    />
  </button>
);

export default ChatbotIcon;