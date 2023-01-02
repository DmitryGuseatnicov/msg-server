import * as bcrypt from 'bcrypt';

export const comparePasswords = async (
  password: string,
  hastPassword: string,
) => {
  return await bcrypt.compareSync(password, hastPassword);
};
