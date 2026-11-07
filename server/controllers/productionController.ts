import { Request, Response } from 'express';
import ProductionBatch, { ProductionStatus } from '../models/ProductionBatch';
import InventoryItem from '../models/InventoryItem';
import StockTransaction, { TransactionType } from '../models/StockTransaction';
import Ingredient from '../models/Ingredient';
import { AuthRequest } from '../middleware/authMiddleware';

export const startProduction = async (req: Request, res: Response) => {
    try {
        const { ingredientId, quantityToProduce } = req.body;
        const authReq = req as AuthRequest;
        const userId = authReq.user?.uid;

        if (!quantityToProduce || quantityToProduce <= 0) {
            return res.status(400).json({ message: 'Valid quantity is required' });
        }

        const ingredient = await Ingredient.findById(ingredientId).populate('components.ingredient');

        if (!ingredient || ingredient.type !== 'Processed') {
            return res.status(400).json({ message: 'Only Processed ingredients can be produced' });
        }
        if (!ingredient.components || ingredient.components.length === 0) {
            return res.status(400).json({ message: 'This Processed ingredient has no raw ingredients mapped. Please configure them in the Ingredients page.' });
        }

        // 1. Check stock for all components
        for (const comp of ingredient.components) {
            if (!comp.ingredient) {
                 return res.status(400).json({ message: 'A referenced raw ingredient has been deleted. Please update this processed item formula.' });
            }
            const requiredQuantity = comp.quantity * quantityToProduce;
            const inventoryItem = await InventoryItem.findOne({ ingredient: comp.ingredient._id });

            if (!inventoryItem || inventoryItem.quantity < requiredQuantity) {
                const compName = (comp.ingredient as any).name || 'Unknown Component';
                return res.status(400).json({ message: `Insufficient stock for ${compName}. Required: ${requiredQuantity}, Available: ${inventoryItem ? inventoryItem.quantity : 0}` });
            }
        }

        const invoiceId = `PROD-${Date.now()}`;

        // 2. Deduct component stocks immediately
        for (const comp of ingredient.components) {
            if (!comp.ingredient) continue;
            const requiredQuantity = comp.quantity * quantityToProduce;
            const inventoryItem = await InventoryItem.findOne({ ingredient: comp.ingredient._id });

            if (inventoryItem) {
                inventoryItem.quantity -= requiredQuantity;
                await inventoryItem.save();

                await StockTransaction.create({
                    ingredient: comp.ingredient._id,
                    type: TransactionType.USAGE,
                    quantity: -requiredQuantity,
                    userId,
                    invoiceNumber: invoiceId
                });
            }
        }

        // 3. Create the active Production Batch
        const batch = await ProductionBatch.create({
            ingredient: ingredientId,
            quantity: quantityToProduce,
            status: ProductionStatus.IN_PROGRESS,
            userId,
            invoiceNumber: invoiceId
        });

        res.status(200).json({ message: 'Production started', batch });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getHistoryBatches = async (req: Request, res: Response) => {
    try {
        const batches = await ProductionBatch.find({ status: { $ne: ProductionStatus.IN_PROGRESS } })
            .populate('ingredient')
            .sort({ completedDate: -1 })
            .limit(50);
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getActiveBatches = async (req: Request, res: Response) => {
    try {
        const batches = await ProductionBatch.find({ status: ProductionStatus.IN_PROGRESS })
            .populate('ingredient')
            .sort({ startDate: -1 });
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const completeProduction = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authReq = req as AuthRequest;
        const userId = authReq.user?.uid;
        const email = authReq.user?.email || 'Unknown User';

        const batch = await ProductionBatch.findById(id);
        if (!batch) {
            return res.status(404).json({ message: 'Batch not found' });
        }
        if (batch.status !== ProductionStatus.IN_PROGRESS) {
            return res.status(400).json({ message: 'Only in-progress batches can be completed' });
        }

        batch.status = ProductionStatus.COMPLETED;
        batch.completedDate = new Date();
        batch.actionByEmail = email;
        await batch.save();

        // Increase processed ingredient stock
        let targetInventory = await InventoryItem.findOne({ ingredient: batch.ingredient });
        if (targetInventory) {
            targetInventory.quantity += Number(batch.quantity);
            await targetInventory.save();
        } else {
            targetInventory = new InventoryItem({
                ingredient: batch.ingredient,
                quantity: Number(batch.quantity),
            });
            await targetInventory.save();
        }

        await StockTransaction.create({
            ingredient: batch.ingredient,
            type: TransactionType.PRODUCTION,
            quantity: batch.quantity,
            userId,
            invoiceNumber: batch.invoiceNumber
        });

        res.status(200).json({ message: 'Production completed successfully', targetInventory });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const cancelProduction = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authReq = req as AuthRequest;
        const userId = authReq.user?.uid;
        const email = authReq.user?.email || 'Unknown User';

        const batch = await ProductionBatch.findById(id);
        if (!batch) {
             return res.status(404).json({ message: 'Batch not found' });
        }
        if (batch.status !== ProductionStatus.IN_PROGRESS) {
             return res.status(400).json({ message: 'Only in-progress batches can be cancelled' });
        }

        batch.status = ProductionStatus.CANCELLED;
        batch.completedDate = new Date();
        batch.actionByEmail = email;
        await batch.save();

        // Retrieve components to refund
        const ingredient = await Ingredient.findById(batch.ingredient).populate('components.ingredient');
        
        if (ingredient && ingredient.components) {
            for (const comp of ingredient.components) {
                if (!comp.ingredient) continue;
                const refundedQuantity = comp.quantity * batch.quantity;
                const inventoryItem = await InventoryItem.findOne({ ingredient: comp.ingredient._id });

                if (inventoryItem) {
                    inventoryItem.quantity += refundedQuantity;
                    await inventoryItem.save();

                    // Log adjustment for refund
                    await StockTransaction.create({
                        ingredient: comp.ingredient._id,
                        type: TransactionType.ADJUSTMENT,
                        quantity: refundedQuantity,
                        userId,
                        invoiceNumber: `CANCEL-${batch.invoiceNumber}`
                    });
                }
            }
        }

        res.status(200).json({ message: 'Production cancelled and raw materials refunded' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
