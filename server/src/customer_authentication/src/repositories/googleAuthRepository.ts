import CustomerModel, { ICustomer } from '../models/customer.model';

export class AuthRepository {
  
  async findUserByGoogleId(email: string): Promise<ICustomer | null> {
    return await CustomerModel.findOne({ email });
  }

  async createUser(data: Partial<ICustomer>): Promise<ICustomer> {
    const user = new CustomerModel(data);
    return await user.save();
  }

  async findUserById(id: string): Promise<ICustomer> {
    return await CustomerModel.findById(id);
  }

}