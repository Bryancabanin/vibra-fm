import { NextFunction, Request, RequestHandler, Response } from 'express';
import {
  sendUnauthorizedRequest,
  sendBadRequest,
  sendServerError,
} from '../utils/responseHelpers';
import {
  createPlaylist,
  addTracksToPlaylist,
} from '../services/playlistService';
import { getSessionTracks } from '../services/historyServices';

type PlaylistController = {
  handleSaveToPlaylist: RequestHandler;
};

const playlistController: PlaylistController = {
  handleSaveToPlaylist: async (req: Request, res: Response) => {
    const { session_id, playlistName } = req.body;

    // Authenticate if user is logged in.
    if (!req.user) {
      console.error('Authentication failed');
      sendUnauthorizedRequest(res, 'Authentication failed');
      return;
    }

    if (!session_id || !playlistName) {
      console.error('Missing session id or playlist name');
      sendBadRequest(res, 'Session id and playlist name is required');
      return;
    }

    try {
      // get the songs in the specific session
      const tracks = await getSessionTracks(req.user, session_id);

      if (!tracks) {
        sendServerError(res, 'Failed to get session tracks');
        return;
      }
      // extract spotify track ids
      const spotifyTrackIds = tracks.map((track) => track.spotify_track_id);
      // create playlist
      const playlistResult = await createPlaylist(req.user, playlistName);

      if (playlistResult === undefined) {
        console.error('Failed to create playlist');
        sendServerError(res, 'Failed to create playlist');
        return;
      }

      // add specific tracks into new created playlist
      await addTracksToPlaylist(
        req.user.access_token,
        playlistResult.playlistId,
        spotifyTrackIds,
      );

      res.json(playlistResult.external_urls);
    } catch (error) {
      console.error(
        'Failed to get create playlist or adding songs to playlist',
        error,
      );
      sendServerError(
        res,
        'Failed to get create playlist or adding songs to playlist',
      );
    }
  },
};

export default playlistController;
