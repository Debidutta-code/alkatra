import OTPModel, { IOTP, OTPStatus } from '../models/verification.model';

class OTPDao {
  async createOTP(data: Partial<IOTP>): Promise<IOTP> {
    return await OTPModel.create(data);
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
}

export default new OTPDao();