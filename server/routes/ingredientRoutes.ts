import express from 'express';
import {
    getIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient,
} from '../controllers/ingredientController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticate);

router.get('/', getIngredients);
router.post('/', createIngredient);
router.put('/:id', updateIngredient);
router.delete('/:id', deleteIngredient);

export default router;
