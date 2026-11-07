import mongoose from 'mongoose';
import dotenv from 'dotenv';
import InventoryItem from './models/InventoryItem';
import Ingredient from './models/Ingredient';

dotenv.config();

const checkInventory = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        const inventory = await InventoryItem.find().populate('ingredient');
        console.log('--- Inventory Items ---');
        console.log(JSON.stringify(inventory, null, 2));
        const ingredients = await Ingredient.find();
        console.log(`\nTotal Ingredients in DB: ${ingredients.length}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkInventory();
