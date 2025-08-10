import { UserMessageModel } from "../models";
import { IUserMessage } from "../interfaces/userMessage.interface";

export class UserMessageRepository {
    private static instance: UserMessageRepository;

    static getInstance(): UserMessageRepository {
        if (!UserMessageRepository.instance) {
            UserMessageRepository.instance = new UserMessageRepository();
        }
        return UserMessageRepository.instance;
    }

    /**
     * Creates a new user message document in the database.
     */
    async create(userMessage: IUserMessage): Promise<IUserMessage> {
        return await UserMessageModel.create(userMessage);
    }

}