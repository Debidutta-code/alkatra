import CustomerModel, { ICustomer } from '../models/customer.model';

export class AppleAuthRepository {
  
  /**
   * Find user by Apple ID
   */
  async findUserByAppleId(appleId: string): Promise<ICustomer | null> {
    return await CustomerModel.findOne({ appleId });
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<ICustomer | null> {
    return await CustomerModel.findOne({ email });
  }

  /**
   * Create a new user
   */
  async createUser(data: Partial<ICustomer>): Promise<ICustomer> {
    const user = new CustomerModel(data);
    return await user.save();
  }

  /**
   * Find user by ID
   */
  async findUserById(id: string): Promise<ICustomer | null> {
    return await CustomerModel.findById(id);
  }

  /**
   * Update user by ID
   */
  async updateUserById(id: string, data: Partial<ICustomer>): Promise<ICustomer | null> {
    return await CustomerModel.findByIdAndUpdate(id, data, { new: true });
  }

  /**
   * Find user by email or Apple ID - Updated to handle null email
   */
  async findUserByEmailOrAppleId(email: string | null, appleId: string): Promise<ICustomer | null> {
    const query: any = {
      $or: [
        { appleId }
      ]
    };
    
    // Only add email to query if it's provided and not null
    if (email) {
      query.$or.push({ email });
    }
    
    return await CustomerModel.findOne(query);
  }
}