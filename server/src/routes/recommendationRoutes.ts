import express from 'express';
import recommendationController from '../controllers/recommendationController';

const router = express.Router();

// recommendation songs
router.post('/recommendations', recommendationController.handleRecommendation);

export default router;
