declare global {
  namespace Express {
    interface User {
      id: string;
      spotify_id: string;
      access_token: string;
      refresh_token: string;
      token_expires: Date;
    }
  }
}

export {};
