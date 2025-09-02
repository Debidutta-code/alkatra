import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/Redux/store';
import { ChatBotApi } from '@/api';
import { setSessionId, clearMessages, addUserMessage, setBotTyping, addBotMessage } from '../../../Redux/slices/chatbot.slice';
import { ArrowRight, Smartphone, HelpCircle, Building, Download, X } from 'lucide-react';

interface ChatbotPageProps {
  onStartChat: () => void;
  onClose: () => void;
}

const ChatbotPage: React.FC<ChatbotPageProps> = ({ onStartChat, onClose }) => {
  const [isQuestionsExpanded, setIsQuestionsExpanded] = React.useState(true);
  const chatBotApi = new ChatBotApi();
  const dispatch = useDispatch<AppDispatch>();

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const sessionId = useSelector((state: RootState) => state.chat.sessionId);

  if (!accessToken) {
    throw new Error("The JWT token didn't get for chatbot");
  }

  const newGenerateSessionid = async (accessToken: string) => {
    try {
      const newSessionId = await chatBotApi.generateSessionId(accessToken);

      if (!newSessionId) {
        throw new Error("Chatbot session can't generate");
      }

      console.log(`@@@@@@@@@@@@@ The session id we get ${newSessionId}`);
      dispatch(setSessionId(newSessionId));

      // Clear any existing messages when starting new session
      dispatch(clearMessages());

    } catch (error) {
      console.error('Error generating session ID:', error);
    }
  };

  // Handle quick question clicks with dynamic API responses
  const handleQuickQuestion = async (question: string) => {
    if (!sessionId) {
      await newGenerateSessionid(accessToken);
    }

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

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Header area */}
      <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-4 pb-8 rounded-t-2xl w-full max-w-md">
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

        <div className="flex flex-col items-center justify-center">
          {/* Middle screen Chatbot logo */}
          <div className="w-12 h-12 mb-3">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold text-4xl">🤖</span>
            </div>
          </div>
          <h4 className="text-white text-sm font-semibold text-center">
            Our chatbot is here to assist you instantly
          </h4>
          <h5 className="text-white text-xs text-center">
            Ask questions and get immediate responses
          </h5>
        </div>
      </div>

      {/* Body area */}
      <div className="bg-gray-50 w-full max-w-md rounded-b-2xl shadow-lg p-4">

        {/* Top Box: What do you want to know? */}
        <div className="pb-4 mb-4">
          <div className="border-1 border-gray-100 bg-white shadow-lg rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-medium">What do you want to know?</span>
              <button
                onClick={() => setIsQuestionsExpanded(!isQuestionsExpanded)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                aria-label={isQuestionsExpanded ? "Collapse questions" : "Expand questions"}
              >
                <span className={`transition-transform duration-200 ${isQuestionsExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
            </div>
            {isQuestionsExpanded && (
              <div className="space-y-2">
                <button
                  className="flex items-center w-full text-left hover:bg-gray-100 rounded p-2 transition-colors"
                  onClick={() => handleQuickQuestion("How do I use the Alhajz app?")}
                >
                  <Smartphone className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <span className="text-blue-700 text-sm">How do I use the Alhajz app?</span>
                </button>
                <button
                  className="flex items-center w-full text-left hover:bg-gray-100 rounded p-2 transition-colors"
                  onClick={() => handleQuickQuestion("What is the Alhajz app for?")}
                >
                  <HelpCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-blue-700 text-sm">What is the Alhajz app for?</span>
                </button>
                <button
                  className="flex items-center w-full text-left hover:bg-gray-100 rounded p-2 transition-colors"
                  onClick={() => handleQuickQuestion("Can I book hotels through this app?")}
                >
                  <Building className="h-5 w-5 text-orange-500 mr-2 flex-shrink-0" />
                  <span className="text-blue-700 text-sm">Can I book hotels through this app?</span>
                </button>
                <button
                  className="flex items-center w-full text-left hover:bg-gray-100 rounded p-2 transition-colors"
                  onClick={() => handleQuickQuestion("Is Alhajz free to download?")}
                >
                  <Download className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" />
                  <span className="text-blue-700 text-sm">Is Alhajz free to download?</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Box: Talk with chatbot immediately */}
        <div className="flex items-center justify-between border-1 border-gray-200 shadow-lg rounded-lg p-4">
          <div className='flex flex-col'>
            <span className="text-gray-700 font-medium text-md">Talk with chatbot.</span>
            <span className="text-blue-400 font-small text-sm">The chatbot will respond immediately.</span>
          </div>

          <button
            onClick={() => {
              newGenerateSessionid(accessToken);
              onStartChat();
            }}
            className="flex items-center bg-purple-500 text-white px-3 py-2 rounded-full hover:bg-purple-600 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;