class ChatBotConfig {
    private static instance: ChatBotConfig;
    private baseUrl: string;

    constructor(baseUrl: string = process.env.NEXT_PUBLIC_CHATBOT_URL ?? '') {
        console.log(`The chatbot base url we get ${baseUrl}`);

        if (!baseUrl) {
            throw new Error("ChatBot base URL is required. Please set NEXT_PUBLIC_CHATBOT_URL environment variable.");
        }
        else {
            this.baseUrl = baseUrl;
        }
    }

    static getInstance() {
        if (!ChatBotConfig.instance) {
            return ChatBotConfig.instance = new ChatBotConfig();
        }
        return ChatBotConfig.instance;
    }
    
    getBaseUrl(): string {
        return this.baseUrl;
    }
}

export { ChatBotConfig };