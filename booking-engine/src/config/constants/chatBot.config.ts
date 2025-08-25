class ChatBotConfig {

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
}

export { ChatBotConfig };