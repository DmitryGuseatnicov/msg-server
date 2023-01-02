import * as bcrypt from 'bcrypt';

const salt = 5;

export const hastPassword = async (password: string) => {
  return await bcrypt.hash(password, salt);
};
