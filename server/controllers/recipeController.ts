import { Request, Response } from 'express';
import Recipe from '../models/Recipe';

export const getRecipes = async (req: Request, res: Response) => {
    try {
        const recipes = await Recipe.find().populate('ingredients.ingredient');
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const createRecipe = async (req: Request, res: Response) => {
    try {
        const { name, description, price, ingredients, image } = req.body;
        const newRecipe = new Recipe({
            name,
            description,
            price,
            ingredients,
            image,
        });
        await newRecipe.save();
        res.status(201).json(newRecipe);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const updateRecipe = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, price, ingredients, image } = req.body;
        const updatedRecipe = await Recipe.findByIdAndUpdate(
            id,
            { name, description, price, ingredients, image },
            { new: true }
        );
        if (!updatedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.status(200).json(updatedRecipe);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const deleteRecipe = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedRecipe = await Recipe.findByIdAndDelete(id);
        if (!deletedRecipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.status(200).json({ message: 'Recipe deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
