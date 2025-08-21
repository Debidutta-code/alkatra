import React from 'react';
import { ArrowRight, Gift, Shield, Lock, Star, X } from 'lucide-react';
import Button from '../UserProfileComponents/Button';

interface ChatbotInitialProps {
  onStartChat: () => void;
  onClose: () => void;
}

const ChatbotInitial: React.FC<ChatbotInitialProps> = ({ onStartChat, onClose }) => (
  <div className="p-4">
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-[var(--color-secondary-black)]">AI Chatbot</h3>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
    <p className="text-sm text-[var(--color-secondary-black)]/60 mb-6">
      Our chatbot is here to assist you instantly. Ask questions and get immediate responses.
    </p>
    <div className="mb-6">
      <p className="text-sm font-medium text-[var(--color-secondary-black)] mb-3">What do you want to know?</p>
      <ul className="space-y-3">
        <li className="flex items-center gap-3 text-sm">
          <Gift className="h-5 w-5 text-blue-500" />
          Is there a free trial available?
        </li>
        <li className="flex items-center gap-3 text-sm">
          <Shield className="h-5 w-5 text-blue-500" />
          How is my data protected?
        </li>
        <li className="flex items-center gap-3 text-sm">
          <Lock className="h-5 w-5 text-blue-500" />
          Can I cancel my subscription at any time?
        </li>
        <li className="flex items-center gap-3 text-sm">
          <Star className="h-5 w-5 text-yellow-500" />
          What&apos;s New.
        </li>
      </ul>
    </div>
    <Button 
      variant="outline" 
      size="md" 
      className="w-full flex items-center justify-between" 
      onClick={onStartChat}
    >
      Talk with chatbot
      <ArrowRight className="h-4 w-4" />
    </Button>
    <p className="text-xs text-center text-[var(--color-secondary-black)]/50 mt-4">Powered by RASA</p>
  </div>
);

export default ChatbotInitial;