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

// function that compares a password with its hash
export const comparePassword = async (password, hash) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error('Error comparing password:', error);
    throw new Error('Error comparing password');
  }
};

// function to authenticate a user
export const authenticateUser = async ({ email, password: plainPassword }) => {
  try {
    // find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // if user doesn't exist, throw an error
    if (!user) {
      throw new Error('User with this email does not exist');
    }

    // compare the provided password with the stored hash
    const isPasswordValid = await comparePassword(plainPassword, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    logger.info(`User authenticated successfully: ${user.email}`);

    // return user without password
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    return userWithoutPassword;
  } catch (error) {
    logger.error('Error authenticating user:', error);
    throw error; // re-throw the original error to preserve the specific message
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
