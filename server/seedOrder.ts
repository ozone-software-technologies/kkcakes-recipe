import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order, { OrderStatus } from './models/Order';
import Recipe from './models/Recipe';

dotenv.config();

const createTestOrder = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB.');

        const recipes = await Recipe.find({ name: { $in: ['Chocolate Fudge Cake', 'Classic Vanilla Berry Cake'] } });
        if (recipes.length === 0) {
            console.log('No matching recipes found.');
            process.exit(1);
        }

        const itemsPayload = recipes.map((r) => ({
            recipe: r._id,
            quantity: 1,
            price: r.price,
        }));

        const totalAmount = itemsPayload.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const newOrder = new Order({
            customerName: 'Sarah Johnson',
            items: itemsPayload,
            totalAmount,
            status: OrderStatus.PENDING,
        });

        await newOrder.save();
        console.log(`Created sample order for Sarah Johnson ($${totalAmount}) with ${itemsPayload.length} cake items.`);
        process.exit(0);
    } catch (error) {
        console.error('Error creating order:', error);
        process.exit(1);
    }
};

createTestOrder();
