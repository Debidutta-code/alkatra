import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/Redux/store';
import { ChatBotApi } from '@/api';
import { setSessionId, clearMessages, addUserMessage, setBotTyping, addBotMessage } from '../../../Redux/slices/chatbot.slice';
import { ArrowRight, Smartphone, HelpCircle, Building, Download, X, MessageCircle, ChevronDown, User } from 'lucide-react';

interface ChatbotPageProps {
  onStartChat: () => void;
  onClose: () => void;
  onLogin: () => void;
  isAuthenticated: boolean;
}

const ChatbotPage: React.FC<ChatbotPageProps> = ({ onStartChat, onClose, onLogin, isAuthenticated }) => {
  const [isQuestionsExpanded, setIsQuestionsExpanded] = React.useState(true);
  const chatBotApi = new ChatBotApi();
  const dispatch = useDispatch<AppDispatch>();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const sessionId = useSelector((state: RootState) => state.chat.sessionId);

  const newGenerateSessionid = async (accessToken: string) => {
    if (!accessToken) return;

    try {
      const newSessionId = await chatBotApi.generateSessionId(accessToken);
      if (!newSessionId) {
        throw new Error("Chatbot session can't generate");
      }
      console.log(`Session ID generated: ${newSessionId}`);
      dispatch(setSessionId(newSessionId));
    } catch (error) {
      console.error('Error generating session ID:', error);
    }
  };

  const handleQuickQuestion = async (question: string) => {
    if (!isAuthenticated || !accessToken) {
      onLogin();
      return;
    }
    if (!sessionId) {
      await newGenerateSessionid(accessToken);
    }

    dispatch(clearMessages());
    sessionStorage.setItem('skipWelcome', 'true');
    console.log('Quick question selected, skipWelcome set to:', sessionStorage.getItem('skipWelcome')); // ✅ Correct
    console.log('📋 Full sessionStorage:', { ...sessionStorage }); // Shows all items
    onStartChat();

    setTimeout(async () => {
      dispatch(addUserMessage({ text: question }));
      dispatch(setBotTyping(true));

      try {
        const currentSessionId = sessionId || await chatBotApi.generateSessionId(accessToken);
        const botResponse = await chatBotApi.chatApi(accessToken, currentSessionId, question);

        if (botResponse && botResponse.reply) {
          dispatch(addBotMessage({ text: botResponse.reply }));
        } else {
          dispatch(addBotMessage({
            text: "I'm sorry, I couldn't process your request. Please try again."
          }));
        }
      } catch (error) {
        console.error('Quick question API error:', error);
        dispatch(addBotMessage({
          text: "I'm experiencing some technical difficulties. Please try again in a moment."
        }));
      }
    }, 500);
  };

  const quickQuestions = [
    {
      id: 'app-usage',
      question: "How do I use the Alhajz app?",
      icon: Smartphone,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'app-purpose',
      question: "What is the Alhajz app for?",
      icon: HelpCircle,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'hotel-booking',
      question: "Can I book hotels through this app?",
      icon: Building,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'free-download',
      question: "Is Alhajz free to download?",
      icon: Download,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="flex flex-col w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-br from-[#076DB3] via-[#054B8F] to-[#043A73] p-4">
        {/* Header Content */}
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-3 w-3 text-white" />
              </div>
              <h4 className="text-md font-semibold text-white font-noto-sans">Al-Hajz Assistant</h4>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200"
              aria-label="Close chatbot"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Bot Avatar & Welcome */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-lg mb-3">
              <div className="text-2xl">🤖</div>
            </div>
            <h2 className="text-white text-md font-semibold font-noto-sans mb-1">
              Welcome to Al-Hajz Support
            </h2>
            <p className="text-blue-100 text-xs font-noto-sans">
              Get instant help with bookings and travel assistance
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-2 bg-gray-50">
        {/* Quick Questions Section */}
        {isAuthenticated && (
          <div className="mb-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setIsQuestionsExpanded(!isQuestionsExpanded)}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                aria-label={isQuestionsExpanded ? "Collapse questions" : "Expand questions"}
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#076DB3]/10 rounded flex items-center justify-center">
                    <HelpCircle className="h-3 w-3 text-[#076DB3]" />
                  </div>
                  <span className="text-gray-800 font-medium font-noto-sans text-sm">Common Questions</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isQuestionsExpanded ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {isQuestionsExpanded && (
                <div className="border-t border-gray-100">
                  <div className="p-2 space-y-2">
                    {quickQuestions.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={item.id}
                          className="group flex items-center w-full text-left p-0.5 rounded hover:bg-gray-50 transition-all duration-200"
                          onClick={() => isAuthenticated ? handleQuickQuestion(item.question) : onLogin()}
                        >
                          <div className={`w-6 h-6 ${item.bgColor} rounded flex items-center justify-center mr-2 group-hover:scale-105 transition-transform duration-200`}>
                            <IconComponent className={`h-4 w-4 ${item.iconColor}`} />
                          </div>
                          <span className="text-gray-700 text-sm font-noto-sans group-hover:text-[#076DB3] transition-colors duration-200">
                            {item.question}
                          </span>
                          <ArrowRight className="h-3 w-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Authentication Check Section */}
        {!isAuthenticated ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-gray-800 font-semibold font-noto-sans text-sm mb-2">Login Required</h3>
              <p className="text-gray-600 text-xs font-noto-sans mb-4">
                Please log in to start a conversation with our AI assistant
              </p>
              <button
                onClick={onLogin}
                className="w-full bg-gradient-to-r from-[#076DB3] to-[#054B8F] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 font-medium text-sm"
              >
                Go to Login
              </button>
            </div>
          </div>
        ) : (
          // Your existing Start Chat Section
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-[#076DB3]/10 rounded flex items-center justify-center">
                    <MessageCircle className="h-3 w-3 text-[#076DB3]" />
                  </div>
                  <h3 className="text-gray-800 font-semibold font-noto-sans text-sm">Start Conversation</h3>
                </div>
                <p className="text-gray-600 text-xs font-noto-sans">
                  Chat with our AI assistant for instant help
                </p>
              </div>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    onLogin();
                    return;
                  }
                  dispatch(clearMessages());
                  onStartChat();
                  if (accessToken) {
                    newGenerateSessionid(accessToken);
                  }
                }}
                className="group ml-3 flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#076DB3] to-[#054B8F] text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </button>
            </div>
          </div>
        )}

        {/* Features Footer */}
        <div className="mt-4">
          <div className="flex items-center justify-center gap-16 text-xs text-gray-500 font-noto-sans">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>24/7</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>Instant</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
              <span>AI Powered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;