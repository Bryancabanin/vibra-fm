import { NextFunction, Request, RequestHandler, Response } from 'express';
import { buildFingerprint } from '../services/fingerprint';
import { sendUnauthorizedRequest } from '../utils/responseHelpers';

type AuthController = {
  handleCallback: RequestHandler;
  handleLogout: RequestHandler;
};

const authController: AuthController = {
  // handleCallback is not async since we do not need to wait for it to finish saving everyhting into our database.
  handleCallback: (req: Request, res: Response) => {
    if (!req.user) {
      console.error('Authentication failed');
      sendUnauthorizedRequest(res, 'Authentication failed');
      return;
    }

    buildFingerprint(req.user).catch((err) => {
      console.error('Error building fingerprint', err);
    });
    res.redirect('/');
  },

  // Logout
  handleLogout: (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
      // ?
      if (err) return next(err);
      res.redirect('/');
    });
  },
};

export default authController;
