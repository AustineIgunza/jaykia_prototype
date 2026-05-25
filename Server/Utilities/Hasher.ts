import bcrypt from "bcryptjs";

export const hashPass = (password: string): string =>
    bcrypt.hashSync(password, 10),
  comparePass = (password: string, hashedPass: string): boolean =>
    bcrypt.compareSync(password, hashedPass);
