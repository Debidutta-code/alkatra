import React from 'react';

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
      className="h-14 w-18"
    />
  </button>
);

export default ChatbotIcon;