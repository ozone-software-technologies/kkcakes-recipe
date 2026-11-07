'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api';
import ConfirmModal from '@/components/ConfirmModal';

interface Ingredient {
    _id: string;
    name: string;
    type: string;
    unit: string;
    components?: { ingredient: string | Ingredient; quantity: number }[];
}

import { useAuth } from '@/context/AuthContext';

export default function IngredientsPage() {
    const { user, loading: authLoading } = useAuth();
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
    const [ingredientToDelete, setIngredientToDelete] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [type, setType] = useState('Raw');
    const [unit, setUnit] = useState('Grams');
    const [components, setComponents] = useState<{ ingredient: string; quantity: number }[]>([]);
    const [formError, setFormError] = useState('');

    const fetchIngredients = async () => {
        try {
            const data = await apiRequest('/ingredients');
            setIngredients(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchIngredients();
        }
    }, [user, authLoading]);

    const openModal = (ingredient?: Ingredient) => {
        setFormError('');
        if (ingredient) {
            setEditingIngredient(ingredient);
            setName(ingredient.name);
            setType(ingredient.type);
            setUnit(ingredient.unit);
            setComponents(ingredient.components ? ingredient.components.map(c => ({
                ingredient: typeof c.ingredient === 'string' ? c.ingredient : (c.ingredient as any)._id || c.ingredient,
                quantity: c.quantity
            })) : []);
        } else {
            setEditingIngredient(null);
            setName('');
            setType('Raw');
            setUnit('Grams');
            setComponents([]);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingIngredient(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        try {
            const payload = { name, type, unit, components: type === 'Processed' ? components : [] };
            if (editingIngredient) {
                // Edit
                await apiRequest(`/ingredients/${editingIngredient._id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload),
                });
            } else {
                // Add
                await apiRequest('/ingredients', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
            }
            closeModal();
            fetchIngredients();
        } catch (error: any) {
            setFormError(error.message || 'An error occurred');
        }
    };

    const handleDelete = async (id: string) => {
        setIngredientToDelete(id);
    };

    const executeDelete = async () => {
        if (!ingredientToDelete) return;
        try {
            await apiRequest(`/ingredients/${ingredientToDelete}`, {
                method: 'DELETE',
            });
            fetchIngredients();
        } catch (error) {
            console.error(error);
        } finally {
            setIngredientToDelete(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Ingredients
                </h2>
                <button
                    onClick={() => openModal()}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                >
                    Add Ingredient
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
                        <tr>
                            <th className="py-3 px-6">Name</th>
                            <th className="py-3 px-6">Type</th>
                            <th className="py-3 px-6">Unit</th>
                            <th className="py-3 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                        {ingredients.map((ing) => (
                            <tr key={ing._id} className="border-b border-gray-200 hover:bg-purple-50 transition-colors">
                                <td className="py-3 px-6 whitespace-nowrap font-medium">{ing.name}</td>
                                <td className="py-3 px-6">
                                    <span className={`px-3 py-1 rounded-full text-xs ${ing.type === 'Raw' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {ing.type}
                                    </span>
                                </td>
                                <td className="py-3 px-6">{ing.unit}</td>
                                <td className="py-3 px-6 text-right">
                                    <button
                                        onClick={() => openModal(ing)}
                                        className="text-purple-600 hover:text-purple-900 mr-4 font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ing._id)}
                                        className="text-red-500 hover:text-red-700 font-medium"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {ingredients.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-8 text-center text-gray-400">No ingredients found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl transform transition-all scale-100 opacity-100">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800">
                            {editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {formError && (
                                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                    <p className="text-sm font-semibold text-red-700">{formError}</p>
                                </div>
                            )}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                >
                                    <option value="Raw">Raw</option>
                                    <option value="Processed">Processed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                <select
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                >
                                    <option value="Grams">Grams</option>
                                    <option value="Pieces">Pieces</option>
                                    <option value="Liters">Liters</option>
                                </select>
                            </div>

                            {type === 'Processed' && (
                                <div className="mt-4 border-t pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">Required Ingredients</label>
                                        <button
                                            type="button"
                                            onClick={() => setComponents([...components, { ingredient: '', quantity: 1 }])}
                                            className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded hover:bg-purple-200"
                                        >
                                            + Add Raw Ingredient
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                        {components.map((comp, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <select
                                                    value={comp.ingredient}
                                                    onChange={e => {
                                                        const newC = [...components];
                                                        newC[idx].ingredient = e.target.value;
                                                        setComponents(newC);
                                                    }}
                                                    className="flex-1 border p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                    required
                                                >
                                                    <option value="">Select Raw</option>
                                                    {ingredients.filter(i => i.type === 'Raw').map(i => (
                                                        <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    value={comp.quantity}
                                                    onChange={e => {
                                                        const newC = [...components];
                                                        newC[idx].quantity = Number(e.target.value);
                                                        setComponents(newC);
                                                    }}
                                                    className="w-24 border p-2 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                                    placeholder="Qty"
                                                    required
                                                    min="0.01" step="0.01"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setComponents(components.filter((_, i) => i !== idx))}
                                                    className="text-red-500 font-bold px-2 hover:text-red-700"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 mt-6">
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
                                    {editingIngredient ? 'Update' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!ingredientToDelete}
                title="Delete Ingredient"
                message="Are you sure you want to delete this ingredient? This action cannot be undone."
                onConfirm={executeDelete}
                onCancel={() => setIngredientToDelete(null)}
                confirmText="Delete"
            />
        </div>
    );
}
