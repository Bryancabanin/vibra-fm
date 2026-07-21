import express from 'express';
import recommendationController from '../controllers/recommendationController.js';
import { enforceSearchLimit } from '../middleware/searchLimitMiddleware.js';

const router = express.Router();

// recommendation songs
router.post(
  '/recommendations',
  enforceSearchLimit,
  recommendationController.handleRecommendation,
);

router.get('/recommendations/usage', recommendationController.handleGetUsage);

export default router;
