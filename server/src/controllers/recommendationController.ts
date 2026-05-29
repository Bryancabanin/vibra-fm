import { NextFunction, Request, RequestHandler, Response } from 'express';
import {
  sendUnauthorizedRequest,
  sendBadRequest,
  sendServerError,
} from '../utils/responseHelpers';
import { recommendSongs } from '../services/songRecommendationService';
import { filterTracks } from '../services/fingerprintFilterService';
import { searchTrackId } from '../services/spotifySearchService';

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

      const trackIds = result
        .filter(
          (item): item is PromiseFulfilledResult<string> =>
            item.status === 'fulfilled' && item.value !== null,
        )
        .map((item) => item.value);

      const filterIds = await filterTracks(trackIds, req.user);

      res.json(filterIds);
    } catch (error) {
      console.error('Failed to get recommendations', error);
      sendServerError(res, 'Failed to get recommendations');
    }
  },
};

export default recommendationController;
