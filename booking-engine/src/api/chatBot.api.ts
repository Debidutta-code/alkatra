class ChatBotApi {
    private baseUrl: string;

    constructor(baseUrl: string = process.env.NEXT_PUBLIC_CHATBOT_URL ?? '') {
        this.baseUrl = baseUrl;
    }

    /**
     * Generate session id
     * @JWT token pass in header as bearer
     */
    async generateSessionId(token: string) {
        if (!token) {
            throw new Error("Token not found for generate CHAT Session ID");
        }
        try {
            const response = await fetch(`${this.baseUrl}/chat/session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.status !== 200) {
                throw new Error ("Session ID generate failed");
            }
            return response;
        } catch (error) {

        }
    }






}

export { ChatBotApi };