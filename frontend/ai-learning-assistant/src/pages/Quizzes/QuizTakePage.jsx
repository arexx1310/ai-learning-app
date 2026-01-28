import React, {useState, useEffect} from 'react'
import { useParams, useNavigate} from 'react-router-dom';
import {ChevronLeft, ChevronRight, CheckCircle, CheckCircle2} from 'lucide-react';
import quizService from '../../services/quizService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';

const QuizTakePage =() =>{
    const {quizId} = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading]  = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await quizService.getQuizById(quizId);
                setQuiz(response.data);
            } catch (error){
                toast.error("Failed to fetch quiz");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [quizId]);

    const handleOptionsChange = (questionId, optionIndex) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]:  optionIndex,

        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length-1) {
            setCurrentQuestionIndex((prev) => prev+1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev -1);
        }
    };

    const handleSubmitQuiz = async () => {
        setSubmitting(true);
        try {
            const formattedAnswers = Object.keys(selectedAnswers).map(questionId => {
                const questions = quiz.questions.find(q => q._id === questionId);
                const questionIndex = quiz.questions.findIndex( q => q._id === questionId);
                const optionIndex = selectedAnswers[questionId];
                const selectedAnswer = questions.options[optionIndex];
                return {questionIndex, selectedAnswer};
            });
            await quizService.submitQuiz(quizId, formattedAnswers);
            toast.success('Quiz submitted successfully');
            navigate(`/quizzes/${quizId}/results`);
        } catch (error) {
            toast.error(error.message || 'Failed to submit quiz.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Spinner />
            </div>
        );
    }

    if (!quiz || quiz.questions.length === 0 ){
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <p className="text-slate-600 text-lg">Quiz not found or has no questions.</p>
                    <Button className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isAnswered = selectedAnswers.hasOwnProperty(currentQuestion._id);
    const answeredCount = Object.keys(selectedAnswers).length;


    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <PageHeader 
                title={quiz.title || 'Take Quiz'} 
                subtitle={quiz.documentId?.title ? `Based on: ${quiz.documentId.title}` : ''}
            />

            {/* Progress Bar Section */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </span>
                    <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                        {answeredCount} answered
                    </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                        className="h-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                        style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Main Question Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-6 sm:p-8">
                    {/* Question Badge */}
                    <div className="mb-6">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-widest shadow-sm">
                            Question {currentQuestionIndex + 1}
                        </span>
                    </div>

                    {/* Question Text */}
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight mb-8"> 
                        {currentQuestion.question}
                    </h3>

                    {/* Options List */}
                    <div className="space-y-4">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedAnswers[currentQuestion._id] === index;
                            return (
                                <label
                                    key={index}
                                    className={`group relative flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                                        isSelected
                                            ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10'
                                            : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${currentQuestion._id}`}
                                        value={index}
                                        checked={isSelected}
                                        onChange={() => handleOptionsChange(currentQuestion._id, index)}
                                        className="sr-only" 
                                    />

                                    {/* Radio Circle */}
                                    <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                        isSelected
                                            ? 'border-emerald-500 bg-emerald-500'
                                            : 'border-slate-300 bg-white group-hover:border-emerald-400'
                                    }`}>
                                        <div className={`w-2 h-2 rounded-full bg-white transition-transform duration-200 ${
                                            isSelected ? 'scale-100' : 'scale-0'
                                        }`} />
                                    </div>

                                    <span className={`ml-4 text-base font-medium transition-colors duration-200 flex-grow ${
                                        isSelected ? 'text-emerald-900' : 'text-slate-700 group-hover:text-slate-900'
                                    }`}>
                                        {option}
                                    </span>

                                    {isSelected && (
                                        <CheckCircle className="w-5 h-5 text-emerald-600 animate-in zoom-in duration-300" strokeWidth={2.5} />
                                    )}
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Actions & Navigation Footer */}
                <div className="bg-slate-50 border-t border-slate-100 p-6 space-y-6">
                    {/* Prev/Next Buttons */}
                    <div className="flex flex-row items-center justify-between gap-4">
                        <Button
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestionIndex === 0 || submitting}
                            variant='secondary'
                            className="flex-1 sm:flex-none"
                        >
                            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                            Previous
                        </Button>

                        {currentQuestionIndex === quiz.questions.length - 1 ? (
                            <button
                                onClick={handleSubmitQuiz}
                                disabled={submitting}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-200 bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
                                        <span>Submit Quiz</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <Button
                                onClick={handleNextQuestion}
                                disabled={submitting}
                                variant='secondary'
                                className="flex-1 sm:flex-none"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                            </Button>
                        )}
                    </div>

                    {/* Question Quick-Jump Dots */}
                    <div className="flex flex-wrap justify-center gap-2 pt-4 border-t border-slate-200">
                        {quiz.questions.map((q, index) => {
                            const isAnsweredQuestion = selectedAnswers.hasOwnProperty(q._id);
                            const isCurrent = index === currentQuestionIndex;

                            return (
                                <button
                                    key={q._id || index}
                                    onClick={() => setCurrentQuestionIndex(index)}
                                    disabled={submitting}
                                    className={`w-9 h-9 rounded-xl font-bold text-xs transition-all duration-300 transform ${
                                        isCurrent
                                            ? 'bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 scale-110 z-10'
                                            : isAnsweredQuestion
                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 ring-1 ring-emerald-200'
                                            : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400 hover:text-slate-800'
                                    } disabled:opacity-40 disabled:cursor-not-allowed active:scale-95`}
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuizTakePage