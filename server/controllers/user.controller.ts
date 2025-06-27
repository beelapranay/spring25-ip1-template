import express, { Response, Router } from 'express';
import { UserRequest, User, UserCredentials, UserByUsernameRequest } from '../types/types';
import {
  deleteUserByUsername,
  getUserByUsername,
  loginUser,
  saveUser,
  updateUser,
} from '../services/user.service';

const userController = () => {
  const router: Router = express.Router();

  /**
   * Validates that the request body contains all required fields for a user.
   * @param req The incoming request containing user data.
   * @returns `true` if the body contains valid user fields; otherwise, `false`.
   */
  const isUserBodyValid = (req: UserRequest): boolean => {
    const { username, password } = req.body;
    return !!(username && password && typeof username === 'string' && typeof password === 'string');
  };

  /**
   * Handles the creation of a new user account.
   * @param req The request containing username and password in the body.
   * @param res The response, either returning the created user or an error.
   * @returns A promise resolving to void.
   */
  const createUser = async (req: UserRequest, res: Response): Promise<void> => {
    try {
      if (!isUserBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      const { username, password } = req.body;
      const newUser: User = {
        username,
        password,
        dateJoined: new Date(),
      };

      const result = await saveUser(newUser);

      if ('error' in result) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Handles user login by validating credentials.
   * @param req The request containing username and password in the body.
   * @param res The response, either returning the user or an error.
   * @returns A promise resolving to void.
   */
  const userLogin = async (req: UserRequest, res: Response): Promise<void> => {
    try {
      if (!isUserBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      const { username, password } = req.body;
      const loginCredentials: UserCredentials = { username, password };

      const result = await loginUser(loginCredentials);

      if ('error' in result) {
        res.status(401).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Retrieves a user by their username.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either returning the user or an error.
   * @returns A promise resolving to void.
   */
  const getUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      if (!username) {
        res.status(400).json({ error: 'Username parameter is required.' });
        return;
      }

      const result = await getUserByUsername(username);

      if ('error' in result) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Deletes a user by their username.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either the successfully deleted user object or returning an error.
   * @returns A promise resolving to void.
   */
  const deleteUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;

      if (!username) {
        res.status(400).json({ error: 'Username parameter is required.' });
        return;
      }

      const result = await deleteUserByUsername(username);

      if ('error' in result) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  /**
   * Resets a user's password.
   * @param req The request containing the username and new password in the body.
   * @param res The response, either the successfully updated user object or returning an error.
   * @returns A promise resolving to void.
   */
  const resetPassword = async (req: UserRequest, res: Response): Promise<void> => {
    try {
      if (!isUserBodyValid(req)) {
        res.status(400).send('Invalid user body');
        return;
      }

      const { username, password } = req.body;
      const updates = { password };

      const result = await updateUser(username, updates);

      if ('error' in result) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  // Define routes for the user-related operations to match test expectations
  router.post('/signup', createUser); // POST /user/signup - Create user
  router.post('/login', userLogin); // POST /user/login - User login
  router.get('/getUser/:username', getUser); // GET /user/getUser/:username - Get user by username
  router.delete('/deleteUser/:username', deleteUser); // DELETE /user/deleteUser/:username - Delete user by username
  router.patch('/resetPassword', resetPassword); // PATCH /user/resetPassword - Reset password

  return router;
};

export default userController;
