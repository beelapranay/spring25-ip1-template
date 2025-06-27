import MessageModel from '../models/messages.model';
import { Message, MessageResponse } from '../types/types';

/**
 * Saves a new message to the database.
 *
 * @param {Message} message - The message to save
 *
 * @returns {Promise<MessageResponse>} - The saved message or an error message
 */
export const saveMessage = async (message: Message): Promise<MessageResponse> => {
  try {
    const newMessage = new MessageModel(message);
    const savedMessage = await newMessage.save();

    return savedMessage.toObject();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save message';
    return { error: errorMessage };
  }
};

/**
 * Retrieves all messages from the database, sorted by date in ascending order.
 *
 * @returns {Promise<Message[]>} - An array of messages. If an error occurs, an empty array is returned.
 */
export const getMessages = async (): Promise<Message[]> => {
  try {
    const messages = await MessageModel.find({})
      .sort({ msgDateTime: 1 })
      .lean();

    return (messages as Message[]).sort(
      (a, b) => a.msgDateTime.getTime() - b.msgDateTime.getTime()
    );
  } catch {
    return [];
  }
};
