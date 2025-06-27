import UserModel from '../models/users.model';
import { User, UserCredentials, UserResponse } from '../types/types';

/**
 * Saves a new user to the database.
 */
export const saveUser = async (user: User): Promise<UserResponse> => {
  try {
    const savedUser = await UserModel.create(user);

    const userObj = savedUser.toObject();
    const { password, ...safe } = userObj;
    return safe;
  } catch (error: unknown) {
    // duplicate‐key?
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      // @ts-ignore
      error.code === 11000
    ) {
      return { error: 'Username already exists' };
    }

    const msg = error instanceof Error ? error.message : 'Failed to save user';
    return { error: msg };
  }
};

/**
 * Retrieves a user by username.
 */
export const getUserByUsername = async (
  username: string
): Promise<UserResponse> => {
  try {
    const doc = await UserModel.findOne({ username }).lean();
    if (!doc) return { error: 'User not found' };

    const { password, ...safe } = doc;
    return safe;
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : 'Failed to retrieve user';
    return { error: msg };
  }
};

/**
 * Authenticates by querying both username AND password.
 */
export const loginUser = async (
  creds: UserCredentials
): Promise<UserResponse> => {
  try {
    const { username, password } = creds;

    // <–– push the password check into Mongo
    const doc = await UserModel.findOne({ username, password }).lean();
    if (!doc) {
      return { error: 'Invalid username or password' };
    }

    const { password: _p, ...safe } = doc;
    return safe;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Login failed';
    return { error: msg };
  }
};

/**
 * Deletes a user by username.
 */
export const deleteUserByUsername = async (
  username: string
): Promise<UserResponse> => {
  try {
    const doc = await UserModel.findOneAndDelete({ username }).lean();
    if (!doc) return { error: 'User not found' };

    const { password, ...safe } = doc;
    return safe;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete user';
    return { error: msg };
  }
};

/**
 * Updates a user by username.
 */
export const updateUser = async (
  username: string,
  updates: Partial<User>
): Promise<UserResponse> => {
  try {
    const doc = await UserModel.findOneAndUpdate(
      { username },
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!doc) return { error: 'User not found' };

    const { password, ...safe } = doc;
    return safe;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      // @ts-ignore
      error.code === 11000
    ) {
      return { error: 'Username already exists' };
    }
    const msg =
      error instanceof Error ? error.message : 'Failed to update user';
    return { error: msg };
  }
};