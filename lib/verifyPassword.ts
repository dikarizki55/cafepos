import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hashed = (await scryptAsync(password, salt, 64)) as Buffer;

  return `${salt}:${hashed.toString("hex")}`;
}

export async function verifyPassword(password: string, hashedPassword: string) {
  const [salt, storedPassword] = hashedPassword.split(":");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

  return storedPassword === derivedKey.toString("hex");
}
