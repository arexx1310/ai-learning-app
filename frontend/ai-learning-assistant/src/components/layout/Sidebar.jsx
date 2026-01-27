import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FileText, User, LogOut, BrainCircuit, BookOpen, X, LayoutDashboard } from 'lucide-react';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navLinks = [
        { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
        { to: '/documents', icon: FileText, text: 'Documents' },
        { to: '/flashcards', icon: BookOpen, text: 'Flashcards' },
        { to: '/profile', icon: User, text: 'Profile' },
    ];

    return (
        <>
            {/* Mobile Overlay - Improved backdrop blur */}
            <div className={`fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 md:hidden transition-all duration-500 ${
                isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
                onClick={toggleSidebar}
                aria-hidden="true"
            ></div>

            <aside
                className={`fixed top-0 left-0 h-[100dvh] w-72 bg-white border-r border-slate-200 z-50 flex flex-col md:sticky md:translate-x-0 transition-all duration-300 ease-in-out ${
                    isSidebarOpen 
                    ? 'translate-x-0 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.1)]' 
                    : '-translate-x-full md:translate-x-0'
                }`}
            >
                {/* Logo Section - Refined branding */}
                <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-emerald-400 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <BrainCircuit className="text-white" size={24} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">
                                AI Learn
                            </h1>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em]">Assistant</span>
                        </div>
                    </div>
                    <button onClick={toggleSidebar} className="p-2 rounded-xl bg-slate-50 text-slate-500 md:hidden hover:bg-slate-100">
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Navigation - Better spacing and hover states */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
                            className={({ isActive }) =>
                                `group relative flex items-center gap-3.5 px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 overflow-hidden ${
                                    isActive
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Active Indicator Bar */}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-500 rounded-r-full animate-in slide-in-from-left duration-300"></div>
                                    )}
                                    
                                    <link.icon
                                        size={22}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={`transition-all duration-300 ${
                                            isActive 
                                            ? 'text-emerald-600 scale-110' 
                                            : 'text-slate-400 group-hover:text-slate-900 group-hover:scale-110'
                                        }`}
                                    />
                                    <span className="tracking-tight">{link.text}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout Section - Distinctive bottom area */}
                <div className="p-6 mt-auto">
                    <div className="bg-slate-50 rounded-3xl p-2">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-bold text-slate-500 hover:bg-white hover:text-red-600 hover:shadow-sm rounded-2xl transition-all duration-300 group"
                        >
                            <div className="p-2 rounded-lg bg-white group-hover:bg-red-50 transition-colors">
                                <LogOut
                                    size={18}
                                    strokeWidth={2.5}
                                    className="text-slate-400 group-hover:text-red-600 transition-all"
                                />
                            </div>
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;