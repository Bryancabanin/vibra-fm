import { NextFunction, Request, RequestHandler, Response } from 'express';
import {
  sendUnauthorizedRequest,
  sendBadRequest,
  sendServerError,
} from '../utils/responseHelpers';
import { recommendSongs } from '../services/songRecommendationService';
import { filterTracks } from '../services/fingerprintFilterService';
import { searchTrackId, TrackResult } from '../services/spotifySearchService';
import { saveSessionInfo } from '../services/recommendationSessionService';

type RecommendationController = {
  handleRecommendation: RequestHandler;
};

const recommendationController: RecommendationController = {
  handleRecommendation: async (req: Request, res: Response) => {
    const { artist, song } = req.body;

    // debugging
    // console.log('Session:', req.session);
    // console.log('User:', req.user);

    // Authenticate if user is logged in.
    if (!req.user) {
      console.error('Authentication failed');
      sendUnauthorizedRequest(res, 'Authentication failed');
      return;
    }

    // if missing artist or song
    if (!artist || !song) {
      console.error('Misisng artist or song');
      sendBadRequest(res, 'Artist and Song are required');
      return;
    }

    try {
      // call recommendSongsa
      const recommendedSongsResult = await recommendSongs(artist, song);

      const result = await Promise.allSettled(
        recommendedSongsResult.map(({ artist, song }) =>
          searchTrackId(artist, song, req.user!),
        ),
      );

      const tracks = result
        .filter(
          (item): item is PromiseFulfilledResult<TrackResult> =>
            item.status === 'fulfilled' && item.value !== null,
        )
        .map((item) => item.value); // full TrackResult objects

      const ids = tracks.map((track) => track.spotify_track_id);

      const filterIds = await filterTracks(ids, req.user);

      // get the filterIds and get information from tracks to send back to the frontend to display the info
      const finalTracks = tracks.filter((track) =>
        filterIds.some(
          (filteredItem) =>
            filteredItem.spotify_track_id === track.spotify_track_id,
        ),
      );

      // insert recommendation_session and recommendation_track
      await saveSessionInfo(req.user, artist, song, finalTracks).catch(
        (err) => {
          console.error('Error saving session and tracks', err);
        },
      );

      res.json(finalTracks);
    } catch (error) {
      console.error('Failed to get recommendations', error);
      sendServerError(res, 'Failed to get recommendations');
    }
  },
};

export default recommendationController;
