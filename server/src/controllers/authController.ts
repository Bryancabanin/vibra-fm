import { NextFunction, Request, RequestHandler, Response } from 'express';
import { buildFingerprint } from '../services/fingerprint';

const sendErrorResponse = (
  res: Response,
  status: number,
  message: string,
  details?: string,
): void => {
  res.status(status).json({ error: message, message, details });
};

const sendBadRequest = (res: Response, message: string): void => {
  sendErrorResponse(res, 400, message);
};

const sendUnauthorizedRequest = (res: Response, message: string): void => {
  sendErrorResponse(res, 401, message);
};

const sendServerError = (
  res: Response,
  message: string,
  details?: string,
): void => {
  sendErrorResponse(res, 500, message, details);
};

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
