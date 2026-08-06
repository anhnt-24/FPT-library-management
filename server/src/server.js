import app from './app.js';

const PORT = process.env.PORT || 5555;

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});
