import express from 'express';
import ingredientRoutes from './ingredientRoutes';
import recipeRoutes from './recipeRoutes';
import inventoryRoutes from './inventoryRoutes';
import productionRoutes from './productionRoutes';
import orderRoutes from './orderRoutes';
import dashboardRoutes from './dashboardRoutes';
import userRoutes from './userRoutes';
import healthRoutes from './healthRoutes';

const router = express.Router();

router.use('/ingredients', ingredientRoutes);
router.use('/recipes', recipeRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/production', productionRoutes);
router.use('/orders', orderRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);
router.use('/health', healthRoutes);

export default router;
