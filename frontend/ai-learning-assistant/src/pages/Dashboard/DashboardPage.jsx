import React, {useState, useEffect} from 'react'
import Spinner from '../../components/common/Spinner';
import progressService from '../../services/progressService';
import toast from 'react-hot-toast';
import { FileText, BookOpen, BrainCircuit, TrendingUp, Clock} from 'lucide-react'; // Note: Fixed BrainCircuits to BrainCircuit


const DashboardPage =() =>{

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    

    useEffect( () => {
        const fetchDashboardData = async () => {
            try{
                const data = await progressService.getDashboardData();
                console.log("Data__getDashboardData", data);

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

    if( loading ) {
        return <Spinner/>
    }

    if (!dashboardData || !dashboardData.overview) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-8 bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 max-w-sm w-full">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 mb-4">
                        <TrendingUp className="w-8 h-8 text-slate-400"/>
                    </div>
                    <p className="text-slate-600 font-medium"> No dashboard data available.</p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Documents',
            value: dashboardData.overview.totalDocuments,
            icon: FileText,
            gradient: 'from-blue-400 to-cyan-500',
            shadowColor: 'shadow-blue-500/25'  
        },
        {
            label: 'Total Flashcards',
            value: dashboardData.overview.totalFlashcards,
            icon: BookOpen,
            gradient: 'from-purple-400 to-pink-500',
            shadowColor: 'shadow-purple-500/25'
        },
        {
            label: 'Total Quizzes',
            value: dashboardData.overview.totalQuizzes,
            icon: BrainCircuit,
            gradient: 'from-emerald-400 to-teal-500',
            shadowColor: 'shadow-emerald-500/25'
        },
    ];

    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Dashboard Overview</h1>
                <p className="text-slate-500 mt-1">Track your learning progress and recent activities.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 shadow-xl shadow-slate-200/50 flex items-center gap-5">
                        <div className={`shrink-0 w-14 h-14 rounded-2xl bg-linear-to-br ${stat.gradient} ${stat.shadowColor} shadow-lg flex items-center justify-center`}>
                            <stat.icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Placeholder for Recent Activity */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-xl font-semibold text-slate-900">Recent Progress</h2>
                </div>
                <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-400 text-sm italic">Activity charts and recent documents will appear here.</p>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage;