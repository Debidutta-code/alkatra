import React from 'react';
import { X, Star } from 'lucide-react';
import Button from '../UserProfileComponents/Button';

interface ChatbotFeedbackProps {
  onClose: () => void;
}

const ChatbotFeedback: React.FC<ChatbotFeedbackProps> = ({ onClose }) => (
  <div>
    <div className="bg-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
      <h3 className="text-lg font-semibold">Support Bot</h3>
      <Button variant="ghost" size="sm" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
    <div className="p-4 space-y-4">
      <div className="bg-purple-100 text-[var(--color-secondary-black)] rounded-lg p-3">
        Please share your feedback to help us improve our service.
      </div>
      <div className="bg-purple-100 text-[var(--color-secondary-black)] rounded-lg p-3">
        Thanks for the feedback
      </div>
      <div className="flex justify-center items-center gap-1">
        <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
        <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
        <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
        <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
        <Star className="h-6 w-6 text-gray-300" />
        <span className="text-sm ml-2">4/5 stars</span>
      </div>
      <textarea 
        placeholder="Your feedback" 
        className="w-full h-24 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
      />
      <div className="flex gap-3">
        <Button variant="outline" size="md" className="flex-1">
          Skip
        </Button>
        <Button variant="primary" size="md" className="flex-1 bg-purple-600 hover:bg-purple-700">
          Send Feedback
        </Button>
      </div>
    </div>
  </div>
);

export default ChatbotFeedback;