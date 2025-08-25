import React, { useState } from 'react';
import { Card } from '../UserProfileComponents';
import ChatbotIcon from './ChatbotIcon';
import ChatbotInitial from './ChatbotInitial';
import ChatbotConversation from './ChatbotConversation';
import ChatbotFeedback from './ChatbotFeedback';

type View = 'initial' | 'chat' | 'feedback';

interface ChatbotProps {
  userFirstName: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ userFirstName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>('initial');

  const handleOpen = () => {
    setIsOpen(true);
    setView('initial');
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleChangeView = (newView: View) => {
    setView(newView);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <Card className="w-96 mb-4 shadow-xl">
          {view === 'initial' && (
            <ChatbotInitial
              onStartChat={() => handleChangeView('chat')}
              onClose={handleClose}
            />
          )}
          {view === 'chat' && (
            <ChatbotConversation
              onClose={handleClose}
              onFeedback={() => handleChangeView('feedback')}
              userFirstName={userFirstName}
            />
          )}
          {view === 'feedback' && (
            <ChatbotFeedback
              onClose={handleClose}
            />
          )}
        </Card>
      )}
      <div className="relative right-0">
        <ChatbotIcon onClick={handleOpen} />
      </div>
    </div>
  );
};

export default Chatbot;