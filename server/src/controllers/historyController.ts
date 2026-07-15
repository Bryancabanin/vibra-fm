import { Request, RequestHandler, Response } from 'express';
import {
  sendServerError,
  sendUnauthorizedRequest,
} from '../utils/responseHelpers.js';
import {
  getSessions,
  getSessionTracks,
  getSessionInfo,
} from '../services/historyServices.js';

type HistoryController = {
  handleHistorySession: RequestHandler;
  handleHistorySessionTracks: RequestHandler;
  handleHistorySessionInfo: RequestHandler;
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
  handleHistorySessionInfo: async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId as string;

    if (!req.user) {
      console.error('Authentication failed');
      sendUnauthorizedRequest(res, 'Authentication failed');
      return;
    }
    try {
      const sessionInfoResult = await getSessionInfo(req.user, sessionId);
      res.json(sessionInfoResult);
    } catch (error) {
      console.error('Failed getting session info', error);
      sendServerError(res, 'Failed getting session info');
    }
  },
};

export default historyController;
