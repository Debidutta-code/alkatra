import { Promocode } from '../model';

export default async function generateUniquePromoCode() {
    const generateCode = (): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@';
        let result = '';
        for (let i = 0; i < 9; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    let code = '';
    let exists = true;

    while (exists) {
        code = generateCode();
        const existing = await Promocode.findOne({ code: code });
        exists = !!existing;
    }

    return code;
};
