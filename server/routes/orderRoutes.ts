import express from 'express';
import {
    getOrders,
    createOrder,
    updateOrder,
    updateOrderStatus,
} from '../controllers/orderController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticate);

router.get('/', getOrders);
router.post('/', createOrder);
router.put('/:id', updateOrder);
router.put('/:id/status', updateOrderStatus);

export default router;
