import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// handle parsing request body
// reads body of incoming HTTP requests and converts it into usable JS object
app.use(express.json());

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
