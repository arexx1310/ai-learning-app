import React from 'react';
import { Link } from 'react-router-dom';
import { Play, BarChart2, Trash2, Award } from 'lucide-react';
import moment from 'moment';

const QuizCard = ({ quiz, onDelete }) => {
    return (
        <div className="group relative bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1">
            {/* Improved Trash Button Animation */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(quiz);
                }}
                className="absolute top-4 right-4 p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 opacity-0 scale-90 translate-x-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 z-20"
            >
                <Trash2 className="w-4 h-4" strokeWidth={2} />
            </button>

            <div className="relative z-10 space-y-4">
                {/* Status Badge */}
                <div className="flex items-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100/50 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                        <Award className="w-3 h-3" strokeWidth={2.5} />
                        <span className="">Score: {quiz?.score}%</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <h3
                        className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors"
                        title={quiz.title}
                    >
                        {quiz.title ||
                            `Quiz - ${moment(quiz.createdAt).format("MMM D, YYYY")}`}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                        Created {moment(quiz.createdAt).format("MMM D, YYYY")}
                    </p>
                </div>

                {/* Quiz Info */}
                <div className="flex items-center">
                    <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                        <span className="text-xs font-bold text-slate-500">
                            {quiz.questions.length}{" "}
                            {quiz.questions.length === 1 ? "Question" : "Questions"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 relative z-10">
                {quiz?.userAnswers?.length > 0 ? (
                    <Link to={`/quizzes/${quiz._id}/results`} className="block">
                        <button className="w-full inline-flex items-center justify-center gap-2 h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl transition-all active:scale-95 shadow-lg shadow-slate-200">
                            <BarChart2 className="w-4 h-4" strokeWidth={2.5} />
                            View Results
                        </button>
                    </Link>
                ) : (
                    <Link to={`/quizzes/${quiz._id}`} className="block">
                        <button className="group/btn relative w-full inline-flex items-center justify-center gap-2 h-11 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-500/25 overflow-hidden">
                            <span className="flex items-center gap-2 relative z-10">
                                <Play className="w-4 h-4 fill-current" strokeWidth={2.5} />
                                Start Quiz
                            </span>
                            {/* Animated Shine Effect */}
                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] transition-transform" />
                        </button>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default QuizCard;