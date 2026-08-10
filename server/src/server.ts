import app from './app.js';
import { startScheduler } from './services/scheduler.js';

const PORT = Number(process.env.PORT) || 5555;

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
  startScheduler();
});
