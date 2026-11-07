import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { startProduction, getActiveBatches, completeProduction, cancelProduction, getHistoryBatches } from '../controllers/productionController';

const router = express.Router();

router.use(authenticate);

router.post('/start', startProduction);
router.get('/active', getActiveBatches);
router.get('/history', getHistoryBatches);
router.post('/:id/complete', completeProduction);
router.post('/:id/cancel', cancelProduction);

export default router;
