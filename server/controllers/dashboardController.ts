import { Request, Response } from 'express';
import Order from '../models/Order';
import InventoryItem from '../models/InventoryItem';

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Today's Orders
        const todaysOrders = await Order.find({
            createdAt: { $gte: today, $lt: tomorrow },
        });

        const todaysOrderCount = todaysOrders.length;
        const totalRevenueToday = todaysOrders.reduce((acc, order) => acc + order.totalAmount, 0);

        // Low Stock Inventory
        const lowStockItems = await InventoryItem.find({
            $expr: { $lte: ["$quantity", "$lowStockThreshold"] }
        }).countDocuments();

        res.status(200).json({
            todaysOrderCount,
            totalRevenueToday,
            lowStockItems,
            orders: todaysOrders, // limiting logic can be added
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
