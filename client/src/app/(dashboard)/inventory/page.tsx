'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api';

interface Ingredient {
    _id: string;
    name: string;
    unit: string;
}

interface InventoryItem {
    _id: string;
    ingredient: Ingredient;
    quantity: number;
    lowStockThreshold: number;
}

interface StockTransaction {
    _id: string;
    ingredient: Ingredient | null;
    type: 'RECEIVE' | 'USAGE' | 'PRODUCTION' | 'ADJUSTMENT';
    quantity: number;
    date: string;
    createdAt?: string;
    invoiceNumber: string;
    purchaseOrder?: string;
}

import { useAuth } from '@/context/AuthContext';

export default function InventoryPage() {
    const { user, loading: authLoading } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    
    // Transaction Modal State
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [modalTransactions, setModalTransactions] = useState<StockTransaction[]>([]);
    const [activeIngredientName, setActiveIngredientName] = useState('');

    // List Controls
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Receive Stock Form State
    const [selectedIngredient, setSelectedIngredient] = useState('');
    const [receiveQuantity, setReceiveQuantity] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [purchaseOrder, setPurchaseOrder] = useState('');

    const fetchInventory = async () => {
        try {
            const data = await apiRequest('/inventory');
            setInventory(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

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
            fetchInventory();
            fetchIngredients();
        }
    }, [user, authLoading]);

    const handleUpdateStock = async (ingredientId: string, newQuantity: number, currentThreshold: number) => {
        try {
            await apiRequest('/inventory/update', {
                method: 'POST',
                body: JSON.stringify({
                    ingredientId,
                    quantity: newQuantity,
                    lowStockThreshold: currentThreshold
                }),
            });
            fetchInventory();
        } catch (error) {
            console.error('Error updating stock:', error);
        }
    };

    const handleUpdateThreshold = async (ingredientId: string, currentQuantity: number, newThreshold: number) => {
        try {
            await apiRequest('/inventory/update', {
                method: 'POST',
                body: JSON.stringify({
                    ingredientId,
                    quantity: currentQuantity,
                    lowStockThreshold: newThreshold
                }),
            });
            fetchInventory();
        } catch (error) {
            console.error('Error updating threshold:', error);
        }
    };

    const handleReceiveStock = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiRequest('/inventory/receive', {
                method: 'POST',
                body: JSON.stringify({
                    ingredientId: selectedIngredient,
                    quantity: Number(receiveQuantity),
                    invoiceNumber,
                    purchaseOrder
                }),
            });
            setIsReceiveModalOpen(false);
            // Reset form
            setSelectedIngredient('');
            setReceiveQuantity('');
            setInvoiceNumber('');
            setPurchaseOrder('');
            fetchInventory();
        } catch (error) {
            console.error('Error receiving stock:', error);
            alert('Failed to receive stock');
        }
    };

    const filteredInventory = inventory.filter(item => {
        const itemName = item.ingredient ? item.ingredient.name.toLowerCase() : 'deleted ingredient';
        return itemName.includes(searchQuery.toLowerCase());
    });

    const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
    const paginatedInventory = filteredInventory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const openTransactionHistory = async (ingredientId: string, ingredientName: string) => {
        setIsTransactionModalOpen(true);
        setActiveIngredientName(ingredientName);
        setModalTransactions([]); // reset while loading
        try {
            const data = await apiRequest(`/inventory/transactions?ingredientId=${ingredientId}`);
            setModalTransactions(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    Inventory
                </h2>
                <div className="flex gap-4 items-center">
                    <input 
                        type="text" 
                        placeholder="Search inventory..." 
                        value={searchQuery}
                        onChange={handleSearch}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none w-64"
                    />
                    <button
                        onClick={() => setIsReceiveModalOpen(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2"
                    >
                        <span>📥</span> Receive Stock
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
                        <tr>
                            <th className="py-3 px-6">Ingredient</th>
                            <th className="py-3 px-6">Current Stock</th>
                            <th className="py-3 px-6">Unit</th>
                            <th className="py-3 px-6">Low Stock Threshold</th>
                            <th className="py-3 px-6">Status</th>
                            <th className="py-3 px-6 text-right">Logs</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                        {paginatedInventory.map((item) => (
                            <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-6 font-medium">
                                    {item.ingredient ? item.ingredient.name : <span className="text-red-400 italic">Deleted Ingredient</span>}
                                </td>
                                <td className="py-3 px-6">
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => item.ingredient && handleUpdateStock(item.ingredient._id, Number(e.target.value), item.lowStockThreshold)}
                                        className="w-24 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all disabled:opacity-50"
                                        min="0"
                                        disabled={!item.ingredient}
                                    />
                                </td>
                                <td className="py-3 px-6">{item.ingredient?.unit || 'N/A'}</td>
                                <td className="py-3 px-6">
                                    <input
                                        type="number"
                                        value={item.lowStockThreshold}
                                        onChange={(e) => item.ingredient && handleUpdateThreshold(item.ingredient._id, item.quantity, Number(e.target.value))}
                                        className="w-24 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all disabled:opacity-50"
                                        min="0"
                                        disabled={!item.ingredient}
                                    />
                                </td>
                                <td className="py-3 px-6">
                                    {item.quantity <= item.lowStockThreshold ? (
                                        <span className="bg-red-100 text-red-600 py-1 px-3 rounded-full text-xs font-semibold">
                                            Low Stock
                                        </span>
                                    ) : (
                                        <span className="bg-green-100 text-green-600 py-1 px-3 rounded-full text-xs font-semibold">
                                            In Stock
                                        </span>
                                    )}
                                </td>
                                <td className="py-3 px-6 text-right">
                                    <button
                                        onClick={() => item.ingredient && openTransactionHistory(item.ingredient._id, item.ingredient.name)}
                                        disabled={!item.ingredient}
                                        className="text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50 text-sm"
                                    >
                                        View History
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {paginatedInventory.length === 0 && inventory.length > 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-400">No matching items found for "{searchQuery}".</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
                {totalPages > 1 && (
                    <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50">
                        <span className="text-sm text-gray-500 font-medium">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredInventory.length)} of {filteredInventory.length} entries
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-white bg-transparent disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm transition-all focus:outline-none"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-white bg-transparent disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm transition-all focus:outline-none"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isTransactionModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-4xl shadow-2xl relative max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">
                                Activity Log: <span className="text-purple-600">{activeIngredientName}</span>
                            </h3>
                            <button onClick={() => setIsTransactionModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
                        </div>
                        
                        <div className="overflow-y-auto flex-1">
                            {modalTransactions.length === 0 ? (
                                <div className="bg-gray-50 text-gray-500 rounded-xl p-8 text-center italic border border-dashed border-gray-200">
                                    No transactions recorded yet for this item.
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs leading-normal sticky top-0">
                                        <tr>
                                            <th className="py-3 px-6">Date</th>
                                            <th className="py-3 px-6 text-xs whitespace-nowrap">Invoice / PO</th>
                                            <th className="py-3 px-6">Type</th>
                                            <th className="py-3 px-6 text-right">Quantity Change</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-gray-600 text-sm">
                                        {modalTransactions.map((txn) => {
                                            let badgeColor = 'bg-gray-100 text-gray-700';
                                            let prefix = '';
                                            if (txn.type === 'RECEIVE') { badgeColor = 'bg-blue-100 text-blue-700'; prefix = '+'; }
                                            if (txn.type === 'USAGE') { badgeColor = 'bg-orange-100 text-orange-700'; prefix = ''; }
                                            if (txn.type === 'PRODUCTION') { badgeColor = 'bg-emerald-100 text-emerald-700'; prefix = '+'; }
                                            if (txn.type === 'ADJUSTMENT') { badgeColor = 'bg-purple-100 text-purple-700'; prefix = txn.quantity > 0 ? '+' : ''; }

                                            return (
                                                <tr key={txn._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-6 whitespace-nowrap text-gray-500 text-xs text-left">
                                                        {new Date(txn.date || txn.createdAt || Date.now()).toLocaleString()}
                                                    </td>
                                                    <td className="py-3 px-6 font-mono text-xs text-gray-400 text-left">
                                                        {txn.invoiceNumber}
                                                        {txn.purchaseOrder && <span className="block mt-1 text-gray-400">PO: {txn.purchaseOrder}</span>}
                                                    </td>
                                                    <td className="py-3 px-6">
                                                        <span className={`py-1 px-3 rounded-full text-xs font-bold ${badgeColor}`}>
                                                            {txn.type}
                                                        </span>
                                                    </td>
                                                    <td className={`py-3 px-6 text-right font-bold ${txn.quantity > 0 && txn.type !== 'USAGE' ? 'text-green-600' : 'text-red-500'}`}>
                                                        {prefix}{txn.quantity} {txn.ingredient?.unit || ''}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isReceiveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-800">Receive Stock</h3>
                            <button onClick={() => setIsReceiveModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
                        </div>
                        <form onSubmit={handleReceiveStock} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient</label>
                                <select
                                    value={selectedIngredient}
                                    onChange={(e) => setSelectedIngredient(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    required
                                >
                                    <option value="">Select Ingredient</option>
                                    {ingredients.map(ing => (
                                        <option key={ing._id} value={ing._id}>{ing.name} ({ing.unit})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Add</label>
                                <input
                                    type="number"
                                    value={receiveQuantity}
                                    onChange={(e) => setReceiveQuantity(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    required
                                    min="0.01"
                                    step="any"
                                    placeholder="e.g. 10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                                <input
                                    type="text"
                                    value={invoiceNumber}
                                    onChange={(e) => setInvoiceNumber(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    placeholder="Optional"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Order (PO)</label>
                                <input
                                    type="text"
                                    value={purchaseOrder}
                                    onChange={(e) => setPurchaseOrder(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsReceiveModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                                >
                                    Confirm Receive
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
