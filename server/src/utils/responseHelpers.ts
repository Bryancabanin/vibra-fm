import { Response } from 'express';

export const sendErrorResponse = (
  res: Response,
  status: number,
  message: string,
  details?: string,
): void => {
  res.status(status).json({ error: message, message, details });
};

export const sendBadRequest = (res: Response, message: string): void => {
  sendErrorResponse(res, 400, message);
};

export const sendUnauthorizedRequest = (
  res: Response,
  message: string,
): void => {
  sendErrorResponse(res, 401, message);
};

export const sendServerError = (
  res: Response,
  message: string,
  details?: string,
): void => {
  sendErrorResponse(res, 500, message, details);
};
