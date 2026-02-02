import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import moment from 'moment';

const FlashcardSetCard = ({ flashcardSet }) => {
  const navigate = useNavigate();

  const handleStudyNow = () => {
    navigate(`/documents/${flashcardSet.documentId._id}/flashcards`);
  };

  const reviewedCount = flashcardSet.cards.filter(card => card.lastReviewed).length;
  const totalCards = flashcardSet.cards.length;
  const progressPercentage = totalCards > 0 ? Math.round((reviewedCount / totalCards) * 100) : 0;
  const isCompleted = progressPercentage === 100;

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5">
      
      {/* Top Section: Icon & Date */}
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl transition-colors duration-300 ${isCompleted ? 'bg-green-50' : 'bg-indigo-50'}`}>
          <BookOpen className={`w-6 h-6 ${isCompleted ? 'text-green-600' : 'text-indigo-600'}`} />
        </div>
        <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
          {moment(flashcardSet.createdAt).fromNow()}
        </span>
      </div>

      {/* Title & Info */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-800 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">
          {flashcardSet?.documentId?.title || "Untitled Set"}
        </h3>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold">{totalCards} Cards</span>
          </div>
          
          {reviewedCount > 0 && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {isCompleted ? <CheckCircle2 className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {progressPercentage}%
            </div>
          )}
        </div>
      </div>

      {/* Progress Section */}
      {totalCards > 0 && (
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 font-medium italic">Mastery</span>
            <span className="text-gray-700 font-bold">{reviewedCount}/{totalCards}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-500 to-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleStudyNow();
        }}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.98] shadow-sm
          ${isCompleted 
            ? 'bg-white border-2 border-green-500 text-green-600 hover:bg-green-50' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 shadow-md'
          }`}
      >
        <BookOpen className="w-4 h-4" />
        {isCompleted ? 'Review Again' : 'Study Now'}
      </button>
    </div>
  );
};

export default FlashcardSetCard;