import express from 'express';
import historyController from '../controllers/historyController.js';

const router = express.Router();

// Route to get history of sessions
router.get('/history', historyController.handleHistorySession);

// / Route to get info (seed song/artist/date) for a specific session
router.get(
  '/history/:sessionId/info',
  historyController.handleHistorySessionInfo,
);

// Route to get all songs from specific session
router.get('/history/:sessionId', historyController.handleHistorySessionTracks);

export default router;
