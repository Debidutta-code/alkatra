import crypto from "crypto";


export class Generator {

    /**
     * Generates a unique code with a prefix, current timestamp, and random hex.
     * @param prefix A short identifier like "TAX" or "TG"
     * @returns A unique code string, e.g., TAX-20250804123456-3FA9
     */
    static generateCode(prefix: string): string {
        const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14); // YYYYMMDDHHMMSS
        const randomStr = crypto.randomBytes(2).toString("hex").toUpperCase(); // 4-char hex string
        return `${prefix}-${timestamp}-${randomStr}`;
    }

}