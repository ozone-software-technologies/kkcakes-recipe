import mongoose from 'mongoose';
import dotenv from 'dotenv';
import admin from './firebaseAdmin';
import User, { UserRole } from './models/User';
import Ingredient, { IngredientType, UnitType } from './models/Ingredient';

dotenv.config();

const usersToCreate = [
    { email: 'admin@kkcakes.com', password: 'password123', role: UserRole.ADMIN },
    { email: 'manager@kkcakes.com', password: 'password123', role: UserRole.ADMIN },
    { email: 'staff@kkcakes.com', password: 'password123', role: UserRole.STAFF },
    { email: 'baker@kkcakes.com', password: 'password123', role: UserRole.STAFF },
];

const seed = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB.');

        // --- 1. Seed Users ---
        console.log('\n--- Seeding Users ---');
        for (const u of usersToCreate) {
            let uid: string;
            try {
                const userRecord = await admin.auth().getUserByEmail(u.email);
                uid = userRecord.uid;
                await admin.auth().updateUser(uid, { password: u.password });
                console.log(`Updated Firebase user: ${u.email}`);
            } catch (err: any) {
                if (err.code === 'auth/user-not-found') {
                    const newUser = await admin.auth().createUser({
                        email: u.email,
                        password: u.password,
                    });
                    uid = newUser.uid;
                    console.log(`Created Firebase user: ${u.email}`);
                } else {
                    throw err;
                }
            }

            // Sync with MongoDB User collection
            await User.findOneAndUpdate(
                { email: u.email },
                { firebaseUid: uid, email: u.email, role: u.role },
                { upsert: true, new: true }
            );
            console.log(`Synced Mongo user: ${u.email} (${u.role})`);
        }

        // --- 2. Seed Raw Ingredients ---
        console.log('\n--- Seeding Ingredients ---');
        const rawIngredientsData = [
            { name: 'All-Purpose Flour', type: IngredientType.RAW, unit: UnitType.GRAMS },
            { name: 'Granulated Sugar', type: IngredientType.RAW, unit: UnitType.GRAMS },
            { name: 'Unsalted Butter', type: IngredientType.RAW, unit: UnitType.GRAMS },
            { name: 'Whole Milk', type: IngredientType.RAW, unit: UnitType.LITERS },
            { name: 'Large Eggs', type: IngredientType.RAW, unit: UnitType.PIECES },
            { name: 'Cocoa Powder', type: IngredientType.RAW, unit: UnitType.GRAMS },
            { name: 'Vanilla Extract', type: IngredientType.RAW, unit: UnitType.LITERS },
            { name: 'Baking Powder', type: IngredientType.RAW, unit: UnitType.GRAMS },
            { name: 'Dark Chocolate Chips', type: IngredientType.RAW, unit: UnitType.GRAMS },
            { name: 'Heavy Cream', type: IngredientType.RAW, unit: UnitType.LITERS },
        ];

        const createdRaw: Record<string, any> = {};
        for (const item of rawIngredientsData) {
            const ing = await Ingredient.findOneAndUpdate(
                { name: item.name },
                { ...item, isDeleted: false },
                { upsert: true, new: true }
            );
            createdRaw[item.name] = ing._id;
            console.log(`Created/Updated Raw Ingredient: ${ing.name} (${ing.unit})`);
        }

        // --- 3. Seed Processed Ingredients ---
        const processedIngredientsData = [
            {
                name: 'Chocolate Ganache',
                type: IngredientType.PROCESSED,
                unit: UnitType.GRAMS,
                components: [
                    { ingredient: createdRaw['Dark Chocolate Chips'], quantity: 500 },
                    { ingredient: createdRaw['Heavy Cream'], quantity: 0.5 },
                ],
            },
            {
                name: 'Vanilla Cake Batter',
                type: IngredientType.PROCESSED,
                unit: UnitType.GRAMS,
                components: [
                    { ingredient: createdRaw['All-Purpose Flour'], quantity: 1000 },
                    { ingredient: createdRaw['Granulated Sugar'], quantity: 800 },
                    { ingredient: createdRaw['Unsalted Butter'], quantity: 400 },
                    { ingredient: createdRaw['Whole Milk'], quantity: 0.6 },
                    { ingredient: createdRaw['Large Eggs'], quantity: 8 },
                    { ingredient: createdRaw['Vanilla Extract'], quantity: 0.02 },
                    { ingredient: createdRaw['Baking Powder'], quantity: 20 },
                ],
            },
            {
                name: 'Buttercream Frosting',
                type: IngredientType.PROCESSED,
                unit: UnitType.GRAMS,
                components: [
                    { ingredient: createdRaw['Unsalted Butter'], quantity: 500 },
                    { ingredient: createdRaw['Granulated Sugar'], quantity: 750 },
                    { ingredient: createdRaw['Heavy Cream'], quantity: 0.1 },
                    { ingredient: createdRaw['Vanilla Extract'], quantity: 0.01 },
                ],
            },
        ];

        for (const item of processedIngredientsData) {
            const ing = await Ingredient.findOneAndUpdate(
                { name: item.name },
                { ...item, isDeleted: false },
                { upsert: true, new: true }
            );
            console.log(`Created/Updated Processed Ingredient: ${ing.name} with ${ing.components?.length || 0} components`);
        }

        console.log('\n--- Seeding Completed Successfully! ---');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seed();
