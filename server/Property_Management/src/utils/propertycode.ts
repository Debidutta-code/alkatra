import { PropertyInfo } from "../model/property.info.model"; // adjust the path if needed

export default async function generateUniquePropertyCode(): Promise<string> {
  const generateCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  let code = '';
  let exists = true;

  while (exists) {
    code = generateCode();
    const existing = await PropertyInfo.findOne({ property_code: code });
    exists = !!existing;
  }

  return code;
};
