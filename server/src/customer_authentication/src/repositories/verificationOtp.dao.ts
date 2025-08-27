import OTPModel, { IOTP, OTPStatus, OTPType } from '../models/verification.model';

class OTPDao {
  async createOTP(data: Partial<IOTP>): Promise<{ identifier: string; status: OTPStatus }> {
    const identifier = data.identifier;
    console.log("identifier", identifier);
    const ifIdentifierExists = await OTPModel.findOne({ identifier }).select("identifier status");
    if (!ifIdentifierExists) {
      const result = await OTPModel.create(data);
      if (!result) {
        throw new Error('Failed to create OTP.');
      }
      return ({
        identifier: result.identifier,
        status: result.status
      });
    }
    return ifIdentifierExists;
  }

  async findLatestOTP(identifier: string, type: string): Promise<IOTP | null> {
    return await OTPModel.findOne({ identifier, type }).sort({ createdAt: -1 });
  }

  async verifyOTP(identifier: string, otp: string, type: string): Promise<IOTP | null> {
    const record = await OTPModel.findOne({ identifier, otp, type });
    if (!record) return null;

    if (record.expiresAt < new Date()) {
      record.status = OTPStatus.EXPIRED;
      await record.save();
      return null;
    }

    record.status = OTPStatus.VERIFIED;
    await record.save();
    return record;
  }

  async incrementAttempts(id: string): Promise<void> {
    await OTPModel.findByIdAndUpdate(id, { $inc: { attemptCount: 1 } });
  }

  async findUser(identifier: string, type: OTPType) {
    return await OTPModel.findOne({ identifier, type, status: { $eq: "verified" } }).select("identifier, status");
  }

}

export default new OTPDao();