import { NextFunction, Request, RequestHandler, Response } from 'express';
import { buildFingerprint } from '../services/fingerprint.js';
import { sendUnauthorizedRequest } from '../utils/responseHelpers.js';

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

      req.login(user, (err) => {
        if (err) {
          console.error('Login error', err);
        }

        // logging test
        // const fpStart = Date.now();
        // buildFingerprint(user)
        //   .then(() => {
        //     console.log(
        //       `[METRIC] Fingerprint build took ${Date.now() - fpStart}ms`,
        //     );
        //   })
        //   .catch((err) => {
        //     console.error('Error building fingerprint', err);
        //   });

        buildFingerprint(user).catch((err) => {
          console.error('Error building fingerprint', err);
        });

        req.session.save((err) => {
          if (err) {
            console.error('Session save error', err);
          }

          res.redirect(process.env.CORS_ORIGIN!);
        });
      });
    });
  },

  // Logout
  handleLogout: (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
      // ?
      if (err) return next(err);
      res.redirect(process.env.CORS_ORIGIN!);
    });
  },

  getMe: (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      sendUnauthorizedRequest(res, 'Authentication failed');
      return;
    }
    return res.status(200).json({
      spotify_id: req.user.spotify_id,
      display_name: req.user.display_name,
    });
  },
};

export default authController;
