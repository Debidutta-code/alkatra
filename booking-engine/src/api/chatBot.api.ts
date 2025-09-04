import { ChatBotConfig } from '../config';

class ChatBotApi {
    private static instance: ChatBotApi;
    private baseUrl: string;

    constructor() {
        this.baseUrl = ChatBotConfig.getInstance().getBaseUrl();
    }

    static getInstance() {
        if (!ChatBotApi.instance) {
            return ChatBotApi.instance = new ChatBotApi();
        }
        return ChatBotApi.instance;
    }

    /**
     * Generate session id
     * @JWT token pass in header as bearer
     */
    async generateSessionId(token: string): Promise<string> {
        if (!token) {
            throw new Error("Token not found for generate CHAT Session ID");
        }
        
        try {
            console.log(`Generating session ID...`);
            
            const response = await fetch(`${this.baseUrl}/chat/session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error(`Session ID generation failed: ${response.status} ${response.statusText}`);
            }

            const sessionData = await response.json();
            console.log('Session generated successfully:', sessionData);

            return sessionData.sessionId;
            
        } catch (error: any) {
            console.error(`Server error at generating chat session ID:`, error);
            throw new Error(`Failed to generate session: ${error.message}`);
        }
    }

    /**
     * Chat bot chat api
     * @JWT as bearer for authentication
     * SessionId and Input: query of user pass in body
     */
    async chatApi(token: string, sessionId: string, inputData: string): Promise<any> {
        if (!token || !sessionId || !inputData) {
            throw new Error("Token, Session ID, and input are required for chat");
        }
        
        try {
            console.log('Sending chat message:', { sessionId, inputData });

            const chatResponse = await fetch(`${this.baseUrl}/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    input: inputData
                })
            });

            if (!chatResponse.ok) {
                throw new Error(`Chat API failed: ${chatResponse.status} ${chatResponse.statusText}`);
            }

            // CRITICAL FIX: Add 'await' here
            const responseData = await chatResponse.json();
            console.log(`Chat bot response:`, responseData);
            
            return responseData;
            
        } catch (error: any) {
            console.error(`Server error during chat:`, error);
            throw new Error(`Chat failed: ${error.message}`);
        }
    }
}

export { ChatBotApi };