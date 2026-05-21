import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';

const router = express.Router();

// Login
router.get(
  '/auth/spotify',
  passport.authenticate('spotify', {
    scope: [
      'user-library-read',
      'user-read-recently-played',
      'user-top-read',
      'playlist-read-private',
      'user-follow-read',
      'playlist-modify-public',
      'playlist-modify-private',
    ],
  }),
);

// Callback
router.get(
  '/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/' }),
  (req: Request, res: Response) => {
    res.redirect('/');
  },
);

// Log out
router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    // ?
    if (err) return next(err);
    res.redirect('/');
  });
});

export default router;
