import UserModel from '../../models/users.model';
import {
  deleteUserByUsername,
  getUserByUsername,
  loginUser,
  saveUser,
  updateUser,
} from '../../services/user.service';
import { SafeUser, User, UserCredentials } from '../../types/user';
import { user, safeUser } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  return {
    ...actual,
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
  };
});

describe('User model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveUser', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the saved user', async () => {
      mockingoose(UserModel).toReturn(user, 'create');

      const savedUser = (await saveUser(user)) as SafeUser;

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toEqual(user.username);
      expect(savedUser.dateJoined).toEqual(user.dateJoined);
    });
  });

  describe('getUserByUsername', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the matching user', async () => {
      mockingoose(UserModel).toReturn(safeUser, 'findOne');

      const retrievedUser = (await getUserByUsername(user.username)) as SafeUser;

      expect(retrievedUser.username).toEqual(user.username);
      expect(retrievedUser.dateJoined).toEqual(user.dateJoined);
    });

    // not found branch
    it('should return error when user not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      const result = await getUserByUsername('no_such_user');
      expect(result).toEqual({ error: 'User not found' });
    });

    // thrown error branch
    it('should return error message on findOne failure', async () => {
      const err = new Error('fail to query');
      mockingoose(UserModel).toReturn(err, 'findOne');

      const result = await getUserByUsername(user.username);
      expect(result).toEqual({ error: 'fail to query' });
    });
  });

  describe('loginUser', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the user if authentication succeeds', async () => {
      // Note: service now queries by {username,password}, so stub safeUser + password
      const dbUser = { ...safeUser, password: user.password };
      mockingoose(UserModel).toReturn(dbUser, 'findOne');

      const credentials: UserCredentials = {
        username: user.username,
        password: user.password,
      };

      const loggedInUser = (await loginUser(credentials)) as SafeUser;

      expect(loggedInUser.username).toEqual(user.username);
      expect(loggedInUser.dateJoined).toEqual(user.dateJoined);
    });

    // invalid credentials branch
    it('should return error when credentials are invalid', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');

      const result = await loginUser({
        username: user.username,
        password: 'wrongpass',
      });
      expect(result).toEqual({ error: 'Invalid username or password' });
    });

    // thrown error branch
    it('should return error message on findOne failure', async () => {
      const err = new Error('auth DB down');
      mockingoose(UserModel).toReturn(err, 'findOne');

      const result = await loginUser({
        username: user.username,
        password: user.password,
      });
      expect(result).toEqual({ error: 'auth DB down' });
    });
  });

  describe('deleteUserByUsername', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the deleted user when deleted succesfully', async () => {
      mockingoose(UserModel).toReturn(safeUser, 'findOneAndDelete');

      const deletedUser = (await deleteUserByUsername(user.username)) as SafeUser;

      expect(deletedUser.username).toEqual(user.username);
      expect(deletedUser.dateJoined).toEqual(user.dateJoined);
    });

    // not found branch
    it('should return error when user not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOneAndDelete');

      const result = await deleteUserByUsername('ghost');
      expect(result).toEqual({ error: 'User not found' });
    });

    // thrown error branch
    it('should return error message on delete failure', async () => {
      const err = new Error('delete failed');
      mockingoose(UserModel).toReturn(err, 'findOneAndDelete');

      const result = await deleteUserByUsername(user.username);
      expect(result).toEqual({ error: 'delete failed' });
    });
  });

  describe('updateUser', () => {
    const updatedUser: User = {
      ...user,
      password: 'newPassword',
    };

    const safeUpdatedUser: SafeUser = {
      username: user.username,
      dateJoined: user.dateJoined,
    };

    const updates: Partial<User> = {
      password: 'newPassword',
    };

    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the updated user when updated succesfully', async () => {
      mockingoose(UserModel).toReturn(safeUpdatedUser, 'findOneAndUpdate');

      const result = (await updateUser(user.username, updates)) as SafeUser;

      expect(result.username).toEqual(user.username);
      expect(result.username).toEqual(updatedUser.username);
      expect(result.dateJoined).toEqual(user.dateJoined);
      expect(result.dateJoined).toEqual(updatedUser.dateJoined);
    });

    // not found branch
    it('should return error when user not found', async () => {
      mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');

      const result = await updateUser('nobody', updates);
      expect(result).toEqual({ error: 'User not found' });
    });

    // duplicate‐key branch
    // in your updateUser tests:
    it('should return error when username already exists', async () => {
      const dupErr = Object.assign(new Error('dup!'), { code: 11000 });

      // this one is correct, so just leave it as-is:
      mockingoose(UserModel).toReturn(dupErr, 'findOneAndUpdate');

      const result = await updateUser(user.username, { username: 'taken' });
      expect(result).toEqual({ error: 'Username already exists' });
    });


    // thrown error branch
    it('should return error message on update failure', async () => {
      const err = new Error('update broken');
      mockingoose(UserModel).toReturn(err, 'findOneAndUpdate');

      const result = await updateUser(user.username, updates);
      expect(result).toEqual({ error: 'update broken' });
    });
  });
});