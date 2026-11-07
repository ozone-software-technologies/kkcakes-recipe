import { Request, Response } from 'express';
import InventoryItem from '../models/InventoryItem';
import StockTransaction, { TransactionType } from '../models/StockTransaction';
import Ingredient from '../models/Ingredient';
import { AuthRequest } from '../middleware/authMiddleware';

export const getInventory = async (req: Request, res: Response) => {
    try {
        const inventory = await InventoryItem.find().populate('ingredient');
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const { ingredientId } = req.query;
        const filter = ingredientId ? { ingredient: ingredientId } : {};

        const transactions = await StockTransaction.find(filter)
            .populate('ingredient')
            .sort({ date: -1 })
            .limit(200);
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateInventory = async (req: Request, res: Response) => {
    try {
        const { ingredientId, quantity, lowStockThreshold } = req.body;

        // Check if item exists
        let inventoryItem = await InventoryItem.findOne({ ingredient: ingredientId });

        if (inventoryItem) {
            // Update existing
            inventoryItem.quantity = quantity;
            if (lowStockThreshold !== undefined) inventoryItem.lowStockThreshold = lowStockThreshold;
            await inventoryItem.save();
        } else {
            // Create new
            inventoryItem = new InventoryItem({
                ingredient: ingredientId,
                quantity,
                lowStockThreshold,
            });
            await inventoryItem.save();
        }

        res.status(200).json(inventoryItem);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const getLowStockInventory = async (req: Request, res: Response) => {
    try {
        // efficient low stock query
        const inventory = await InventoryItem.find({
            $expr: { $lte: ["$quantity", "$lowStockThreshold"] }
        }).populate('ingredient');
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const receiveStock = async (req: Request, res: Response) => {
    const { ingredientId, quantity, invoiceNumber, purchaseOrder } = req.body;
    const authReq = req as AuthRequest;

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Valid quantity is required' });
    }

    try {
        // 1. Create Stock Transaction
        const transaction = new StockTransaction({
            ingredient: ingredientId,
            type: TransactionType.RECEIVE,
            quantity,
            invoiceNumber,
            purchaseOrder,
            userId: authReq.user?.uid
        });
        await transaction.save();

        // 2. Update Inventory
        let inventoryItem = await InventoryItem.findOne({ ingredient: ingredientId });

        if (inventoryItem) {
            inventoryItem.quantity += Number(quantity);
            await inventoryItem.save();
        } else {
            inventoryItem = new InventoryItem({
                ingredient: ingredientId,
                quantity: Number(quantity),
            });
            await inventoryItem.save();
        }

        res.status(200).json({ inventoryItem, transaction });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const produceIngredient = async (req: Request, res: Response) => {
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

        // 2. Deduct component stocks and create USAGE transactions
        for (const comp of ingredient.components) {
            if (!comp.ingredient) continue; // Should be impossible due to check above, but TS compliance
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

        // 3. Increase processed ingredient stock and create PRODUCTION transaction
        let targetInventory = await InventoryItem.findOne({ ingredient: ingredientId });
        if (targetInventory) {
            targetInventory.quantity += Number(quantityToProduce);
            await targetInventory.save();
        } else {
            targetInventory = new InventoryItem({
                ingredient: ingredientId,
                quantity: Number(quantityToProduce),
            });
            await targetInventory.save();
        }

        await StockTransaction.create({
            ingredient: ingredientId,
            type: TransactionType.PRODUCTION,
            quantity: quantityToProduce,
            userId,
            invoiceNumber: invoiceId
        });

        res.status(200).json({ message: 'Production successful', targetInventory });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
