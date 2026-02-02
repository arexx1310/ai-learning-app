import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import PageHeader from '../../components/common/PageHeader'; 
import progressService from '../../services/progressService';
import toast from 'react-hot-toast';
import { FileText, BookOpen, BrainCircuit, TrendingUp, Clock, ChevronRight } from 'lucide-react';

const DashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const data = await progressService.getDashboardData();
                setDashboardData(data.data);
            } catch (error) {
                toast.error('Failed to fetch dashboard data.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

  
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Spinner className="w-12 h-12 border-blue-600" />
                <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading overview...</p>
            </div>
        );
    }

    // 2. Consistent Empty State
    if (!dashboardData || !dashboardData.overview) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <div className="fixed inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
                <div className="relative z-10 container mx-auto px-4 py-12 flex justify-center">
                    <div className="text-center p-10 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md w-full">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 mb-6 border border-slate-100">
                            <TrendingUp className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Data Available</h3>
                        <p className="text-slate-500">Start using the app to track your progress.</p>
                    </div>
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Documents',
            value: dashboardData.overview.totalDocuments,
            icon: FileText,
            bg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            border: 'group-hover:border-blue-200'
        },
        {
            label: 'Total Flashcards',
            value: dashboardData.overview.totalFlashcards,
            icon: BookOpen,
            bg: 'bg-purple-50',
            iconColor: 'text-purple-600',
            border: 'group-hover:border-purple-200'
        },
        {
            label: 'Total Quizzes',
            value: dashboardData.overview.totalQuizzes,
            icon: BrainCircuit,
            bg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            border: 'group-hover:border-emerald-200'
        },
    ];

    const combinedActivity = [
        ...(dashboardData.recentActivity?.documents || []).map(doc => ({
            id: doc._id,
            description: doc.title,
            timestamp: doc.lastAccessed,
            link: `/documents/${doc._id}`,
            type: 'document'
        })),
        ...(dashboardData.recentActivity?.quizzes || []).map(quiz => ({
            id: quiz._id,
            description: quiz.title,
            timestamp: quiz.completedAt,
            link: `/quizzes/${quiz._id}`,
            type: 'quiz'
        }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
           
            <div className="fixed inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                
               
                <div className="mb-10">
                    <PageHeader 
                        title="Dashboard Overview" 
                        subtitle="Track your learning progress and recent activities"
                    />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center gap-5">
                                <div className={`shrink-0 w-16 h-16 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                                    <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-4xl font-black text-slate-900 mt-1">{stat.value}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Activity Section */}
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-600">
                            <Clock className="w-5 h-5" strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">
                            Recent Activity
                        </h3>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        {combinedActivity.length > 0 ? (
                            <div className="divide-y divide-slate-100">
                                {combinedActivity.map((activity, index) => (
                                    <div
                                        key={`${activity.type}-${activity.id}-${index}`}
                                        className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Status Dot */}
                                            <div className={`mt-2 w-3 h-3 rounded-full shrink-0 ${
                                                activity.type === 'document'
                                                    ? 'bg-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.15)]'
                                                    : 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]'
                                            }`} />
                                            
                                            <div>
                                                <p className="text-slate-900 font-bold text-base line-clamp-1">
                                                    {activity.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 text-sm text-slate-500 font-medium">
                                                    <span className="capitalize">
                                                        {activity.type === 'document' ? 'Accessed Document' : 'Attempted Quiz'}
                                                    </span>
                                                    <span className="text-slate-300">•</span>
                                                    <span>
                                                        {new Date(activity.timestamp).toLocaleDateString(undefined, { 
                                                            month: 'short', 
                                                            day: 'numeric', 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {activity.link && (
                                            <Link
                                                to={activity.link}
                                                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-200 transition-all group-hover:translate-x-1"
                                            >
                                                View
                                                <ChevronRight className="w-4 h-4 ml-1" strokeWidth={2.5} />
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900">No recent activity</h4>
                                <p className="text-slate-500 mt-1">Your recent learning actions will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;