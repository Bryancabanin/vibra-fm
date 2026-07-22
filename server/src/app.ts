import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import authRoutes from './routes/authRoutes.ts';
import recommendationRoutes from './routes/recommendationRoutes.ts';
import historyRoutes from './routes/historyRoutes.ts';
import playlistRoutes from './routes/playlistRoutes.ts';
import passport from 'passport';
import session from 'express-session';
import cors from 'cors';
import { AppError } from './utils/AppError.js';
import './config/passport.ts';

const app = express();

app.set('trust proxy', 1);

if (!process.env.CORS_ORIGIN) {
  throw new Error('CORS_ORIGIN is required');
}

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// handle parsing request body
// reads body of incoming HTTP requests and converts it into usable JS object
app.use(express.json());

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required');
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // JavaScript can never access the cookie
      sameSite: 'lax', // blocks cross-site requests (CSRF protection),
      secure: process.env.NODE_ENV === 'production', // true in production (requires HTTPS)
      maxAge: 1000 * 60 * 60 * 24, // 24 hours in milliseconds
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', authRoutes);

// Main page
app.use('/api', recommendationRoutes);

// History of recommendation
app.use('/api', historyRoutes);
app.use('/api', playlistRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).send('Endpoint does not exist.');
});

// Global error handler
const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error('Unhandled error:', err);

  if (err instanceof AppError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Something went wrong. Please try again.' });
};

app.use(errorHandler);

export default app;
