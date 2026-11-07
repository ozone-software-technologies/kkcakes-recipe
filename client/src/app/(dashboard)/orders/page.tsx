'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api';

interface Recipe {
    _id: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
}

interface OrderItem {
    recipe: Recipe | string;
    quantity: number;
    price: number;
}

import { useAuth } from '@/context/AuthContext';
import PrintOrderModal, { Order } from '@/components/PrintOrderModal';

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);

    // New Order State
    const [customerName, setCustomerName] = useState('');
    const [orderItems, setOrderItems] = useState<{ recipeId: string; quantity: number }[]>([]);
    const [orderError, setOrderError] = useState('');

    const fetchOrders = async () => {
        try {
            const data = await apiRequest('/orders');
            setOrders(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchRecipes = async () => {
        try {
            const data = await apiRequest('/recipes');
            setRecipes(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchOrders();
            fetchRecipes();
        }
    }, [user, authLoading]);

    const openModal = () => {
        setCustomerName('');
        setOrderItems([]);
        setOrderError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setOrderError('');
        setIsModalOpen(false);
    };

    const handleAddItem = () => {
        setOrderItems([...orderItems, { recipeId: '', quantity: 1 }]);
    };

    const handleItemChange = (index: number, field: 'recipeId' | 'quantity', value: string | number) => {
        const newItems = [...orderItems];
        // @ts-ignore
        newItems[index][field] = value;
        setOrderItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...orderItems];
        newItems.splice(index, 1);
        setOrderItems(newItems);
    };

    const calculateTotal = () => {
        return orderItems.reduce((total, item) => {
            const recipe = recipes.find(r => r._id === item.recipeId);
            return total + (recipe ? recipe.price * item.quantity : 0);
        }, 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setOrderError('');
        if (orderItems.length === 0) {
            setOrderError('Please add at least one item to the order.');
            return;
        }
        const itemsPayload = orderItems.map(item => {
            const recipe = recipes.find(r => r._id === item.recipeId);
            return {
                recipe: item.recipeId,
                quantity: item.quantity,
                price: recipe?.price || 0
            };
        });

        try {
            await apiRequest('/orders', {
                method: 'POST',
                body: JSON.stringify({
                    customerName,
                    items: itemsPayload,
                    totalAmount: calculateTotal()
                }),
            });
            closeModal();
            fetchOrders();
        } catch (error: any) {
            console.error(error);
            setOrderError(error.message || 'Failed to place order.');
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await apiRequest(`/orders/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
            fetchOrders();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Orders
                </h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSelectedOrderForPrint({
                            _id: '',
                            customerName: '',
                            items: [],
                            totalAmount: 0,
                            status: 'Pending',
                            createdAt: new Date().toISOString(),
                            orderName: '',
                        })}
                        className="bg-pink-50 hover:bg-pink-100 text-[#7B2439] border border-[#F2B8C4] px-4 py-2 rounded-lg font-semibold text-sm transition-transform transform hover:scale-105 flex items-center gap-2 shadow-sm"
                    >
                        <span>📄</span>
                        <span>Blank Order Form (A4)</span>
                    </button>
                    <button
                        onClick={openModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg transition-transform transform hover:scale-105 text-sm font-semibold"
                    >
                        New Order
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order._id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-800">{order.customerName}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm mb-2">{new Date(order.createdAt).toLocaleString()}</p>
                            <div className="text-sm text-gray-600">
                                {order.items.map((item, idx) => (
                                    <span key={idx} className="block">
                                        {(item.recipe as Recipe)?.name || 'Unknown Recipe'} x {item.quantity} (${item.price * item.quantity})
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-col md:items-end gap-3">
                            <p className="text-2xl font-bold text-gray-900">${order.totalAmount}</p>
                            <div className="flex flex-wrap gap-2 justify-end">
                                <button
                                    onClick={() => setSelectedOrderForPrint(order)}
                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1.5 shadow-sm"
                                >
                                    <span>🖨️</span>
                                    <span>Print Order (A4)</span>
                                </button>
                                {order.status === 'Pending' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, 'Completed')}
                                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 shadow-sm"
                                        >
                                            Complete
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                                            className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 shadow-sm"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {orders.length === 0 && (
                    <div className="text-center py-10 text-gray-500">No orders yet.</div>
                )}
            </div>

            {selectedOrderForPrint && (
                <PrintOrderModal
                    order={selectedOrderForPrint}
                    onClose={() => setSelectedOrderForPrint(null)}
                    onOrderUpdated={fetchOrders}
                />
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl my-8 relative">
                        <h3 className="text-2xl font-bold mb-6 text-gray-800">New Order</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Items</label>
                                    <button type="button" onClick={handleAddItem} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200">
                                        + Add Item
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {orderItems.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <select
                                                value={item.recipeId}
                                                onChange={(e) => handleItemChange(idx, 'recipeId', e.target.value)}
                                                className="flex-1 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                                                required
                                            >
                                                <option value="">Select Cake</option>
                                                {recipes.map(r => (
                                                    <option key={r._id} value={r._id}>{r.name} - ${r.price}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                                                className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm"
                                                placeholder="Qty"
                                                required
                                                min="1"
                                            />
                                            <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-700">
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="text-right text-xl font-bold text-gray-800 border-t pt-4">
                                Total: ${calculateTotal()}
                            </div>

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
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                                >
                                    Place Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
