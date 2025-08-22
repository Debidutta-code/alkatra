import React from 'react';
import { ArrowRight, Gift, Shield, Lock, Star, X } from 'lucide-react';
import Button from '../UserProfileComponents/Button';

interface ChatbotInitialProps {
  onStartChat: () => void;
  onClose: () => void;
}

const ChatbotInitial: React.FC<ChatbotInitialProps> = ({ onStartChat, onClose }) => {

  const Header = () => (
    <div className="flex justify-between items-center mb-4 bg-blue-500 p-4 w-full">
      <h3 className="text-lg font-semibold text-[var(--color-secondary-black)]">Al-Hajz Chatbot</h3>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )

  const Body = () => (
    <div>
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

  return (
    <div className="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4 pb-8 rounded-t-2xl w-full h-40">

      {/* top row with Chat bot title and close button */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-md font-semibold text-white">Al-Hajz Chatbot</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          <X className="h-4 w-4 text-white" />
        </button>
      </div>

      <div className="flex flex-col items-center">

        {/* Middle screen Chatbot logo  */}
        <div className="w-16 h-16 mb-3">
          <img
            src="/assets/chatbot.png"
            alt="Chatbot"
            className="w-16 h-16 object-contain"
          />
        </div>

        <p className="items-center text-white text-md font-semibold">
          Our chatbot is here to assist you instantly
        </p>

      </div>
    </div>
  );
}

export default ChatbotInitial;