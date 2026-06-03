import { NextFunction, Request, RequestHandler, Response } from 'express';
import { buildFingerprint } from '../services/fingerprint';
import { sendUnauthorizedRequest } from '../utils/responseHelpers';

type AuthController = {
  handleCallback: RequestHandler;
  handleLogout: RequestHandler;
  getMe: RequestHandler;
};

const authController: AuthController = {
  // handleCallback is not async since we do not need to wait for it to finish saving everyhting into our database.
  handleCallback: (req: Request, res: Response) => {
    if (!req.user) {
      console.error('Authentication failed');
      sendUnauthorizedRequest(res, 'Authentication failed');
      return;
    }

    const user = req.user;

    // regenerate session ID after login to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error', err);
      }

      buildFingerprint(user).catch((err) => {
        console.error('Error building fingerprint', err);
      });
      res.redirect('/');
    });
  },

  // Logout
  handleLogout: (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
      // ?
      if (err) return next(err);
      res.redirect('/');
    });
  },

  getMe: (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.error('Authentication failed');
      sendUnauthorizedRequest(res, 'Authentication failed');
      return;
    }
    return res.status(200).json({ spotify_id: req.user.spotify_id });
  },
};

export default authController;
