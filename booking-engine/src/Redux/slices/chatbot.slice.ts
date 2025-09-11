// src/Redux/slices/chatbot.slice.ts

import { createSlice, PayloadAction, AnyAction } from '@reduxjs/toolkit';

// Message interface
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

// Chat state interface
export interface ChatState {
  sessionId: string | null;
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  isShowingWelcome: boolean; // Track if welcome sequence is active
}

// Initial state
const initialState: ChatState = {
  sessionId: null,
  messages: [],
  isLoading: false,
  isTyping: false,
  error: null,
  isShowingWelcome: false,
};

// Create slice
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
        status: 'sending',
      };
      state.messages.push(newMessage);
      state.error = null;
    },

    // Update message status (sending, sent, error)
    updateMessageStatus: (
      state,
      action: PayloadAction<{ id: string; status: 'sending' | 'sent' | 'error' }>
    ) => {
      const message = state.messages.find((msg) => msg.id === action.payload.id);
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
        status: 'sent',
      };
      state.messages.push(newMessage);
      state.isTyping = false;
      state.isLoading = false;
    },

    // Set bot typing indicator
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
      state.isShowingWelcome = false;
    },

    // Start welcome sequence
    startWelcomeSequence: (state) => {
      state.messages = [];
      state.isShowingWelcome = true;
      state.isTyping = true;
    },

    // Add single welcome message
    addWelcomeMessage: (state, action: PayloadAction<{ id: string; text: string }>) => {
      const newMessage: Message = {
        id: action.payload.id,
        text: action.payload.text,
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent',
      };
      state.messages.push(newMessage);
    },

    // End welcome sequence
    endWelcomeSequence: (state) => {
      state.isShowingWelcome = false;
      state.isTyping = false;
    },
  },
});

// Export actions
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
  startWelcomeSequence,
  addWelcomeMessage,
  endWelcomeSequence,
} = chatSlice.actions;

// Thunk action for showing welcome messages one by one
export const initializeWelcomeMessages = (userFirstName: string) => {
  return async (dispatch: (action: AnyAction) => void, getState: () => { chat: ChatState }) => {
    const state = getState().chat;

    // Prevent duplicate initialization
    if (
      state.isShowingWelcome ||
      state.messages.some((msg: Message) => msg.id.startsWith('welcome-'))
    ) {
      return;
    }

    // Start the welcome sequence
    dispatch(startWelcomeSequence());

    const welcomeMessages = [
      { id: 'welcome-1', text: `Welcome, ${userFirstName}! 👋`, delay: 300 },
      {
        id: 'welcome-2',
        text: "I'm your Al-Hajz Chat Bot, here to assist you with booking management, account queries, and more. ✨",
        delay: 600,
      },
      { id: 'welcome-3', text: "How can I help you today?", delay: 400 },
    ];

    for (let i = 0; i < welcomeMessages.length; i++) {
      const message = welcomeMessages[i];

      // Wait for delay
      await new Promise((resolve) => setTimeout(resolve, message.delay));

      // Show typing
      dispatch(setBotTyping(true));
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Add message
      dispatch(
        addWelcomeMessage({
          id: message.id,
          text: message.text,
        })
      );

      // Stop typing
      dispatch(setBotTyping(false));
    }

    // End sequence
    dispatch(endWelcomeSequence());
  };
};

// Export reducer
export default chatSlice.reducer;