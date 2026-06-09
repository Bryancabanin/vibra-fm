import express, { NextFunction, Request, Response } from 'express';
import authRoutes from './routes/authRoutes.ts';
import recommendationRoutes from './routes/recommendationRoutes.ts';
import historyRoutes from './routes/historyRoutes.ts';
import playlistRoutes from './routes/playlistRoutes.ts';
import passport from 'passport';
import session from 'express-session';
import cors from 'cors';
import './config/passport.ts';
import 'dotenv/config';

const app = express();

app.use(
  cors({
    origin: 'http://127.0.0.1:5173',
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
      secure: false, // set to true in production (requires HTTPS)
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
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occured' },
  };

  const errorObj = Object.assign({}, defaultErr, err);

  res.status(errorObj.status).json(errorObj.message);
};

app.use(errorHandler);

export default app;
