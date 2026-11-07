import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Recipe from './models/Recipe';
import Ingredient from './models/Ingredient';

dotenv.config();

const sampleRecipes = [
    {
        name: 'Chocolate Fudge Cake',
        description: 'Rich, moist chocolate cake layered with dark chocolate ganache and chocolate frosting.',
        price: 45,
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
        ingredients: [
            { name: 'All-Purpose Flour', quantity: 300 },
            { name: 'Granulated Sugar', quantity: 250 },
            { name: 'Unsalted Butter', quantity: 150 },
            { name: 'Cocoa Powder', quantity: 80 },
            { name: 'Large Eggs', quantity: 4 },
            { name: 'Heavy Cream', quantity: 0.2 },
            { name: 'Dark Chocolate Chips', quantity: 200 },
        ],
    },
    {
        name: 'Classic Vanilla Berry Cake',
        description: 'Fluffy vanilla sponge cake topped with fresh buttercream and summer berries.',
        price: 40,
        image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80',
        ingredients: [
            { name: 'All-Purpose Flour', quantity: 350 },
            { name: 'Granulated Sugar', quantity: 200 },
            { name: 'Unsalted Butter', quantity: 180 },
            { name: 'Whole Milk', quantity: 0.25 },
            { name: 'Large Eggs', quantity: 4 },
            { name: 'Vanilla Extract', quantity: 0.015 },
        ],
    },
    {
        name: 'Red Velvet Deluxe Cake',
        description: 'Decadent red velvet layers paired with silky cream cheese frosting.',
        price: 50,
        image: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80',
        ingredients: [
            { name: 'All-Purpose Flour', quantity: 320 },
            { name: 'Granulated Sugar', quantity: 220 },
            { name: 'Unsalted Butter', quantity: 160 },
            { name: 'Cocoa Powder', quantity: 30 },
            { name: 'Large Eggs', quantity: 3 },
            { name: 'Vanilla Extract', quantity: 0.01 },
        ],
    },
    {
        name: 'Strawberry Shortcake',
        description: 'Light and airy cake layers loaded with fresh strawberries and whipped cream.',
        price: 42,
        image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80',
        ingredients: [
            { name: 'All-Purpose Flour', quantity: 280 },
            { name: 'Granulated Sugar', quantity: 180 },
            { name: 'Unsalted Butter', quantity: 120 },
            { name: 'Heavy Cream', quantity: 0.3 },
            { name: 'Large Eggs', quantity: 4 },
        ],
    },
];

const seedRecipes = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB.');

        const allIngs = await Ingredient.find();
        const ingMap = new Map<string, string>();
        allIngs.forEach((ing) => {
            ingMap.set(ing.name, ing._id.toString());
        });

        for (const recipeData of sampleRecipes) {
            const recipeIngredients = recipeData.ingredients
                .map((item) => {
                    const ingId = ingMap.get(item.name);
                    if (!ingId) return null;
                    return { ingredient: ingId, quantity: item.quantity };
                })
                .filter((item): item is { ingredient: string; quantity: number } => item !== null);

            await Recipe.findOneAndUpdate(
                { name: recipeData.name },
                {
                    name: recipeData.name,
                    description: recipeData.description,
                    price: recipeData.price,
                    image: recipeData.image,
                    ingredients: recipeIngredients,
                },
                { upsert: true, new: true }
            );
            console.log(`Created/Updated Recipe: ${recipeData.name} ($${recipeData.price})`);
        }

        console.log('\n--- Recipe Seeding Finished Successfully! ---');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding recipes:', error);
        process.exit(1);
    }
};

seedRecipes();
