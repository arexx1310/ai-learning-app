import React, {useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import quizService from '../../services/quizService';
import aiService from '../../services/aiService';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import Modal from '../common/Modal';
import QuizCard from './QuizCard';
import EmptyState from '../common/EmptyState';

const QuizManager = ({documentId}) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [numQuestions, setNumQuestions] = useState(5);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting]  = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const data = await quizService.getQuizzesforDocument(documentId);
            setQuizzes(data.data);
        } catch (error) {
            toast.error('Failed to fetch quizzes.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchQuizzes();
        }
    }, [documentId]);

    const handleGenerateQuiz = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            await aiService.generateQuiz(documentId, { numQuestions });
            toast.success('Quiz generated successfully!');
            setIsGenerateModalOpen(false);
            fetchQuizzes();
        } catch (error){
            toast.error(error.message || 'Failed to generate quiz.');
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteRequest = (quiz) => {
        setSelectedQuiz(quiz);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
    if (!selectedQuiz) return;
    setDeleting(true);
    try {
        await quizService.deleteQuiz(selectedQuiz._id);
        toast.success(`'${selectedQuiz.title || 'Quiz'} deleted`);
        setIsDeleteModalOpen(false);
        setSelectedQuiz(null);
        setQuizzes(quizzes.filter(q => q._id !== selectedQuiz._id));
    } catch (error) {
        toast.error(error.message || 'Failed to delete quiz');
    } finally {
        setDeleting(false);
    }
};

const renderQuizContent = () => {
    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Spinner />
            </div>
        );
    }

    if (quizzes.length === 0) {
        return (
            <EmptyState
                title="No Quizzes Yet"
                description="Generate a quiz from your document to test your knowledge."
                buttonText="Generate First Quiz"
                onActionClick={() => setIsGenerateModalOpen(true)}
            />
        );
    }
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
                <QuizCard key={quiz._id} quiz={quiz} onDelete={handleDeleteRequest} />
            ))}
        </div>
    );
};

return (
    <div className="bg-slate-50/50 rounded-4xl border border-slate-200/60 p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Study Quizzes</h2>
                <p className="text-slate-500 text-sm font-medium">Test your retention with AI-generated questions.</p>
            </div>
            <Button 
                onClick={() => setIsGenerateModalOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-6 py-2.5 flex items-center gap-2 shadow-lg shadow-slate-200 transition-all active:scale-95"
            >
                <Plus size={18} strokeWidth={2.5} />
                Generate Quiz
            </Button>
        </div>

        {renderQuizContent()}

        {/* Generate Quiz */}
        <Modal 
            isOpen={isGenerateModalOpen}
            onClose={() => setIsGenerateModalOpen(false)}
            title="Generate New Quiz"
        >
            <form onSubmit={handleGenerateQuiz} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                        Number of Questions
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            max="50"
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-slate-900 font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                            placeholder="Enter amount (e.g. 5)"
                        />
                        
                    </div>
                    <p className="text-[11px] text-slate-400 ml-1">
                        AI will scan your document to create unique questions.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <Button 
                        type="button"
                        variant="secondary"
                        onClick={() => setIsGenerateModalOpen(false)}
                        disabled={generating}
                        className="px-6 h-11 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={generating}
                        className="relative overflow-hidden px-8 h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {generating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                'Generate Quiz'
                            )}
                        </span>
                    </Button>
                </div>
            </form>
        </Modal>

        {/* Delete Confirmation */}
        <Modal 
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Confirm Delete Quiz"
        >
            <div className="p-6">
                <p className="text-gray-600 leading-relaxed">
                    Are you sure you want to delete the quiz: <span className="font-bold text-gray-900 italic">"{selectedQuiz?.title || 'this quiz'}"</span>? This action cannot be undone.
                </p>
                
                <div className="mt-8 flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline" 
                        onClick={() => setIsDeleteModalOpen(false)}
                        disabled={deleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger" 
                        onClick={handleConfirmDelete}
                        disabled={deleting}
                    >
                        {deleting ? 'Deleting...' : 'Delete Quiz'}
                    </Button>
                </div>
            </div>
        </Modal>
    </div>
    );
}

export default QuizManager;