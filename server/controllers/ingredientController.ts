import { Request, Response } from 'express';
import Ingredient, { IIngredient } from '../models/Ingredient';

export const getIngredients = async (req: Request, res: Response) => {
    try {
        const ingredients = await Ingredient.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
        res.status(200).json(ingredients);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const createIngredient = async (req: Request, res: Response) => {
    try {
        const { name, type, unit, components } = req.body;

        const existing = await Ingredient.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, isDeleted: { $ne: true } });
        if (existing) {
            return res.status(400).json({ message: 'An active ingredient with this exact name already exists.' });
        }

        const newIngredient = new Ingredient({ name, type, unit, components });
        await newIngredient.save();
        res.status(201).json(newIngredient);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const updateIngredient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, type, unit, components } = req.body;

        const existing = await Ingredient.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, _id: { $ne: id }, isDeleted: { $ne: true } });
        if (existing) {
            return res.status(400).json({ message: 'An active ingredient with this exact name already exists.' });
        }

        const updatedIngredient = await Ingredient.findByIdAndUpdate(
            id,
            { name, type, unit, components },
            { new: true }
        );
        if (!updatedIngredient) {
            return res.status(404).json({ message: 'Ingredient not found' });
        }
        res.status(200).json(updatedIngredient);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
};

export const deleteIngredient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deletedIngredient = await Ingredient.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!deletedIngredient) {
            return res.status(404).json({ message: 'Ingredient not found' });
        }
        res.status(200).json({ message: 'Ingredient deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
