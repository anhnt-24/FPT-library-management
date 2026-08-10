import { Router } from 'express';
import { recommendFor } from '../services/recommend.js';
import auth from '../middleware/auth.js';

const router = Router();

// GET /api/recommendations — gợi ý sách cho member hiện tại
router.get('/', auth, (req, res) => {
  res.json(recommendFor(req.user!.id, Number(req.query.limit) || 6));
});

export default router;
