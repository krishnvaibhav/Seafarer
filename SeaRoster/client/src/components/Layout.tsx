// c:\Users\krish\.gemini\antigravity\scratch\Seafarer\SeaRoster\client\src\components\Layout.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
            {/* Header */}
            <header className="bg-slate-800 text-white shadow-lg">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <span className="text-xl font-bold tracking-tight">⚓ SeaRoster</span>
                        <nav className="hidden md:flex space-x-4 text-sm font-medium">
                            <Link to="/" className="hover:text-sky-400">Dashboard</Link>
                            <Link to="/reports" className="hover:text-sky-400">Reports</Link>
                            <Link to="/settings" className="hover:text-sky-400">Settings</Link>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-xs bg-emerald-600 px-2 py-1 rounded-full text-white">Online</span>
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold">JD</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                {children}
            </main>
        </div>
    );
};

export default Layout;
