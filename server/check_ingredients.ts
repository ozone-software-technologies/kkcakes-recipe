
import mongoose from 'mongoose';
import Ingredient from './models/Ingredient';
import dotenv from 'dotenv';
dotenv.config();

const checkIngredients = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        const count = await Ingredient.countDocuments();
        console.log(`Total Ingredients: ${count}`);
        const ingredients = await Ingredient.find().limit(5);
        console.log('Sample Ingredients:', JSON.stringify(ingredients, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkIngredients();
