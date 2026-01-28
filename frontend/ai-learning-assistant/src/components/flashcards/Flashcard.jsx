import React, { useState } from 'react';
import { Star, RotateCcw, Sparkles } from "lucide-react";

const Flashcard = ({ flashcard, onToggleStar }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="w-full h-[450px] max-w-2xl cursor-pointer group relative" style={{ perspective: '2000px' }}>
            {/* Background Ambient Glow */}
            <div className="absolute -inset-1 bg-linear-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-[34px] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>

            <div
                className="relative w-full h-full transition-all duration-700 transform-gpu"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
                onClick={handleFlip}
            >
                {/* Front Face (Question) */}
                <div
                    className="absolute inset-0 w-full h-full bg-white/90 backdrop-blur-xl border border-white/50 rounded-[32px] p-10 flex flex-col justify-between shadow-2xl overflow-hidden"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                    }}
                >
                    {/* Decorative Gradient Blob */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-100/50 rounded-full blur-3xl"></div>

                    <div className="flex items-center justify-between relative z-10">
                        <div className='flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-[11px] font-black text-emerald-600 rounded-full px-4 py-1.5 uppercase tracking-widest'>
                            <Sparkles className="w-3 h-3" />
                            {flashcard?.difficulty || 'AI Generated'}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleStar(flashcard._id);
                            }}
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 transform active:scale-90 ${
                                flashcard.isStarred
                                    ? 'bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-500/30'
                                    : 'bg-slate-50 text-slate-300 hover:text-amber-500 hover:bg-white hover:shadow-md'
                            }`}
                        >
                            <Star
                                className="w-5 h-5"
                                strokeWidth={2.5}
                                fill={flashcard.isStarred ? 'currentColor' : 'none'}
                            />
                        </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center py-8 relative z-10">
                        <p className="text-2xl font-bold bg-linear-to-br from-slate-900 via-slate-700 to-slate-800 bg-clip-text text-transparent leading-tight text-center">
                            {flashcard.question}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 text-emerald-500/80 text-sm font-bold tracking-wide py-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/30">
                        <RotateCcw className="w-4 h-4" strokeWidth={2.5} />
                        <span>CLICK TO REVEAL</span>
                    </div>
                </div>

                {/* Back Face (Answer) */}
                <div
                    className="absolute inset-0 w-full h-full bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-[32px] p-10 flex flex-col justify-between shadow-2xl border border-white/20"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    {/* Inner Glow Effect */}
                    <div className="absolute top-0 left-0 w-full h-2/3 bg-radial-gradient from-white/20 to-transparent pointer-events-none"></div>

                    <div className="flex justify-between items-center relative z-10">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
                            AI Insight
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleStar(flashcard._id);
                            }}
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                                flashcard.isStarred
                                    ? 'bg-white text-emerald-600 shadow-xl'
                                    : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white border border-white/10'
                            }`}
                        >
                            <Star
                                className="w-5 h-5"
                                strokeWidth={2.5}
                                fill={flashcard.isStarred ? 'currentColor' : 'none'}
                            />
                        </button>
                    </div>

                    <div className="flex-1 flex items-center justify-center py-8 relative z-10">
                        <p className="text-2xl font-medium text-white leading-relaxed text-center drop-shadow-sm">
                            {flashcard.answer}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-emerald-100/60 text-sm font-semibold relative z-10">
                        <RotateCcw className="w-4 h-4" />
                        <span>Click to flip back</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Flashcard;