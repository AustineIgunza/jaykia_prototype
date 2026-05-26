import { Warning } from "../../../Utilities/Logger.js";
import type {
  createUserDTO,
  PublicUserDTO,
  updateUserDTO,
  User,
  UserRepository,
  UserService,
} from "./user.types.js";

export class UserServ implements UserService {
  constructor(private userRepo: UserRepository) {}

  private createPublicUser(user: User): PublicUserDTO {
    const { flag, flag_reason, oauth_provider, password, ...publicUser } = user;
    return publicUser;
  }

  async createUser(userDetails: createUserDTO): Promise<PublicUserDTO> {
    try {
      let allowedFields: string[] = [
          "name",
          "email",
          "phone_number",
          "password",
          "oauth",
          "oauth_provider",
        ],
        newUserDetails: Record<string, any> = {};

      for (let [key, value] of Object.entries(userDetails)) {
        if (allowedFields.includes(key.toLowerCase())) {
          if (!value || value.toString().length <= 0)
            throw new Error(`${key} has an empty value`);

          newUserDetails[key] = value;
        } else continue;
      }

      const newUser = await this.userRepo.createUser(newUserDetails as User);

      return this.createPublicUser(newUser);
    } catch (error) {
      Warning("Error at creating user");
      throw error;
    }
  }

  async editUser(
    userId: string,
    newUserDetails: updateUserDTO,
  ): Promise<PublicUserDTO> {
    try {
      if (!userId) throw new Error("User id must be provided");

      let allowedFields: string[] = [
          "username",
          "email",
          "phone_number",
          "password",
          "flag",
          "flag_reason",
          "deleted_at",
        ],
        validatedUserDetails: Record<string, any> = {};

      for (let [key, value] of Object.entries(newUserDetails)) {
        if (!allowedFields.includes(key)) continue;

        if (!value || value.toString().length <= 0)
          throw new Error(`${key} has an empty value`);

        validatedUserDetails[key] = value;
      }

      const updatedUser = await this.userRepo.editUser(
        userId,
        validatedUserDetails,
      );

      return this.createPublicUser(updatedUser);
    } catch (error) {
      Warning("Error at editing user");
      throw error;
    }
  }

  async getUser(userId: string): Promise<PublicUserDTO> {
    try {
      if (!userId) throw new Error("User id must be provided");

      const retrievedUser = await this.userRepo.getUser(userId);

      return this.createPublicUser(retrievedUser);
    } catch (error) {
      Warning("Error at retrieving a user");
      throw error;
    }
  }

  async getAllUsers(): Promise<PublicUserDTO[]> {
    try {
      const allUsers = await this.userRepo.getAllUsers(),
        filteredUsers = allUsers.map((user) => this.createPublicUser(user));

      return filteredUsers;
    } catch (error) {
      Warning("Error at retrieving all users");
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      if (!userId) throw new Error("User id must be provided");

      await this.userRepo.deleteUser(userId);
    } catch (error) {}
  }
}
