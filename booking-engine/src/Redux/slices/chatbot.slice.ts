import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  sessionId: string | null;
}

const initialState: ChatState = {
  sessionId: '',
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

  },
});


export const { setSessionId, clearSessionId } = chatSlice.actions;

export default chatSlice.reducer;