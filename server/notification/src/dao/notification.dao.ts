// src/repositories/tokenRepo.ts
import deviceTokenModel from '../model/deviceToken.model';

export class TokenDao {
  /**
   * Get all unique device tokens for all users.
   */
  public async getAllDeviceTokensForAllUsers(): Promise<string[]> {
    try {
      const tokens: { token: string }[] = await deviceTokenModel.find({}).select('token').lean();
      const uniqueTokens = [...new Set(tokens.map(t => t.token))];
      return uniqueTokens;
    } catch (error) {
      console.error('❌ Error fetching device tokens:', error);
      throw new Error('Failed to fetch device tokens');
    }
  }

  /**
   * Get tokens for a specific user.
   */
  public async getDeviceTokensByUserId(userId: string): Promise<string[]> {
    try {
      const tokens = await deviceTokenModel.find({ userId }).select('token').lean();
      return tokens.map(t => t.token);
    } catch (error) {
      console.error(`❌ Error fetching tokens for user ${userId}:`, error);
      throw new Error('Failed to fetch tokens for user');
    }
  }

  /**
   * Save or update a device token for a user.
   */
  public async saveOrUpdateToken(
    userId: string,
    token: string,
    platform: 'web' | 'android' | 'ios'
  ) {
    try {
      const updated = await deviceTokenModel.findOneAndUpdate(
        { token },
        { userId, platform, updatedAt: new Date() },
        { upsert: true, new: true }
        );
        console.log(`✅ Device token ${token} saved/updated for user ${userId}`);
      return updated;
    } catch (error) {
      console.error('❌ Error saving or updating device token:', error);
      throw new Error('Failed to save/update device token');
    }
  }

  /**
   * Delete a device token.
   */
  public async deleteToken(token: string) {
    try {
      const result = await deviceTokenModel.findOneAndDelete({ token });
      return result;
    } catch (error) {
      console.error(`❌ Error deleting token ${token}:`, error);
      throw new Error('Failed to delete device token');
    }
  }
}
