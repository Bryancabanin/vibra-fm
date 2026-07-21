import { RequestHandler } from 'express';
import { incrementSearchUsage } from '../services/searchUsageService.js';
import {
  sendServerError,
  sendErrorResponse,
} from '../utils/responseHelpers.js';

export const enforceSearchLimit: RequestHandler = async (req, res, next) => {
  if (process.env.SEARCH_LIMIT_ENABLED === 'false') {
    return next(); // limit disabled, skip straight through
  }

  // Check if user is logged in
  if (!req.user) {
    return next(); // gets sent to controller to get handled
  }

  // if search limit is true then we call our services
  try {
    const newCount = await incrementSearchUsage(req.user);

    if (newCount === null) {
      sendErrorResponse(res, 429, 'Daily search limit reached');
      return;
    }

    return next();
  } catch (error) {
    console.error('Failed to increnment search usage', error);
    sendServerError(res, 'Failed to increnment search usage');
  }
};
