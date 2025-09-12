import React from 'react';
import { Bot, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    status?: 'sending' | 'sent' | 'error';
}

interface ChatMessageProps {
    message: Message;
    userFirstName: string;
    onRetry?: (messageText: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, userFirstName, onRetry }) => {
    // Format timestamp with enhanced relative time
    const formatTime = (timestamp: Date) => {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return messageTime.toLocaleDateString();
    };

    // Enhanced bot response cleaning
    const cleanBotResponse = (text: string): string => {
        let cleaned = text;

        // Remove array brackets
        if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
            cleaned = cleaned.slice(1, -1);
        }

        cleaned = cleaned
            .replace(/^"\\*"?/, '')          // Remove starting patterns like "\" or ""
            .replace(/\\*"?"$/, '')          // Remove ending patterns like \" or ""
            .replace(/^"/, '')               // Remove remaining starting quote
            .replace(/"$/, '')               // Remove remaining ending quote
            .replace(/\\"/g, '"')            // Fix escaped quotes
            .replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, '') // Remove heading tags
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Convert **bold** to HTML
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Convert *italic* to HTML
            .trim();

        return cleaned;
    };

    // Enhanced status icon with better visual feedback
    const getStatusIcon = () => {
        if (message.sender === 'bot') return null;

        switch (message.status) {
            case 'sending':
                return <Clock className="h-3 w-3 text-gray-400 animate-pulse" />;
            case 'sent':
                return <CheckCircle className="h-3 w-3 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-3 w-3 text-red-500" />;
            default:
                return <CheckCircle className="h-3 w-3 text-green-500" />;
        }
    };

    return (
        <div className={`flex items-end gap-2 animate-in slide-in-from-bottom-2 duration-300 ${message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}>
            {/* Enhanced Bot avatar */}
            {message.sender === 'bot' && (
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#076DB3] to-[#054B8F] rounded-full 
                                    flex items-center justify-center shadow-md border-2 border-white">
                        <Bot className="h-4 w-4 text-white" />
                    </div>
                </div>
            )}

            <div className="flex flex-col max-w-[85%] md:max-w-[80%]">
                {/* Enhanced Message bubble */}
                <div className={`text-sm rounded-2xl px-4 py-3 relative shadow-sm ${message.sender === 'bot'
                    ? 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 border border-gray-200'
                    : message.status === 'error'
                        ? 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200 text-red-800'
                        : 'bg-gradient-to-br from-[#076DB3] to-[#054B8F] text-white shadow-md'
                    }`}>

                    {/* Message content */}
                    {message.sender === 'bot' ? (
                        (() => {
                            const cleanedText = cleanBotResponse(message.text);
                            const isEmpty = !cleanedText || cleanedText.trim() === '';

                            if (isEmpty) {
                                return (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <AlertCircle className="mb-10 h-10 w-10 text-amber-500" />
                                        <span>Sorry, I couldn't generate a response. Could you please rephrase your question?</span>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    dangerouslySetInnerHTML={{ __html: cleanedText }}
                                    className="prose prose-sm max-w-none text-gray-800 
                         [&>p]:mb-2 [&>p:last-child]:mb-0
                         [&>strong]:text-[#076DB3] [&>strong]:font-semibold
                         [&>em]:text-gray-600 [&>em]:italic
                         [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:mb-2
                         [&>ol]:list-decimal [&>ol]:ml-4 [&>ol]:mb-2
                         [&>li]:mb-1"
                                />
                            );
                        })()
                    ) : (
                        <div className="font-noto-sans whitespace-pre-wrap">{message.text}</div>)}

                    {/* Enhanced Error state for failed messages */}
                    {message.status === 'error' && onRetry && (
                        <div className="mt-3 pt-3 border-t border-red-300">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                    <span className="text-xs text-red-600 font-medium">Message failed to send</span>
                                </div>
                                <button
                                    onClick={() => onRetry(message.text)}
                                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 
                                             bg-red-200 hover:bg-red-300 px-2 py-1 rounded-lg transition-all duration-200
                                             font-medium"
                                >
                                    <RefreshCw className="h-3 w-3" />
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Message tail/pointer */}
                    <div className={`absolute bottom-0 w-3 h-3 transform rotate-45 ${message.sender === 'bot'
                        ? 'bg-gray-100 border-r border-b border-gray-200 -left-1.5'
                        : message.status === 'error'
                            ? 'bg-red-100 border-r border-b border-red-200 -right-1.5'
                            : 'bg-[#054B8F] -right-1.5'
                        }`}></div>
                </div>

                {/* Enhanced Timestamp and status */}
                <div className={`text-xs text-gray-500 mt-2 flex items-center gap-2 font-noto-sans ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                    <span className="bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        {formatTime(message.timestamp)}
                    </span>
                    {getStatusIcon()}
                </div>
            </div>

            {/* Enhanced User avatar */}
            {message.sender === 'user' && (
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#076DB3] to-[#054B8F] rounded-full 
                                    flex items-center justify-center shadow-md border-2 border-white">
                        <span className="text-white text-xs font-semibold font-noto-sans">
                            {userFirstName.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatMessage;