import MessageModel from '../../models/messages.model';
import { getMessages, saveMessage } from '../../services/message.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const message1 = {
  msg: 'Hello',
  msgFrom: 'User1',
  msgDateTime: new Date('2024-06-04'),
};

const message2 = {
  msg: 'Hi',
  msgFrom: 'User2',
  msgDateTime: new Date('2024-06-05'),
};

describe('Message model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveMessage', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the saved message', async () => {
      mockingoose(MessageModel).toReturn(message1, 'save');

      const savedMessage = await saveMessage(message1);
      expect(savedMessage).toMatchObject(message1);
    });

    // error branch
    it('should return an error when save operation fails', async () => {
      const err = new Error('DB failure');
      mockingoose(MessageModel).toReturn(err, 'save');

      const result = await saveMessage(message1);
      expect(result).toEqual({ error: 'DB failure' });
    });

    // fallback‐message branch (empty message)
    it('should return fallback message when error has no message', async () => {
      mockingoose(MessageModel).toReturn(new Error(), 'save');

      const result = await saveMessage(message1);
      expect(result).toEqual({ error: '' });
    });
  });

  describe('getMessages', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return all messages, sorted by date', async () => {
      mockingoose(MessageModel).toReturn([message2, message1], 'find');

      const messages = await getMessages();
      expect(messages).toMatchObject([message1, message2]);
    });

    // error branch
    it('should return an empty array when the query fails', async () => {
      const err = new Error('Something went wrong');
      mockingoose(MessageModel).toReturn(err, 'find');

      const messages = await getMessages();
      expect(messages).toEqual([]);
    });

    // empty‐DB branch
    it('should return an empty array when there are no messages', async () => {
      mockingoose(MessageModel).toReturn([], 'find');

      const messages = await getMessages();
      expect(messages).toEqual([]);
    });
  });
});