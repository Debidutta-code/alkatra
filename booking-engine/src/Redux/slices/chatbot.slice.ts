import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Message interface
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface ChatState {
  sessionId: string | null;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
}

const initialState: ChatState = {
  sessionId: '',
  messages: [],
  isLoading: false,
  isTyping: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
      console.log(`Session ID stored successfully: ${action.payload}`);
    },

    clearSessionId: (state) => {
      state.sessionId = null;
    },

    // Add user message
    addUserMessage: (state, action: PayloadAction<{ text: string }>) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: action.payload.text,
        sender: 'user',
        timestamp: new Date(),
        status: 'sending'
      };
      state.messages.push(newMessage);
      state.error = null;
    },

    // Update message status
    updateMessageStatus: (state, action: PayloadAction<{ id: string; status: 'sending' | 'sent' | 'error' }>) => {
      const message = state.messages.find(msg => msg.id === action.payload.id);
      if (message) {
        message.status = action.payload.status;
      }
    },

    // Add bot message
    addBotMessage: (state, action: PayloadAction<{ text: string }>) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: action.payload.text,
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent'
      };
      state.messages.push(newMessage);
      state.isTyping = false;
      state.isLoading = false;
    },

    // Set typing indicator
    setBotTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setChatError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isTyping = false;
    },

    // Clear all messages (for new session)
    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
      state.isLoading = false;
      state.isTyping = false;
    },

    // Initialize with welcome messages
    initializeWelcomeMessages: (state, action: PayloadAction<{ userFirstName: string }>) => {
      const welcomeMessages: Message[] = [
        {
          id: 'welcome-1',
          text: `Welcome, ${action.payload.userFirstName}! 👋`,
          sender: 'bot',
          timestamp: new Date(Date.now() - 3600000),
          status: 'sent'
        },
        {
          id: 'welcome-2',
          text: "I'm your Al-Hajz Chat Bot, here to assist you with booking management, account queries, and more. ✨",
          sender: 'bot',
          timestamp: new Date(Date.now() - 3600000),
          status: 'sent'
        },
        {
          id: 'welcome-3',
          text: "How can I help you today?",
          sender: 'bot',
          timestamp: new Date(Date.now() - 3600000),
          status: 'sent'
        }
      ];
      state.messages = welcomeMessages;
    }
  },
});

export const { 
  setSessionId, 
  clearSessionId, 
  addUserMessage, 
  addBotMessage, 
  updateMessageStatus,
  setBotTyping, 
  setLoading, 
  setChatError, 
  clearMessages,
  initializeWelcomeMessages
} = chatSlice.actions;

export default chatSlice.reducer;