import express from 'express';
import { getUsers, syncUser } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticate);

router.get('/', getUsers);
router.post('/sync', syncUser);

export default router;
