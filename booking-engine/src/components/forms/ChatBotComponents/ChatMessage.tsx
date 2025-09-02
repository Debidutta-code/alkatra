import React from 'react';
import { Bot, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Avatar from '../UserProfileComponents/Avatar';

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
    // Format timestamp
    const formatTime = (timestamp: Date) => {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return messageTime.toLocaleDateString();
    };
    const cleanBotResponse = (text: string): string => {
        let cleaned = text;

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
            .trim();

        return cleaned;
    };

    // Get status icon
    const getStatusIcon = () => {
        if (message.sender === 'bot') return null;

        switch (message.status) {
            case 'sending':
                return <Clock className="h-3 w-3 text-gray-400" />;
            case 'sent':
                return <CheckCircle className="h-3 w-3 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-3 w-3 text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className={`flex items-end gap-2 animate-in slide-in-from-bottom-2 duration-300 ${message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}>
            {/* Bot avatar */}
            {message.sender === 'bot' && (
                <Avatar size="sm" fallback={<Bot className="h-4 w-4" />} />
            )}

            <div className="flex flex-col max-w-[80%]">
                {/* Message bubble */}
                <div className={`text-sm rounded-lg p-3 relative ${message.sender === 'bot'
                    ? 'bg-purple-100 text-gray-800'
                    : message.status === 'error'
                        ? 'bg-red-100 border border-red-200 text-red-800'
                        : 'bg-blue-500 text-white'
                    }`}>
                    {message.sender === 'bot' ? (
                        <div
                            dangerouslySetInnerHTML={{ __html: cleanBotResponse(message.text) }}
                            className="prose prose-sm max-w-none"
                        />
                    ) : (
                        message.text
                    )}

                    {/* Error state for failed messages */}
                    {message.status === 'error' && onRetry && (
                        <div className="mt-2 pt-2 border-t border-red-200">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-600">Failed to send</span>
                                <button
                                    onClick={() => onRetry(message.text)}
                                    className="text-xs text-red-600 underline hover:text-red-800 ml-auto"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Timestamp and status */}
                <div className={`text-xs text-gray-500 mt-1 flex items-center gap-1 ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {getStatusIcon()}
                </div>
            </div>

            {/* User avatar */}
            {message.sender === 'user' && (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                        {userFirstName.charAt(0).toUpperCase()}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ChatMessage;