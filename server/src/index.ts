import app from './app.ts';

const PORT = process.env.PORT;

// need application to listen to PORT
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
