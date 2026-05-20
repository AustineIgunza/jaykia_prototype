export type User = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  password: string;
  oauth: boolean;
  oauth_provider: string;
  profile_image: string;
  flag: boolean;
  flag_reason: string;
  created_at: string;
  deleted_at: string;
};

export type createUserDTO = Pick<
  User,
  "name" | "email" | "phone_number" | "password"
> &
  Omit<User, "flag" | "flag_reason" | "created_at" | "id">;
export type updateUserDTO = Partial<
  Omit<User, "oauth" | "oauth_provider" | "id">
>;

export type PublicUserDTO = Pick<
  User,
  | "id"
  | "name"
  | "email"
  | "phone_number"
  | "profile_image"
  | "oauth"
  | "deleted_at"
  | "created_at"
>;

export interface UserRepository {
  createUser: (userDetails: createUserDTO) => Promise<User>;
  editUser: (userId: string, newUserDetails: updateUserDTO) => Promise<User>;
  getUser: (userId: string) => Promise<User>;
  getAllUsers: () => Promise<User[]>;
  deleteUser: (userId: string) => Promise<void>;
}
export interface UserService {
  createUser: (userDetails: createUserDTO) => Promise<PublicUserDTO>;
  editUser: (
    userId: string,
    newUserDetails: updateUserDTO,
  ) => Promise<PublicUserDTO>;
  getUser: (userId: string) => Promise<PublicUserDTO>;
  getAllUsers: () => Promise<PublicUserDTO[]>;
  deleteUser: (userId: string) => Promise<void>;
}
