import { startServer } from './server.js';

startServer().catch((err) => {
  console.error('Failed to start WhatsApp bot:', err);
  process.exit(1);
});
