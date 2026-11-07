import express from 'express';
import { getDashboardData } from '../controllers/dashboardController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticate);

router.get('/', getDashboardData);

export default router;
