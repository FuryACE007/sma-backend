import { startApp } from './app';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  const app = await startApp();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
