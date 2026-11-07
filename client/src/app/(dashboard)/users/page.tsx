'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api';

interface User {
    _id: string;
    email: string;
    role: string;
    createdAt: string;
}

import { useAuth } from '@/context/AuthContext';

export default function UsersPage() {
    const { user, loading: authLoading } = useAuth();
    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = async () => {
        try {
            const data = await apiRequest('/users');
            setUsers(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!authLoading && user) {
            fetchUsers();
        }
    }, [user, authLoading]);

    return (
        <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent mb-8">
                Users
            </h2>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
                        <tr>
                            <th className="py-3 px-6">Email</th>
                            <th className="py-3 px-6">Role</th>
                            <th className="py-3 px-6">Joined Date</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                        {users.map((user) => (
                            <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-6 font-medium">{user.email}</td>
                                <td className="py-3 px-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'Admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-3 px-6">{new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-gray-400">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
