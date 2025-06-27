import express, { Response, Request } from 'express';
import { FakeSOSocket } from '../types/socket';
import { AddMessageRequest, Message } from '../types/types';
import { saveMessage, getMessages } from '../services/message.service';

const messageController = (socket: FakeSOSocket) => {
  const router = express.Router();

  const isRequestValid = (req: AddMessageRequest): boolean =>
    !!(req.body && req.body.messageToAdd);

  const isMessageValid = (message: Message): boolean =>
    !!(
      message &&
      typeof message.msg === 'string' &&
      message.msg.trim().length > 0 &&
      typeof message.msgFrom === 'string' &&
      message.msgFrom.trim().length > 0
    );

  const addMessageRoute = async (
    req: AddMessageRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!isRequestValid(req)) {
        res.status(400).send('Invalid request');
        return;
      }

      const { messageToAdd } = req.body;
      if (!isMessageValid(messageToAdd)) {
        res.status(400).json({
          error:
            'Invalid message. msg and msgFrom are required and must be non-empty strings.',
        });
        return;
      }

      const messageToSave: Message = {
        ...messageToAdd,
        msgDateTime: messageToAdd.msgDateTime || new Date(),
      };

      const result = await saveMessage(messageToSave);
      if ('error' in result) {
        res.status(500).json(result);
        return;
      }

      const msgFromDb = result as Message;
      socket.emit('messageUpdate', { msg: msgFromDb });

      res.status(200).json({
        _id: msgFromDb._id?.toString(),
        msg: msgFromDb.msg,
        msgFrom: msgFromDb.msgFrom,
        msgDateTime: msgFromDb.msgDateTime,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  const getMessagesRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const messages = await getMessages();
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  router.post('/addMessage', addMessageRoute);
  router.get('/getMessages', getMessagesRoute);

  return router;
};

export default messageController;