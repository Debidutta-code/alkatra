import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/Redux/store';
import { X, Smile, Paperclip, Send, AlertCircle } from 'lucide-react';
import Button from '../UserProfileComponents/Button';
import { ChatBotApi } from '@/api';
import {
  addUserMessage,
  addBotMessage,
  setBotTyping,
  setChatError,
  updateMessageStatus,
  initializeWelcomeMessages
} from '../../../Redux/slices/chatbot.slice';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

interface ChatbotConversationProps {
  onClose: () => void;
  onFeedback: () => void;
  userFirstName: string;
}

const ChatbotConversation: React.FC<ChatbotConversationProps> = ({
  onClose,
  onFeedback,
  userFirstName
}) => {
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatBotApi = ChatBotApi.getInstance();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const { messages, isTyping, error, sessionId } = useSelector((state: RootState) => state.chat);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize welcome messages when component mounts
  useEffect(() => {
    if (messages.length === 0) {
      dispatch(initializeWelcomeMessages({ userFirstName }));
    }
  }, [dispatch, userFirstName, messages.length]);

  // Retry failed message
  const handleRetry = (messageText: string) => {
    setChatInput(messageText);
  };

  // Send message function
  const handleSendMessage = async () => {
    if (!chatInput.trim() || !accessToken || !sessionId) return;

    const messageText = chatInput.trim();
    const messageId = Date.now().toString();

    // Add user message immediately
    dispatch(addUserMessage({ text: messageText }));
    setChatInput('');

    // Show typing indicator
    dispatch(setBotTyping(true));

    try {
      // Call API
      const botResponse = await chatBotApi.chatApi(accessToken, sessionId, messageText);

      // Add bot response
      if (botResponse && botResponse.reply) {
        dispatch(addBotMessage({ text: botResponse.reply }));
      } else {
        dispatch(addBotMessage({ text: "I'm sorry, I couldn't process your request. Please try again." }));
      }

      // Update user message status to sent
      dispatch(updateMessageStatus({ id: messageId, status: 'sent' }));

    } catch (error) {
      console.error('Chat error:', error);
      dispatch(setChatError('Failed to send message. Please try again.'));
      dispatch(addBotMessage({
        text: "I'm experiencing some technical difficulties. Please try again in a moment."
      }));

      // Update user message status to error
      dispatch(updateMessageStatus({ id: messageId, status: 'error' }));
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Header area */}
      <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-4 pb-2 rounded-t-2xl w-full max-w-md">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-md font-semibold text-white">Al-Hajz Chatbot</h4>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Close chatbot"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Body area */}
      <div className="bg-gray-50 w-full max-w-md rounded-b-2xl shadow-lg p-4">

        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
            <button
              onClick={() => dispatch(setChatError(null))}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Messages area */}
        <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-2">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              userFirstName={userFirstName}
              onRetry={handleRetry}
            />
          ))}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}

          {/* Auto-scroll target */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 pt-4 pb-1">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask anything ..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-50"
            />
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
              onClick={handleSendMessage}
              disabled={!chatInput.trim() || isTyping}
            >
              <Send className={`h-5 w-5 ${chatInput.trim() && !isTyping ? 'text-purple-600' : 'text-gray-400'}`} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotConversation;