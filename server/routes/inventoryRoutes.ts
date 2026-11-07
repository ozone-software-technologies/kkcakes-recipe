import express from 'express';
import {
    getInventory,
    updateInventory,
    getLowStockInventory,
    receiveStock,
    getTransactions
} from '../controllers/inventoryController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticate);

router.get('/', getInventory);
router.get('/transactions', getTransactions);
router.post('/update', updateInventory); // update or create
router.post('/receive', receiveStock); // receive stock with invoice
router.get('/low-stock', getLowStockInventory);

export default router;
