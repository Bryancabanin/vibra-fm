import { describe, it, expect, vi } from 'vitest';
import {
  sendBadRequest,
  sendServerError,
  sendUnauthorizedRequest,
} from './responseHelpers.js';
import { Response } from 'express';

describe('sendBadRequest', () => {
  it('responds with a 400 status and the correct error messsage', () => {
    // create mock express response so we can get a res
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    // call function we are testing
    sendBadRequest(res, 'Missing required field');

    // Assert it behaved correctly
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Missing required field',
      message: 'Missing required field',
      details: undefined,
    });
  });
});

describe('sendServerError', () => {
  it('respond with a 500 status and the correct error message and details', () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    // call function
    sendServerError(
      res,
      'Failed to get info from server',
      'Connection timeout after 5000ms',
    );

    // Assert
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Failed to get info from server',
      message: 'Failed to get info from server',
      details: 'Connection timeout after 5000ms',
    });
  });
});

describe('sendUnauthorizedRequest', () => {
  it('respond with a 401 status and the correct error message', () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;

    // call function
    sendUnauthorizedRequest(res, 'Authentication failed');

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Authentication failed',
      message: 'Authentication failed',
    });
  });
});
