import express from 'express';
import playlistController from '../controllers/playlistController';

const router = express.Router();

// create playlist
router.post('/create-playlist', playlistController.handleSaveToPlaylist);

export default router;
