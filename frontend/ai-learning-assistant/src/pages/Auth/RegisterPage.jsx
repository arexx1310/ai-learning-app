import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
// Added Eye and EyeOff icons
import { BrainCircuit, Mail, Lock, ArrowRight, User, Eye, EyeOff } from 'lucide-react'; 
import { toast } from 'react-hot-toast';

const RegisterPage = () => {
    const [userName, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // New State
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusField] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }
        setError('');
        setLoading(true);
        try {
            await authService.register(userName, email, password);
            toast.success('Registration Successful! Please Login');
            navigate('/login');
        } catch (error) {
            setError(error.message || 'Failed to register. Please try again.');
            toast.error(error.message || 'Failed To register.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-slate-950">
        
            {/* The Glass Card - Matching Login Page exactly */}
            <div className="relative w-full max-w-lg bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] p-8 md:p-12 overflow-hidden">
                
                {/* Glossy Overlay Reflect */}
                <div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />

                <div className="relative z-10">
                    {/* Header - Styled with Emerald/Teal Gradient for Registration */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-xl shadow-emerald-500/20 rotate-3 hover:rotate-0 transition-transform duration-500">
                            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                                <BrainCircuit className="w-8 h-8 text-white" strokeWidth={1.5} />
                            </div>
                        </div>
                        <h1 className="mt-6 text-3xl font-bold bg-linear-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
                            Create Account
                        </h1>
                    </div>

                    {/* Form Elements */}
                    <div className="space-y-5">
                        {/* Username Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                            <div className="relative group">
                                <User className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-300 ${focusedField === 'username' ? 'text-emerald-400 scale-110' : 'text-slate-500'}`} />
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setFocusField('username')}
                                    onBlur={() => setFocusField(null)}
                                    placeholder="yourusername"
                                    className="w-full bg-slate-950/50 border border-white/10 text-white text-sm rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all shadow-inner placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative group">
                                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-300 ${focusedField === 'email' ? 'text-emerald-400 scale-110' : 'text-slate-500'}`} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusField('email')}
                                    onBlur={() => setFocusField(null)}
                                    placeholder="name@example.com"
                                    className="w-full bg-slate-950/50 border border-white/10 text-white text-sm rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all shadow-inner placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-300 ${focusedField === 'password' ? 'text-emerald-400 scale-110' : 'text-slate-500'}`} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusField('password')}
                                    onBlur={() => setFocusField(null)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950/50 border border-white/10 text-white text-sm rounded-2xl py-4 pl-12 pr-12 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all shadow-inner placeholder:text-slate-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 animate-shake">
                                <p className="text-xs text-rose-400 font-semibold text-center">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="group relative w-full h-14 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            
                            <div className="flex items-center justify-center gap-3">
                                {loading ? (
                                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="tracking-wide">Create Account</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </div>

                    <div className="mt-10 flex flex-col items-center gap-6">
                        <p className="text-sm text-slate-400 font-medium">
                            Already have an account?{' '}
                            <Link to='/login' className="text-emerald-400 hover:text-teal-400 font-bold decoration-2 underline underline-offset-4 transition-colors">
                                Sign In
                            </Link>
                        </p>

                        {/* Footer Copyright Section */}
                        <div className="w-full pt-6 border-t border-white/5 flex flex-col items-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
                                © {new Date().getFullYear()} ARCHI DANVA
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default RegisterPage;
