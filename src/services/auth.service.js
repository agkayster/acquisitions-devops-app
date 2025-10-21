import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';

const SALT_ROUNDS = 10;

// function that hashes a password
export const hashPassword = async password => {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Error hashing password');
  }
};

// function to create a new user
export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    // define how to search for existing user
    const existingUser = db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    console.log(`All users: ${users}`);

    // if user exists in the database, throw an error
    if ((await existingUser.length) > 0) throw new Error('User already exists');

    // else create a new user and hash password
    const password_hash = await hashPassword(password);

    // destructure the new user and create it
    const [newUser] = await db
      .insert(users) // means insert into the users table
      .values({ name, email, password: password_hash, role })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
      });

    logger.info(`New user: ${newUser.email} created Successfully!`);

    // return the new user
    return newUser;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw new Error('Error creating user');
  }
};
