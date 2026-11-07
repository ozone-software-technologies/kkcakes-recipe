'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api';

import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [data, setData] = useState<{
        todaysOrderCount: number;
        totalRevenueToday: number;
        lowStockItems: number;
    } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await apiRequest('/dashboard');
                setData(result);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        if (!authLoading && user) {
            fetchData();
        }
    }, [user, authLoading]);

    return (
        <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-8">
                Today's Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Today Orders Widget */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Orders Today</h3>
                        <span className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            📦
                        </span>
                    </div>
                    <p className="text-4xl font-bold text-gray-900 mb-2">
                        {data ? data.todaysOrderCount : '...'}
                    </p>
                    <p className="text-sm text-gray-500">
                        Revenue: <span className="text-green-600 font-medium">${data ? data.totalRevenueToday.toLocaleString() : '...'}</span>
                    </p>
                </div>

                {/* Inventory Widget */}
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-red-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Stock Alerts</h3>
                        <span className="p-2 bg-red-100 text-red-600 rounded-lg">
                            ⚠️
                        </span>
                    </div>
                    <p className="text-4xl font-bold text-gray-900 mb-2">
                        {data ? data.lowStockItems : '...'}
                    </p>
                    <p className="text-sm text-gray-500">
                        Items Low on Stock
                    </p>
                </div>
            </div>
        </div>
    );
}
