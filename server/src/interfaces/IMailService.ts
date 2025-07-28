
export interface IEmailInput {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export interface IMailer {
    sendMail(payload: IEmailInput): Promise<void>;
}


// export interface IOTPService {
//     generate(): string;
// }