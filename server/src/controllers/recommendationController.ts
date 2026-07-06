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

      // // collecting metrics
      // // 1. Time the SEQUENTIAL version
      // const seqStart = Date.now();
      // for (const { artist: a, song: s } of recommendedSongsResult) {
      //   await searchTrackId(a, s, req.user!);
      // }
      // const seqDuration = Date.now() - seqStart;
      // console.log(
      //   `[METRIC] Sequential search time for ${recommendedSongsResult.length} tracks: ${seqDuration}ms`,
      // );

      // // 2. Time the CONCURRENT version
      // const concurrentStart = Date.now();

      const result = await Promise.allSettled(
        recommendedSongsResult.map(({ artist, song }) =>
          searchTrackId(artist, song, req.user!),
        ),
      );

      // Metric logging
      // const concurrentDuration = Date.now() - concurrentStart;
      // console.log(
      //   `[METRIC] Concurrent search time for ${recommendedSongsResult.length} tracks: ${concurrentDuration}ms`,
      // );
      // console.log(
      //   `[METRIC] Speedup: ${(seqDuration / concurrentDuration).toFixed(1)}x faster`,
      // );

      const tracks = result
        .filter(
          (item): item is PromiseFulfilledResult<TrackResult> =>
            item.status === 'fulfilled' && item.value !== null,
        )
        .map((item) => item.value); // full TrackResult objects

      // Metric logging
      // console.log(
      //   `[METRIC] GPT recommendations: ${recommendedSongsResult.length}`,
      // );
      // console.log(`[METRIC] Resolved to real Spotify tracks: ${tracks.length}`);
      // console.log(
      //   `[METRIC] Search hit rate: ${((tracks.length / recommendedSongsResult.length) * 100).toFixed(1)}%`,
      // );

      const ids = tracks.map((track) => track.spotifyTrackId);

      const filterIds = await filterTracks(ids, req.user);

      // get the filterIds and get information from tracks to send back to the frontend to display the info
      const finalTracks = tracks.filter((track) =>
        filterIds.some(
          (filteredItem) =>
            filteredItem.spotifyTrackId === track.spotifyTrackId,
        ),
      );

      // Metric logging
      // console.log(
      //   `[METRIC] Tracks before fingerprint filter: ${tracks.length}`,
      // );
      // console.log(
      //   `[METRIC] Tracks after fingerprint filter (novel): ${finalTracks.length}`,
      // );
      // console.log(
      //   `[METRIC] Filtered out as already-known: ${tracks.length - finalTracks.length}`,
      // );
      // console.log(
      //   `[METRIC] % filtered out: ${(((tracks.length - finalTracks.length) / tracks.length) * 100).toFixed(1)}%`,
      // );

      // insert recommendation_session and recommendation_track and we get sessionId out of it.
      // We use this sessionId for our frontend in order to save the songs from the session into a playlist which requires sessionId
      const sessionId = await saveSessionInfo(
        req.user,
        artist,
        song,
        finalTracks,
      );

      res.json({ sessionId, finalTracks });
    } catch (error) {
      console.error('Failed to get recommendations', error);
      sendServerError(res, 'Failed to get recommendations');
    }
  },
};

export default recommendationController;
