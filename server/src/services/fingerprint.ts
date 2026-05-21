// collection of every track ID associated with a user, pulled from 4 sources.
// Liked songs GET /me/tracks
// Recently played GET /me/player/recently-played
// Top tracks (3 calls: short, medium, long)  GET /me/top/tracks
// Users playlist GET /me/playlists then => GET /playlists/{id}/items

export async function buildFingerPrint(user_id: string, access_token: string) {
  // Liked songs GET /me/tracks
  // Pagnation for the liked songs.
  // There are more and the url to get the next 50 will be in the next field in the response
  // https://developer.spotify.com/documentation/web-api/reference/get-users-saved-tracks
  // https://api.spotify.com/v1/me/tracks
  // header 'Authorization: Bearer 1POdFZRZbvb...qqillRxMr2z'

  try{
    const likedTracks = await fetch('https://api.spotify.com/v1/me/tracks')
  }
}
