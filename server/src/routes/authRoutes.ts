import express from 'express';
import passport from 'passport';
import authController from '../controllers/authController';

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
      'playlist-modify-public',
      'playlist-modify-private',
    ],
  }),
);

// Callback
router.get(
  '/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/' }),
  authController.handleCallback,
);

// Log out
router.get('/logout', authController.handleLogout);

// GET me
router.get('/auth/me', authController.getMe);

export default router;
