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
    className="rounded-full p-4 shadow-lg bg-purple-600 hover:bg-purple-700" 
    onClick={onClick}
  >
    <Bot className="h-6 w-6" />
  </Button>
);

export default ChatbotIcon;