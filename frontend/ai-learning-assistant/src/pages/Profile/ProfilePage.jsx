import React, { useState, useEffect } from 'react';
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import authService from "../../services/authService";
import toast from "react-hot-toast";
import { User, Mail, Lock, Camera } from "lucide-react";

const ProfilePage = () => {
    const [loading, setLoading] = useState(true);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [profileImage, setProfileImage] = useState("");
    
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const result = await authService.getProfile();
                const userData = result.data; 
                
                setUsername(userData.username);
                setEmail(userData.email);
                setProfileImage(userData.profileImage);
            } catch (error) {
                toast.error(error.error || "Failed to fetch profile data.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            toast.error("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long.");
            return;
        }

        setPasswordLoading(true);
        try {
            await authService.changePassword({ currentPassword, newPassword });
            toast.success("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (error) {
            // Fixed: backend uses 'error' key for messages
            toast.error(error.error || "Failed to change password.");
        } finally {
            setPasswordLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Spinner/>
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Background Decor */}
            <div className="fixed inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="mb-10">
                    <PageHeader 
                        title="Profile Settings" 
                    />
                </div>

                <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* User Information Display */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center gap-8 mb-8 pb-8 border-b border-slate-100">
                            <div className="relative group">
                                <div className="w-28 h-28 rounded-3xl bg-emerald-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg shadow-emerald-100">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-emerald-400" />
                                    )}
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-2.5 bg-white rounded-xl shadow-md border border-slate-100 text-slate-400 hover:text-emerald-500 hover:scale-110 transition-all duration-200 cursor-pointer">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-center md:text-left space-y-1">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{username}</h3>
                                <p className="text-slate-500 font-medium">{email}</p>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 mt-2">
                                    Active Member
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
                                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <User className="w-5 h-5 text-slate-400" />
                                    <p className="text-slate-700 font-medium">{username}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                    <p className="text-slate-700 font-medium">{email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Lock className="w-5 h-5 text-emerald-600" />
                            </div>
                            Security Settings
                        </h3>
                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Current Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white outline-none transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white outline-none transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            type="password"
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            required
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white outline-none transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button 
                                    type="submit" 
                                    disabled={passwordLoading}
                                    className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                                >
                                    {passwordLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Spinner className="w-4 h-4 border-white" /> Updating...
                                        </span>
                                    ) : "Update Password"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;