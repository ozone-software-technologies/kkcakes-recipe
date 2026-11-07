import mongoose from 'mongoose';
import dotenv from 'dotenv';
import InventoryItem from './models/InventoryItem';
import Ingredient, { UnitType } from './models/Ingredient';

dotenv.config();

const seedInventory = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB.');

        const ingredients = await Ingredient.find({ isDeleted: { $ne: true } });
        console.log(`Found ${ingredients.length} active ingredients.`);

        for (const ing of ingredients) {
            let initialQty = 10000; // default 10k
            if (ing.unit === UnitType.GRAMS) {
                initialQty = 50000; // 50 kg
            } else if (ing.unit === UnitType.LITERS) {
                initialQty = 100; // 100 L
            } else if (ing.unit === UnitType.PIECES) {
                initialQty = 1000; // 1000 pcs
            }

            await InventoryItem.findOneAndUpdate(
                { ingredient: ing._id },
                {
                    ingredient: ing._id,
                    quantity: initialQty,
                    lowStockThreshold: 10,
                },
                { upsert: true, new: true }
            );

            console.log(`Updated Inventory: ${ing.name} = ${initialQty} ${ing.unit}`);
        }

        console.log('\n--- Inventory Seeding Finished Successfully! ---');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding inventory:', error);
        process.exit(1);
    }
};

seedInventory();
