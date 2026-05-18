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
};

export type createUserDTO = Pick<
  User,
  "name" | "email" | "phone_number" | "password"
> &
  Omit<User, "flag" | "flag_reason" | "created_at"> &
  Partial<User>;

export interface UserRepository {}

export interface UserService {}
