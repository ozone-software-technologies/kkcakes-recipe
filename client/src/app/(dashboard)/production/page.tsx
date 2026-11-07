'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import ConfirmModal from '@/components/ConfirmModal';

interface Ingredient {
    _id: string;
    name: string;
    type: string;
    unit: string;
    components?: { ingredient: string | Ingredient; quantity: number }[];
}

interface ProductionBatch {
    _id: string;
    ingredient: Ingredient;
    quantity: number;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    startDate: string;
    completedDate?: string;
    actionByEmail?: string;
    invoiceNumber: string;
}

export default function ProductionPage() {
    const { user, loading: authLoading } = useAuth();
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [processedIngredients, setProcessedIngredients] = useState<Ingredient[]>([]);
    const [activeBatches, setActiveBatches] = useState<ProductionBatch[]>([]);
    const [historyBatches, setHistoryBatches] = useState<ProductionBatch[]>([]);
    const [batchToCancel, setBatchToCancel] = useState<string | null>(null);
    
    // Form State
    const [selectedIngredient, setSelectedIngredient] = useState('');
    const [quantityToProduce, setQuantityToProduce] = useState('');
    const [formError, setFormError] = useState('');

    const fetchData = async () => {
        try {
            const data: Ingredient[] = await apiRequest('/ingredients');
            setIngredients(data);
            setProcessedIngredients(data.filter(i => i.type === 'Processed'));

            const batches: ProductionBatch[] = await apiRequest('/production/active');
            setActiveBatches(batches);

            const history: ProductionBatch[] = await apiRequest('/production/history');
            setHistoryBatches(history);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchData();
        }
    }, [user, authLoading]);

    const handleStartProduction = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        try {
            await apiRequest('/production/start', {
                method: 'POST',
                body: JSON.stringify({
                    ingredientId: selectedIngredient,
                    quantityToProduce: Number(quantityToProduce)
                }),
            });
            alert('Production Batch Started! Raw materials reserved.');
            setSelectedIngredient('');
            setQuantityToProduce('');
            fetchData();
        } catch (error: any) {
            setFormError(error.message || 'Unknown error');
        }
    };

    const handleComplete = async (batchId: string) => {
        try {
            await apiRequest(`/production/${batchId}/complete`, { method: 'POST' });
            fetchData();
        } catch (error: any) {
            alert(`Failed to complete: ${error.message || 'Unknown error'}`);
        }
    };

    const handleCancel = async (batchId: string) => {
        setBatchToCancel(batchId);
    };

    const executeCancel = async () => {
        if (!batchToCancel) return;
        try {
            await apiRequest(`/production/${batchToCancel}/cancel`, { method: 'POST' });
            fetchData();
        } catch (error: any) {
            alert(`Failed to cancel: ${error.message || 'Unknown error'}`);
        } finally {
            setBatchToCancel(null);
        }
    };

    const selectedDetails = processedIngredients.find(i => i._id === selectedIngredient);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Production
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 lg:col-span-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Start New Batch</h3>
                    <form onSubmit={handleStartProduction} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Processed Item</label>
                            <select
                                value={selectedIngredient}
                                onChange={(e) => setSelectedIngredient(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                required
                            >
                                <option value="">Select an Item to Produce...</option>
                                {processedIngredients.map(ing => (
                                    <option key={ing._id} value={ing._id}>{ing.name} ({ing.unit})</option>
                                ))}
                            </select>
                        </div>

                        {selectedDetails && (!selectedDetails.components || selectedDetails.components.length === 0) && (
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-4">
                                <h4 className="text-sm font-semibold text-red-800 text-center">
                                    Warning: {selectedDetails.name} has no raw components defined. Processed items must have at least one raw ingredient mapped in the Ingredients tab before production.
                                </h4>
                            </div>
                        )}

                        {selectedDetails && selectedDetails.components && selectedDetails.components.length > 0 && (
                            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 mb-4">
                                <h4 className="text-sm font-semibold text-emerald-800 mb-2">Recipe per 1 {selectedDetails.unit}:</h4>
                                <ul className="list-disc pl-5 text-sm text-emerald-700">
                                    {selectedDetails.components.map((comp, idx) => {
                                        const rawIng = ingredients.find(i => i._id === (typeof comp.ingredient === 'string' ? comp.ingredient : (comp.ingredient as any)._id));
                                        return (
                                            <li key={idx}>
                                                {rawIng ? rawIng.name : 'Unknown'} - {comp.quantity} {rawIng ? rawIng.unit : ''}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Yield Quantity</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    value={quantityToProduce}
                                    onChange={(e) => setQuantityToProduce(e.target.value)}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-lg font-semibold"
                                    required
                                    min="0.01" step="0.01"
                                    placeholder="0"
                                />
                                <div className="text-gray-500 font-medium whitespace-nowrap min-w-[60px]">
                                    {selectedDetails?.unit || 'Units'}
                                </div>
                            </div>
                        </div>

                        {formError && (
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-4 flex items-start gap-3">
                                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 className="text-sm font-semibold text-red-800">Cannot Start Production</h4>
                                    <p className="text-sm text-red-700 mt-1">{formError}</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={!selectedIngredient || !quantityToProduce || !selectedDetails?.components || selectedDetails.components.length === 0}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-transform transform hover:scale-105"
                            >
                                Queue Production
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Active Batches Table */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 lg:col-span-2">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Active Production Queue</h3>
                    
                    {activeBatches.length === 0 ? (
                        <div className="bg-gray-50 text-gray-500 rounded-xl p-8 text-center italic border border-dashed border-gray-200">
                            No batches currently in production. Start a new batch to see it here!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 uppercase text-xs leading-normal">
                                    <tr>
                                        <th className="py-3 px-6">Invoice</th>
                                        <th className="py-3 px-6">Processed Item</th>
                                        <th className="py-3 px-6 text-center">Batch Yield</th>
                                        <th className="py-3 px-6">Started</th>
                                        <th className="py-3 px-6 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600 text-sm">
                                    {activeBatches.map(batch => (
                                        <tr key={batch._id} className="border-b border-gray-100 hover:bg-emerald-50/30 transition-colors">
                                            <td className="py-3 px-6 text-xs text-gray-400 font-mono tracking-wider">{batch.invoiceNumber}</td>
                                            <td className="py-3 px-6 font-semibold text-gray-800">{batch.ingredient.name}</td>
                                            <td className="py-3 px-6 text-center font-bold text-emerald-600">
                                                {batch.quantity} {batch.ingredient.unit}
                                            </td>
                                            <td className="py-3 px-6 text-gray-500">
                                                {new Date(batch.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(batch.startDate).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-6 flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleComplete(batch._id)}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded shadow transition-all"
                                                    title="Mark batch as fully completed and stock inventory."
                                                >
                                                    Finish
                                                </button>
                                                <button
                                                    onClick={() => handleCancel(batch._id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded shadow transition-all"
                                                    title="Cancel batch entirely and refund raw materials."
                                                >
                                                    Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>

            {/* Audit Log Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Production Audit Log</h3>
                
                {historyBatches.length === 0 ? (
                    <div className="bg-gray-50 text-gray-500 rounded-xl p-8 text-center italic border border-dashed border-gray-200">
                        No production history available yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs leading-normal sticky top-0">
                                <tr>
                                    <th className="py-3 px-6">Invoice</th>
                                    <th className="py-3 px-6">Processed Item</th>
                                    <th className="py-3 px-6 text-center">Batch Yield</th>
                                    <th className="py-3 px-6">Status</th>
                                    <th className="py-3 px-6">Completed Date</th>
                                    <th className="py-3 px-6">Action By</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600 text-sm">
                                {historyBatches.map(batch => (
                                    <tr key={batch._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-6 text-xs text-gray-400 font-mono tracking-wider">{batch.invoiceNumber}</td>
                                        <td className="py-3 px-6 font-semibold text-gray-800">{batch.ingredient?.name || 'Deleted'}</td>
                                        <td className="py-3 px-6 text-center font-bold text-gray-700">
                                            {batch.quantity} {batch.ingredient?.unit || ''}
                                        </td>
                                        <td className="py-3 px-6">
                                            <span className={`py-1 px-3 rounded-full text-xs font-bold ${
                                                batch.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {batch.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-gray-500">
                                            {batch.completedDate ? (
                                                `${new Date(batch.completedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${new Date(batch.completedDate).toLocaleDateString()}`
                                            ) : 'Unknown'}
                                        </td>
                                        <td className="py-3 px-6 text-gray-700 font-medium font-mono text-xs">
                                            {batch.actionByEmail || 'System'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={!!batchToCancel}
                title="Cancel Production Batch"
                message="Are you sure you want to cancel this batch? Reserved raw materials will be fully refunded to inventory."
                onConfirm={executeCancel}
                onCancel={() => setBatchToCancel(null)}
                confirmText="Cancel Batch"
            />
        </div>
    );
}
