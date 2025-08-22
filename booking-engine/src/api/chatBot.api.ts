import { ChatBotConfig } from '../config';

class ChatBotApi {

    /**
     * Generate session id
     * @JWT token pass in header as bearer
     */
    async generateSessionId(token: string) {
        if (!token) {
            throw new Error("Token not found for generate CHAT Session ID");
        }
        try {
            const response = await fetch(`${ChatBotConfig}/chat/session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            if (response.status !== 200) {
                throw new Error("Session ID generate failed");
            }
            return response;
        } catch (error: any) {
            console.log(`Server error at generating chat session ID`, error.message);
            throw new Error('Server Error');
        }
    };


    /**
     * Chat bot chat api
     * @JWT as bearer for authentication
     * SessionId and Input: query of user pass in body
     */
    async chatApi(token: string, sessionId: string, inputData: string) {
        if (!token || !sessionId || !inputData) {
            throw new Error("Token and Session ID required to get Chat");
        }
        try {
            const chatResponse = await fetch(`${ChatBotConfig}/chat/message`, {
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

            if (chatResponse.status !== 200) {
                throw new Error("Issue while getting your answer");
            }

            const responseData = chatResponse.json();
            return responseData;
        } catch (error: any) {
            console.log(`Server error at chat`, error.message);
            throw new Error('Server Error');
        }
    }
}

export { ChatBotApi };