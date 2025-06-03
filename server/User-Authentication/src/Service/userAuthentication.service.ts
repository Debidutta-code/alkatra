import { ErrorMessages, formatError } from "../Error/errorMessages";
import { AuthType } from "../Model/auth.model";
import { UserRepository } from "../Repository/userAuthorization.repository";
import { compareHash, createHash } from "../Utils/bcryptHelper";
import { assignToken, Role } from "../Utils/jwtHelper";

interface UpdateBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: "superAdmin" | "groupManager" | "hotelManager";
}

interface RegisterBody {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: "superAdmin" | "groupManager" | "hotelManager";
}

interface LoginBody {
  email: string;
  password: string;
}

interface UpdatePasswordBody {
  email: string;
  newPassword: string;
}

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserById(userId: string): Promise<AuthType> {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw formatError(ErrorMessages.USER_NOT_FOUND);
    }
    return user;
  }
  async updateUserProfile(
    userId: string,
    requestingUserId: string,
    requestingUserRole: string,
    updates: UpdateBody
  ): Promise<AuthType> {
    await this.userRepository.findUserById(userId);
    const filteredUpdates: Partial<AuthType> = {};
    if (requestingUserId === userId) {
      if (updates.firstName) filteredUpdates.firstName = updates.firstName;
      if (updates.lastName) filteredUpdates.lastName = updates.lastName;
      if (updates.email) filteredUpdates.email = updates.email;
      if (updates.role) {
        throw formatError(ErrorMessages.ROLE_UPDATE_NOT_ALLOWED);
      }
    } else if (
      requestingUserId !== userId &&
      requestingUserRole === "superAdmin"
    ) {
      if (updates.role)
        filteredUpdates.role = updates.role as
          | "superAdmin"
          | "groupManager"
          | "hotelManager";
      if (updates.firstName || updates.lastName || updates.email) {
        throw formatError(ErrorMessages.SUPERADMIN_ROLE_ONLY);
      }
    } else {
      throw formatError(ErrorMessages.UNAUTHORIZED_ACTION);
    }
    const updatedUser = await this.userRepository.updateUser(
      userId,
      filteredUpdates
    );
    if (!updatedUser) {
      throw formatError(ErrorMessages.USER_NOT_FOUND);
    }
    return updatedUser;
  }

  async getAllUsers(
    page: number,
    limit: number,
    userRole: "superAdmin" | "groupManager" | "hotelManager"
  ) {
    return await this.userRepository.getAllUsers(page, limit, userRole);
  }

  async registerUser(data: RegisterBody): Promise<AuthType> {
    const { firstName, lastName, email, password, role } = data;
    if (!firstName || !lastName || !email || !password) {
      throw formatError(ErrorMessages.MISSING_REGISTRATION_FIELDS);
    }
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) {
      throw formatError(ErrorMessages.USER_ALREADY_EXISTS);
    }
    if (role === "superAdmin") {
      const superAdminExists = await this.userRepository.findUserByRole(
        "superAdmin"
      );
      if (superAdminExists) {
        throw formatError(ErrorMessages.USER_ROLE_ALREADY_EXISTS);
      }
    }
    const hashedPassword = await createHash(password);
    const userData: Partial<AuthType> = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || "hotelManager", // Default to hotelManager for users created through /create-user
    };
    return await this.userRepository.createUser(userData);
  }

  async loginUser(
    data: LoginBody
  ): Promise<{ user: AuthType; accessToken: string }> {
    const { email, password } = data;
    if (!email || !password) {
      throw formatError(ErrorMessages.MISSING_LOGIN_CREDENTIALS);
    }
    const user = await this.userRepository.findUserByEmailWithPassword(email);
    if (!user || !compareHash(password, user.password)) {
      throw formatError(ErrorMessages.INVALID_LOGIN_CREDENTIALS);
    }
    const accessToken = assignToken(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role as Role,
      },
      process.env.JWT_SECRET_KEY_DEV!,
      process.env.JWT_EXPIRES_IN_DEV!
    );
    return { user, accessToken };
  }

  async verifyEmail(email: string): Promise<void> {
    if (!email) {
      throw formatError(ErrorMessages.MISSING_EMAIL);
    }
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw formatError(ErrorMessages.EMAIL_NOT_FOUND);
    }
  }

  async updateUserPassword(data: UpdatePasswordBody): Promise<AuthType> {
    const { email, newPassword } = data;
    if (!email || !newPassword) {
      throw formatError(ErrorMessages.MISSING_PASSWORD_UPDATE_FIELDS);
    }
    const hashedPassword = await createHash(newPassword);
    const updatedUser = await this.userRepository.updateUserPassword(
      email,
      hashedPassword
    );
    if (!updatedUser) {
      throw formatError(ErrorMessages.EMAIL_NOT_FOUND);
    }
    return updatedUser;
  }
}
