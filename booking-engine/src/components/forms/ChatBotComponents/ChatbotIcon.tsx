import React from 'react';

interface ChatbotIconProps {
  onClick: () => void;
  disabled?: boolean;
}

const ChatbotIcon: React.FC<ChatbotIconProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="bg-transparent border-none p-0 cursor-pointer hover:opacity-99 transition-opacity"
    aria-label="Open chatbot"
  >
    <img
      src="/assets/chatbot.png"
      alt="Chatbot Icon"
      className="h-14 w-18"
    />
  </button>
);

export default ChatbotIcon;