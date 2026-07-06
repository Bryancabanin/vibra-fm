import { describe, it, expect, vi } from 'vitest';
import playlistController from './playlistController';
import * as responseHelpers from '../utils/responseHelpers';
import * as historyServices from '../services/historyServices';
import * as playlistService from '../services/playlistService';
import { Request, Response } from 'express';

vi.mock('../utils/responseHelpers');
vi.mock('../services/historyServices');
vi.mock('../services/playlistService');

describe('handleSaveToPlaylist', () => {
  // Testing misising user
  it('responds with 401 when req.user is missing', async () => {
    const req = { body: {}, user: undefined } as unknown as Request;
    const res = {} as Response;

    await playlistController.handleSaveToPlaylist(req, res, vi.fn());

    expect(responseHelpers.sendUnauthorizedRequest).toHaveBeenCalledWith(
      res,
      'Authentication failed',
    );
  });

  // Testing if sessionID and playlistName is missing
  it('responds with 400 when sessionId and playlistName is missing', async () => {
    const req = {
      body: {},
      user: {
        id: 'user-123',
        spotify_id: 'spotify-123',
        display_name: 'Test',
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        token_expires: new Date(),
      },
    } as unknown as Request;
    const res = {} as Response;

    await playlistController.handleSaveToPlaylist(req, res, vi.fn());

    expect(responseHelpers.sendBadRequest).toHaveBeenCalledWith(
      res,
      'Session id and playlist name is required',
    );
  });

  // Testing external functions getSessionTracks, createPlaylist, addTracksToPlaylist
  it('creates a playlist and adds tracks when everything suceeds', async () => {
    const req = {
      body: { sessionId: 'session-1', playlistName: 'My Playlist' },
      user: {
        id: 'user-123',
        spotify_id: 'spotify-123',
        display_name: 'Test',
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        token_expires: new Date(),
      },
    } as unknown as Request;

    const res = {
      json: vi.fn(),
    } as unknown as Response;

    // Tell each mocked function what to return for this scenario
    vi.mocked(historyServices.getSessionTracks).mockResolvedValue([
      {
        spotifyTrackId: 'track-1',
        song: 'Song A',
        artist: 'Artist A',
        album: 'Album A',
        albumUrl: 'url-a',
      },
      {
        spotifyTrackId: 'track-2',
        song: 'Song B',
        artist: 'Artist B',
        album: 'Album B',
        albumUrl: 'url-b',
      },
    ]);

    vi.mocked(playlistService.createPlaylist).mockResolvedValue({
      playlistId: 'playlist-1',
      external_urls: 'https://open.spotify.com/playlist/playlist-1',
    });

    vi.mocked(playlistService.addTracksToPlaylist).mockResolvedValue(undefined);

    await playlistController.handleSaveToPlaylist(req, res, vi.fn());

    expect(historyServices.getSessionTracks).toHaveBeenCalledWith(
      req.user,
      'session-1',
    );

    expect(playlistService.createPlaylist).toHaveBeenCalledWith(
      req.user,
      'My Playlist',
    );

    expect(playlistService.addTracksToPlaylist).toHaveBeenCalledWith(
      'fake-access-token',
      'playlist-1',
      ['track-1', 'track-2'],
    );

    expect(res.json).toHaveBeenCalledWith(
      'https://open.spotify.com/playlist/playlist-1',
    );
  });
});
