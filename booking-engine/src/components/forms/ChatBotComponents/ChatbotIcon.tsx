import React from 'react';
import { Bot } from 'lucide-react';
import Button from '../UserProfileComponents/Button';

interface ChatbotIconProps {
  onClick: () => void;
}

const ChatbotIcon: React.FC<ChatbotIconProps> = ({ onClick }) => (
  <Button 
    variant="primary" 
    size="lg" 
    className="rounded-full p-4 shadow-sm" 
    onClick={onClick}
  >
    <img 
      src="/assets/chatbot.png" 
      alt="Chatbot Icon" 
      className="h-12 w-15 object-contain"
    />
  </Button>
);

export default ChatbotIcon;