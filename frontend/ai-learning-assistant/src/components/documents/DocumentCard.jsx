import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, BookOpen, BrainCircuit, Clock, ChevronRight } from 'lucide-react';
import moment from 'moment';

const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete }) => {
    const navigate = useNavigate();

    return (
        <div 
            className="group relative bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-300 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 active:scale-[0.98] flex flex-col h-full"
            onClick={() => navigate(`/documents/${document._id}`)}
        >
            {/* Header: Icon & Delete */}
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <FileText size={24} strokeWidth={2} />
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(document); }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-100"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            {/* Title & Size */}
            <div className="grow">
                <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors" title={document.title}>
                    {document.title}
                </h3>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wider mb-4">
                    {formatFileSize(document.fileSize)}
                </span>

                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    {/* Flashcard Stat Box */}
                    <div className="flex items-center gap-2 p-2.5 bg-blue-50/50 border border-blue-100 rounded-xl group-hover:bg-blue-50 transition-colors">
                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                            <BookOpen size={14} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-blue-400 uppercase leading-none mb-1">Cards</span>
                            <span className="text-xs font-bold text-slate-700 leading-none">
                                {document.flashcardCount || 0}
                            </span>
                        </div>
                    </div>

                    {/* Quiz Stat Box */}
                    <div className="flex items-center gap-2 p-2.5 bg-purple-50/50 border border-purple-100 rounded-xl group-hover:bg-purple-50 transition-colors">
                        <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                            <BrainCircuit size={14} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-purple-400 uppercase leading-none mb-1">Quizzes</span>
                            <span className="text-xs font-bold text-slate-700 leading-none">
                                {document.quizCount || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">
                        Updated {moment(document.createdAt).fromNow()}
                    </span>
                </div>
                <div className="flex items-center gap-1 text-blue-600 font-bold text-xs transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                    Open <ChevronRight size={14} />
                </div>
            </div>
        </div>
    );
};

export default DocumentCard;