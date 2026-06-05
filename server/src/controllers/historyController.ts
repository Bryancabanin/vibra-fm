import { Request, RequestHandler, Response } from 'express';
import {
  sendServerError,
  sendUnauthorizedRequest,
} from '../utils/responseHelpers';
import { getSessions, getSessionTracks } from '../services/historyServices';

type HistoryController = {
  handleHistorySession: RequestHandler;
  handleHistorySessionTracks: RequestHandler;
};

const historyController: HistoryController = {
  handleHistorySession: async (req: Request, res: Response) => {
    if (!req.user) {
      console.error('Authentication failed');
      sendUnauthorizedRequest(res, 'Authentication failed');
      return;
    }
    try {
      const sessionsResult = await getSessions(req.user);
      res.json(sessionsResult);
    } catch (error) {
      console.error('Failed getting session history', error);
      sendServerError(res, 'Failed getting session history');
    }
  },

  handleHistorySessionTracks: async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId as string;

    if (!req.user) {
      console.error('Authentication failed');
      sendUnauthorizedRequest(res, 'Authentication failed');
      return;
    }
    try {
      const sessionTracksResult = await getSessionTracks(req.user, sessionId);
      res.json(sessionTracksResult);
    } catch (error) {
      console.error('Failed getting tracks for specific session', error);
      sendServerError(res, 'Failed getting tracks for specific session');
    }
  },
};

export default historyController;
