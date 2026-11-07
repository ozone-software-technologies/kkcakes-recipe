'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api';

interface Ingredient {
    _id: string;
    name: string;
}

interface RecipeIngredient {
    ingredient: Ingredient | string; // Populated or ID
    quantity: number;
}

interface Recipe {
    _id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    ingredients: RecipeIngredient[];
}

import { useAuth } from '@/context/AuthContext';
import ConfirmModal from '@/components/ConfirmModal';

export default function RecipesPage() {
    const { user, loading: authLoading } = useAuth();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [recipeIngredients, setRecipeIngredients] = useState<{ ingredientId: string; quantity: number }[]>([]);

    const fetchData = async () => {
        try {
            const [recipesData, ingredientsData] = await Promise.all([
                apiRequest('/recipes'),
                apiRequest('/ingredients'),
            ]);
            setRecipes(recipesData);
            setIngredientsList(ingredientsData);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchData();
        }
    }, [user, authLoading]);

    const openModal = (recipe?: Recipe) => {
        if (recipe) {
            setEditingRecipe(recipe);
            setName(recipe.name);
            setDescription(recipe.description || '');
            setPrice(recipe.price);
            setImage(recipe.image || '');
            setRecipeIngredients(
                recipe.ingredients.map((ri) => ({
                    ingredientId: (ri.ingredient as Ingredient)._id || (ri.ingredient as string),
                    quantity: ri.quantity,
                }))
            );
        } else {
            setEditingRecipe(null);
            setName('');
            setDescription('');
            setPrice(0);
            setImage('');
            setRecipeIngredients([]);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRecipe(null);
    };

    const handleAddIngredientRow = () => {
        setRecipeIngredients([...recipeIngredients, { ingredientId: '', quantity: 0 }]);
    };

    const handleIngredientChange = (index: number, field: 'ingredientId' | 'quantity', value: string | number) => {
        const newIngredients = [...recipeIngredients];
        // @ts-ignore
        newIngredients[index][field] = value;
        setRecipeIngredients(newIngredients);
    };

    const handleRemoveIngredientRow = (index: number) => {
        const newIngredients = [...recipeIngredients];
        newIngredients.splice(index, 1);
        setRecipeIngredients(newIngredients);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name,
            description,
            price,
            image,
            ingredients: recipeIngredients.map(ri => ({ ingredient: ri.ingredientId, quantity: ri.quantity }))
        };

        try {
            if (editingRecipe) {
                await apiRequest(`/recipes/${editingRecipe._id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
            } else {
                await apiRequest('/recipes', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            }
            closeModal();
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        setRecipeToDelete(id);
    };

    const executeDelete = async () => {
        if (!recipeToDelete) return;
        try {
            await apiRequest(`/recipes/${recipeToDelete}`, {
                method: 'DELETE',
            });
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setRecipeToDelete(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Recipes
                </h2>
                <button
                    onClick={() => openModal()}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                >
                    Add Recipe
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                    <div key={recipe._id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all flex flex-col justify-between">
                        <div>
                            {recipe.image ? (
                                <img
                                    src={recipe.image}
                                    alt={recipe.name}
                                    className="w-full h-48 object-cover rounded-t-2xl"
                                />
                            ) : (
                                <div className="w-full h-48 bg-purple-50 flex items-center justify-center text-purple-300">
                                    🎂 Cake Image
                                </div>
                            )}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-1">{recipe.name}</h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{recipe.description}</p>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-2xl font-bold text-purple-600">${recipe.price}</span>
                                </div>
                                <div className="space-y-1 mb-4">
                                    <p className="text-xs font-semibold text-gray-400 uppercase">Ingredients:</p>
                                    {recipe.ingredients.slice(0, 3).map((ri, idx) => (
                                        <div key={idx} className="text-sm text-gray-600 flex justify-between">
                                            <span>{(ri.ingredient as Ingredient)?.name || 'Unknown Ingredient'}</span>
                                            <span>{ri.quantity}</span>
                                        </div>
                                    ))}
                                    {recipe.ingredients.length > 3 && <p className="text-xs text-gray-400">+ {recipe.ingredients.length - 3} more</p>}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 border-t border-gray-100 p-4 bg-gray-50">
                            <button
                                onClick={() => openModal(recipe)}
                                className="text-purple-600 hover:text-purple-900 font-medium text-sm"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(recipe._id)}
                                className="text-red-500 hover:text-red-700 font-medium text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative my-8">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800">
                            {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                    rows={2}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                    <input
                                        type="url"
                                        value={image}
                                        onChange={(e) => setImage(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Ingredients</label>
                                    <button type="button" onClick={handleAddIngredientRow} className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded hover:bg-purple-200">
                                        + Add Ingredient
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {recipeIngredients.map((ri, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <select
                                                value={ri.ingredientId}
                                                onChange={(e) => handleIngredientChange(idx, 'ingredientId', e.target.value)}
                                                className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                                                required
                                            >
                                                <option value="">Select Ingredient</option>
                                                {ingredientsList.map(ing => (
                                                    <option key={ing._id} value={ing._id}>{ing.name}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                value={ri.quantity}
                                                onChange={(e) => handleIngredientChange(idx, 'quantity', Number(e.target.value))}
                                                className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                                                placeholder="Qty"
                                                required
                                                min="0"
                                            />
                                            <button type="button" onClick={() => handleRemoveIngredientRow(idx)} className="text-red-500 hover:text-red-700">
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                                >
                                    {editingRecipe ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!recipeToDelete}
                title="Delete Recipe"
                message="Are you sure you want to delete this recipe? This action cannot be undone."
                onConfirm={executeDelete}
                onCancel={() => setRecipeToDelete(null)}
                confirmText="Delete"
            />
        </div>
    );
}
