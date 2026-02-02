import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import quizService from '../../services/quizService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-hot-toast';
import { 
    ArrowLeft, 
    CheckCircle2, 
    XCircle, 
    Trophy, 
    Target, 
    BookOpen, 
    HelpCircle,
    Info,
    ChevronRight
} from 'lucide-react';

const QuizResultPage = () => {
    const { quizId } = useParams();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await quizService.getQuizResults(quizId);
                setResults(data);
            } catch (error) {
                toast.error('Failed to fetch quiz results.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchResults();
    }, [quizId]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;

    if (!results || !results.data) {
        return (
            <div className="max-w-4xl mx-auto p-6 text-center">
                <div className="bg-white rounded-2xl shadow-sm p-12 border border-slate-100">
                    <p className="text-slate-500 text-lg">Quiz results not found.</p>
                    <Link to="/dashboard" className="mt-4 text-blue-600 hover:underline inline-flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const { data: { quiz, results: detailedResults } } = results;
    const score = quiz.score;
    const totalQuestions = detailedResults.length;
    const correctAnswers = detailedResults.filter(r => r.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;

    const getScoreColor = (score) => {
        if (score >= 80) return 'from-emerald-500 to-teal-500';
        if (score >= 60) return 'from-amber-400 to-orange-500';
        return 'from-rose-500 to-red-600';
    }

    const getScoreMessage = (score) => {
        if (score >= 90) return 'Outstanding Performance! 🏆';
        if (score >= 80) return 'Great Job! 🌟';
        if (score >= 70) return 'Good Work! 👍';
        if (score >= 60) return 'Not Bad, keep it up! 💪';
        return 'Keep Practicing, you’ll get there! 📚';
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <div className="max-w-4xl mx-auto px-4 pt-6">
                {/* Navigation Header */}
                <div className="flex items-center justify-between mb-6">
                    <Link 
                        to={`/documents/${quiz.document?._id}`}
                        className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Document
                    </Link>
                </div>

                <PageHeader 
                    title={quiz.title || 'Quiz Results'} 
                    subtitle={`Completed on ${new Date(quiz.completedAt).toLocaleDateString()}`}
                />

                {/* Main Score Summary Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 mb-12">
                    <div className="p-8 md:p-12 text-center relative">
                        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
                            <div 
                                className={`h-full bg-gradient-to-r ${getScoreColor(score)} transition-all duration-1000`} 
                                style={{ width: `${score}%` }}
                            />
                        </div>

                        <div className="inline-flex p-4 rounded-full bg-slate-50 mb-6">
                            <Trophy className="w-12 h-12 text-amber-500" strokeWidth={1.5} />
                        </div>

                        <h2 className="text-slate-500 font-medium uppercase tracking-wider text-sm mb-2">Your Final Score</h2>
                        <div className={`text-7xl md:text-8xl font-black bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent mb-4`}>
                            {score}%
                        </div>
                        <p className="text-xl md:text-2xl font-semibold text-slate-800">
                            {getScoreMessage(score)}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 border-t border-slate-100">
                        <div className="p-6 flex items-center justify-center space-x-4 border-b md:border-b-0 md:border-r border-slate-100">
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><BookOpen size={24}/></div>
                            <div className="text-left">
                                <p className="text-sm text-slate-500">Total Questions</p>
                                <p className="text-xl font-bold text-slate-800">{totalQuestions}</p>
                            </div>
                        </div>
                        <div className="p-6 flex items-center justify-center space-x-4 border-b md:border-b-0 md:border-r border-slate-100">
                            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Target size={24}/></div>
                            <div className="text-left">
                                <p className="text-sm text-slate-500">Correct</p>
                                <p className="text-xl font-bold text-slate-800">{correctAnswers}</p>
                            </div>
                        </div>
                        <div className="p-6 flex items-center justify-center space-x-4">
                            <div className="p-3 bg-rose-50 rounded-xl text-rose-600"><XCircle size={24}/></div>
                            <div className="text-left">
                                <p className="text-sm text-slate-500">Incorrect</p>
                                <p className="text-xl font-bold text-slate-800">{incorrectAnswers}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Analysis Section */}
                <div className="space-y-8">
                    <div className="flex items-center space-x-2 mb-4">
                        <HelpCircle className="text-slate-400" />
                        <h3 className="text-xl font-bold text-slate-800">Question Analysis</h3>
                    </div>

                    {detailedResults.map((result, index) => (
                        <div 
                            key={index} 
                            className={`bg-white rounded-2xl border transition-all duration-300 ${
                                result.isCorrect ? 'border-emerald-100' : 'border-rose-100'
                            } shadow-sm overflow-hidden`}
                        >
                            {/* Question Header */}
                            <div className={`p-5 flex items-start justify-between ${
                                result.isCorrect ? 'bg-emerald-50/30' : 'bg-rose-50/30'
                            }`}>
                                <div className="flex space-x-4">
                                    <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                        result.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                                    }`}>
                                        {index + 1}
                                    </span>
                                    <h4 className="text-lg font-semibold text-slate-800 leading-tight">
                                        {result.question}
                                    </h4>
                                </div>
                                {result.isCorrect ? (
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
                                )}
                            </div>

                            {/* Options List */}
                            <div className="p-6 space-y-3">
                                {result.options.map((option, optIdx) => {
                                    const isSelected = result.selectedAnswer === option;
                                    const isCorrectOption = result.correctAnswer === option;
                                    
                                    let optionStyle = "border-slate-100 bg-slate-50/50 text-slate-600";
                                    if (isCorrectOption) optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-700 font-medium ring-1 ring-emerald-500";
                                    else if (isSelected && !isCorrectOption) optionStyle = "border-rose-500 bg-rose-50 text-rose-700 font-medium ring-1 ring-rose-500";

                                    return (
                                        <div 
                                            key={optIdx} 
                                            className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${optionStyle}`}
                                        >
                                            <span>{option}</span>
                                            {isCorrectOption && <CheckCircle2 size={18} className="text-emerald-600" />}
                                            {isSelected && !isCorrectOption && <XCircle size={18} className="text-rose-600" />}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* AI Explanation Box */}
                            {result.explanation && (
                                <div className="px-6 pb-6">
                                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex items-start space-x-3">
                                        <div className="bg-blue-100 p-1.5 rounded-lg">
                                            <Info className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Explanation</p>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                {result.explanation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

            
            </div>
        </div>
    );
};

export default QuizResultPage;