import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/Redux/store';
import { X, Send, AlertCircle, Bot, User, RefreshCw, Minimize2, Maximize2 } from 'lucide-react';
import { ChatBotApi } from '@/api';
import {
  addUserMessage,
  addBotMessage,
  setBotTyping,
  setChatError,
  updateMessageStatus,
  initializeWelcomeMessages,
} from '../../../Redux/slices/chatbot.slice';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

interface ChatbotConversationProps {
  onClose: () => void;
  userFirstName: string;
  isOnline: boolean;
}

const ChatbotConversation: React.FC<ChatbotConversationProps> = ({
  onClose,
  userFirstName,
  isOnline 
}) => {
  const [chatInput, setChatInput] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBotApi = ChatBotApi.getInstance();
  const dispatch = useDispatch<AppDispatch>();
  const isShowingWelcome = useSelector((state: RootState) => state.chat.isShowingWelcome);
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

  const welcomeInitialized = useRef(false);
  useEffect(() => {
    if (welcomeInitialized.current) return;

    const skipWelcome = sessionStorage.getItem('skipWelcome') === 'true';

    if (!skipWelcome) {
      dispatch(initializeWelcomeMessages(userFirstName));
    }

    sessionStorage.removeItem('skipWelcome');
    welcomeInitialized.current = true;

  }, [dispatch, userFirstName]);

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
  const clearError = () => {
    dispatch(setChatError(null));
  };

  return (
    <div className={`flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${isMinimized ? 'w-72 h-14' : 'w-full max-w-xs h-[500px]'
      }`}>

      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-br from-[#076DB3] via-[#054B8F] to-[#043A73] p-3">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-white rounded-full translate-x-8 translate-y-8"></div>
        </div>

        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Enhanced Bot Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-7 h-7 bg-white rounded-lg shadow-lg flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 text-[#076DB3]" />
              </div>
              {/* Connection status indicator */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${isOnline ? 'bg-green-400' : 'bg-red-400'
                } ${isOnline ? 'animate-pulse' : ''}`}></div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold font-noto-sans text-sm truncate">
                Al-Hajz Assistant
              </h4>
              <p className="text-blue-100 text-xs font-noto-sans truncate">
                {isOnline ? 'Online • Instant replies' : 'Reconnecting...'}
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
              aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
            >
              {isMinimized ? (
                <Maximize2 className="h-3.5 w-3.5 text-white" />
              ) : (
                <Minimize2 className="h-3.5 w-3.5 text-white" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200"
              aria-label="Close chatbot"
            >
              <X className="h-3.5 w-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Conversation Body - Hidden when minimized */}
      {!isMinimized && (
        <>
          {/* Enhanced Error Banner */}
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 text-sm font-medium">Connection Error</p>
                  <p className="text-red-700 text-xs mt-1">{error}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Dismiss error"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                  <button
                    onClick={clearError}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Close error"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
            <div className="h-full max-h-80 overflow-y-auto px-3 py-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`animate-in slide-in-from-bottom-3 duration-300`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ChatMessage
                    message={message}
                    userFirstName={userFirstName}
                    onRetry={handleRetry}
                  />
                </div>
              ))}

              {/* Enhanced Typing indicator */}
              {isTyping && (
                <div className="animate-in slide-in-from-bottom-3 duration-300">
                  <TypingIndicator />
                </div>
              )}

              {/* Auto-scroll target */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Enhanced Input Area */}
          <div className="border-t border-gray-200 bg-white p-3">
            <div className="flex items-end gap-2">
              {/* User Avatar */}
              <div className="w-7 h-7 bg-gradient-to-br from-[#076DB3] to-[#054B8F] rounded-full flex items-center justify-center flex-shrink-0 mb-1">
                <User className="h-3.5 w-3.5 text-white" />
              </div>

              {/* Input Container */}
              <div className="flex-1 relative">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isTyping || !isOnline || isShowingWelcome}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 pr-10 text-sm 
           focus:outline-none focus:border-[#076DB3] focus:ring-1 focus:ring-[#076DB3]/20 
           disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
           placeholder:text-gray-400 font-noto-sans"
                    maxLength={500}
                  />

                  {/* Character count */}
                  {chatInput.length > 400 && (
                    <div className="absolute -top-6 right-0 text-xs text-gray-500">
                      {chatInput.length}/500
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || isTyping || !isOnline}
                  className={`absolute right-1 bottom-2 p-1.5 rounded-lg transition-all duration-200 ${chatInput.trim() && !isTyping && isOnline
                    ? 'bg-gradient-to-r from-[#076DB3] to-[#054B8F] text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Enhanced Status Bar */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 font-noto-sans">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                  }`}></div>
                <span>{isOnline ? 'Connected' : 'Reconnecting...'}</span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-300">•</span>
                <span>AI Powered</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <div className="flex items-center justify-between p-3 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-[#076DB3] to-[#054B8F] rounded-lg flex items-center justify-center">
              <Bot className="h-3 w-3 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 font-noto-sans">Al-Hajz Assistant</p>
              {messages.length > 0 && (
                <p className="text-xs text-gray-500 font-noto-sans truncate max-w-40">
                  {messages[messages.length - 1]?.sender === 'bot'
                    ? messages[messages.length - 1]?.text.substring(0, 30) + '...'
                    : 'You: ' + messages[messages.length - 1]?.text.substring(0, 20) + '...'
                  }
                </p>
              )}
            </div>
          </div>

          {/* Unread indicator */}
          {isTyping && (
            <div className="w-2 h-2 bg-[#076DB3] rounded-full animate-pulse"></div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatbotConversation;