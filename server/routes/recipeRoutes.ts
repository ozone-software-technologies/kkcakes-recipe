import express from 'express';
import {
    getRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
} from '../controllers/recipeController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticate);

router.get('/', getRecipes);
router.post('/', createRecipe);
router.put('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

export default router;
