import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    CheckCircle2, 
    XCircle, 
    RotateCcw, 
    FileText, 
    Trophy, 
    ChevronRight,
    Info
} from 'lucide-react';

import quizService from '../../services/quizService';
import Spinner from '../../components/common/Spinner';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';

const QuizResultPage = () => {
    const { quizId} = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resultData, setResultData] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const response = await quizService.getQuizResults(quizId);
                setResultData(response.data);
            } catch (err) {
                setError(err.message || 'Failed to load results');
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [quizId]); 

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
    
    if (error) return (
        <div className="max-w-2xl mx-auto mt-20 text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Oops!</h2>
            <p className="text-slate-500 mt-2 mb-6">{error}</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
    );

    const { quiz, results } = resultData;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <PageHeader 
                title="Quiz Analysis" 
                subtitle={`Performance for: ${quiz.title}`}
            >
                <Button variant="outline" size="sm" onClick={() => navigate(`/documents/${quiz.document._id}`)}>
                    <FileText className="w-4 h-4" />
                    Back to Document
                </Button>
            </PageHeader>

            {/* Score Summary Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Trophy size={160} />
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative">
                        {/* Circular Progress (Simplified SVG) */}
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                strokeDasharray={364.4}
                                strokeDashoffset={364.4 - (364.4 * quiz.score) / 100}
                                className="text-emerald-500 transition-all duration-1000 ease-out" 
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-slate-900">{quiz.score}%</span>
                        </div>
                    </div>

                    <div className="text-center md:text-left flex-1">
                        <h2 className="text-2xl font-bold text-slate-800">
                            {quiz.score >= 70 ? 'Excellent Work!' : quiz.score >= 40 ? 'Good Effort!' : 'Keep Practicing!'}
                        </h2>
                        <p className="text-slate-500 mt-1">
                            You answered <span className="font-bold text-slate-700">{quiz.score / 100 * quiz.totalQuestions}</span> out of <span className="font-bold text-slate-700">{quiz.totalQuestions}</span> questions correctly.
                        </p>
                        <div className="flex flex-wrap gap-4 mt-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold">
                                <CheckCircle2 className="w-4 h-4" /> Correct
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-bold">
                                <RotateCcw className="w-4 h-4" /> Reviewed
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Questions List */}
            <div className="space-y-6">
                {results.map((item, idx) => (
                    <div 
                        key={idx} 
                        className={`group bg-white rounded-2xl border-2 transition-all duration-200 ${
                            item.isCorrect ? 'border-emerald-100' : 'border-red-100'
                        }`}
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Question {idx + 1}
                                    </span>
                                    <p className="text-lg font-bold text-slate-800 leading-snug">
                                        {item.question}
                                    </p>
                                </div>
                                {item.isCorrect ? (
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                                ) : (
                                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                {item.options.map((option, optIdx) => {
                                    const isUserChoice = option === item.selectedAnswer;
                                    const isCorrectChoice = option === item.correctAnswer;

                                    // Styling Logic
                                    let variantClasses = "bg-slate-50 text-slate-600 border-slate-200";
                                    
                                    if (isCorrectChoice) {
                                        // Correct answer is always Green
                                        variantClasses = "bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20";
                                    } else if (isUserChoice) {
                                        // User picked this and it's NOT correct (handled by 'else if'), so Red
                                        variantClasses = "bg-red-500 text-white border-red-600 shadow-md animate-shake";
                                    }

                                    return (
                                        <div 
                                            key={optIdx} 
                                            className={`relative px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all duration-300 flex items-center justify-between ${variantClasses}`}
                                        >
                                            <span>{option}</span>
                                            
                                            <div className="flex gap-2">
                                                {isCorrectChoice && (
                                                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-lg uppercase whitespace-nowrap">
                                                        Correct Answer
                                                    </span>
                                                )}
                                                {(isUserChoice && !isCorrectChoice) && (
                                                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-lg uppercase whitespace-nowrap">
                                                        Your Choice
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Explanation Box */}
                            <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
                                <Info className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tight mb-1">Explanation</p>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {item.explanation || "No explanation provided for this question."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 flex justify-center">
                <Button size="md" className="min-w-[200px]" onClick={() => navigate(`/documents/${quiz.document._id}`)}>
                    Finish Review
                </Button>
            </div>
        </div>
    );
};

export default QuizResultPage;