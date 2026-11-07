'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Dashboard', href: '/' }, // Redirects to /dashboard implicitly or explicitly
        { name: 'Ingredients', href: '/ingredients' },
        { name: 'Recipes', href: '/recipes' },
        { name: 'Inventory', href: '/inventory' },
        { name: 'Production', href: '/production' },
        { name: 'Orders', href: '/orders' },
        { name: 'Users', href: '/users' },
    ];

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
            <div className="mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    KKCakes
                </h1>
            </div>
            <nav className="space-y-2 flex-grow">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`block px-4 py-3 rounded-lg transition-all ${isActive
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="mt-auto pt-4 border-t border-gray-800">
                <button className="w-full text-left px-4 py-2 text-gray-400 hover:text-white text-sm" onClick={() => auth.signOut()}>
                    Logout
                </button>
            </div>
        </div>
    );
}

import { auth } from '@/lib/firebase';
