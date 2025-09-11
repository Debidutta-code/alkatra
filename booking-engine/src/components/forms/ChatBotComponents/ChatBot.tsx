import { useSelector } from 'react-redux';
import { RootState } from '../../../Redux/store';
import React, { useEffect, useState } from 'react';
import { Card } from '../UserProfileComponents';
import ChatbotIcon from './ChatbotIcon';
import ChatbotInitial from './ChatbotInitial';
import ChatbotConversation from './ChatbotConversation';
import { useRouter } from 'next/navigation';

type View = 'initial' | 'chat' | 'feedback';

interface ChatbotProps {
  userFirstName: string;
  isOnline: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ userFirstName, isOnline }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>('initial');
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const { user, accessToken } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = !!accessToken && !!user;
  const [isMinimized, setIsMinimized] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setView('initial');
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsHovered(false);
  };

  const handleLogin = () => {
    handleClose();
    router.push('/login');
  };

  const handleMouseEnter = () => {
    if (!isOpen) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleChangeView = (newView: View) => {
    setView(newView);
  };
  useEffect(() => {
    if (isOpen && !isMinimized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, isMinimized]);
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-end">
      {/* Chat Preview on Hover (shown beside icon) */}
      {isHovered && !isOpen && (
        <div className="mr-2 transform translate-x-0 animate-in slide-in-from-right-4 fade-in duration-300">
          <Card className="w-80 shadow-xl">
            <div className="p-3 bg-gradient-to-br from-[#076DB3] to-[#054B8F] text-white rounded-t-2xl">
              <p className="text-sm font-semibold">Al-Hajz Assistant</p>
              <p className="text-xs opacity-90">How can I help you?</p>
            </div>
            <div className="p-2 bg-gray-50 text-xs text-gray-600">
              Click to start chatting
            </div>
          </Card>
        </div>
      )}
      {isOpen && (
        <Card className="w-full max-w-xs mb-4 shadow-xl">
          {view === 'initial' && (
            <ChatbotInitial
              onStartChat={() => handleChangeView('chat')}
              onClose={handleClose}
              onLogin={handleLogin}
              isAuthenticated={isAuthenticated}
            />
          )}
          {view === 'chat' && isAuthenticated && (
            <ChatbotConversation onClose={handleClose} userFirstName={userFirstName} isOnline={isOnline} onMinimizedChange={setIsMinimized} />
          )}
        </Card>
      )}
      {!isOpen && (
        <div className="relative right-0"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}>
          <ChatbotIcon onClick={handleOpen} />
        </div>
      )}
    </div>
  );
};

export default Chatbot;