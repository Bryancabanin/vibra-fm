import app from './app.ts';

const PORT = Number(process.env.PORT);

if (!process.env.PORT) {
  throw new Error('Invalid or missing PORT in .env');
}
// need application to listen to PORT
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
