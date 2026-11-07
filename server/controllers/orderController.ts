import { Request, Response } from 'express';
import Order, { OrderStatus } from '../models/Order';
import Recipe, { IRecipe } from '../models/Recipe';
import InventoryItem from '../models/InventoryItem';
import StockTransaction, { TransactionType } from '../models/StockTransaction';
import { AuthRequest } from '../middleware/authMiddleware';

export const getOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find().populate('items.recipe').sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { customerName, items, totalAmount } = req.body;
        const authReq = req as AuthRequest;
        const userId = authReq.user?.uid;

        // 1. Pre-flight Stock Validation
        // Aggregate all required ingredients
        const ingredientRequirements = new Map<string, { totalRequired: number, name: string }>();

        for (const item of items) {
            const recipe = await Recipe.findById(item.recipe).populate('ingredients.ingredient');
            if (recipe && recipe.ingredients) {
                for (const recipeIng of recipe.ingredients) {
                    const totalForThisItem = recipeIng.quantity * item.quantity;
                    const ingredientIdStr = (recipeIng.ingredient as any)._id?.toString() || recipeIng.ingredient.toString();
                    const ingredientName = (recipeIng.ingredient as any).name || 'Unknown Ingredient';

                    const currentReq = ingredientRequirements.get(ingredientIdStr);
                    if (currentReq) {
                        currentReq.totalRequired += totalForThisItem;
                    } else {
                        ingredientRequirements.set(ingredientIdStr, { totalRequired: totalForThisItem, name: ingredientName });
                    }
                }
            } else {
                return res.status(404).json({ message: `Recipe not found for item: ${item.recipe}` });
            }
        }

        // Check Inventory
        for (const [ingredientIdStr, req] of Array.from(ingredientRequirements.entries())) {
            const inventoryItem = await InventoryItem.findOne({ ingredient: ingredientIdStr });
            if (!inventoryItem || inventoryItem.quantity < req.totalRequired) {
                return res.status(400).json({ message: `Insufficient stock for ${req.name}. Required: ${req.totalRequired}, Available: ${inventoryItem?.quantity || 0}` });
            }
        }

        // 2. Create the Order
        const newOrder = new Order({
            ...req.body,
            customerName,
            items,
            totalAmount,
            status: OrderStatus.PENDING,
        });
        await newOrder.save();

        // 3. Deduct Stock Logic
        for (const [ingredientIdStr, req] of Array.from(ingredientRequirements.entries())) {
            const inventoryItem = await InventoryItem.findOne({ ingredient: ingredientIdStr });
            if (inventoryItem) {
                inventoryItem.quantity -= req.totalRequired;
                await inventoryItem.save();

                // Log Transaction (USAGE)
                await StockTransaction.create({
                    ingredient: ingredientIdStr,
                    type: TransactionType.USAGE,
                    quantity: -req.totalRequired, // Negative for usage
                    userId: userId,
                    invoiceNumber: `ORDER-${newOrder._id}` // Link to order
                });
            }
        }

        res.status(201).json(newOrder);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const updateOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        ).populate('items.recipe');

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!Object.values(OrderStatus).includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};
