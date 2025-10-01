import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return await bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain, hashed) {
  return await bcrypt.compare(plain, hashed);
}
