import app from './app.ts';

const PORT = Number(process.env.PORT);

if (!process.env.PORT) {
  throw new Error('Invalid or missing PORT in .env');
}
// need application to listen to PORT
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server is running on 127.0.0.1:${PORT}`);
});
