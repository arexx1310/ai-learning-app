import React, { useState, useEffect } from 'react';
import {
    Plus,
    ChevronLeft,
    ChevronRight,
    Trash2,
    ArrowLeft,
    Sparkles,
    Brain,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardService";
import aiService from '../../services/aiService';
import Spinner from "../common/Spinner";
import Modal from "../common/Modal";
import Button from '../common/Button';
import Flashcard from './Flashcard';

const FlashcardManager = ({documentId}) => {

    const [flashcardSets, setFlashcardSets] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [setToDelete, setSetToDelete] = useState(null);

    const fetchFlashcardSets = async () => {
        setLoading(true);
        try {
            const response = await flashcardService.getFlashcardsForDocument(
                documentId
            );
            setFlashcardSets(response.data);
        } catch (error) {
            toast.error("Failed to fetch flashcard sets.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchFlashcardSets();
        }
    }, [documentId]);

    const handleGenerateFlashcards = async () => {
        setGenerating(true);
        try {
            await aiService.generateFlashcards(documentId);
            toast.success("Flashcards generated successfully.");
            fetchFlashcardSets();
        } catch (error) {
            toast.error( error.message || "Failed to generate flashcards.");
        } finally {
            setGenerating(false);
        }
    };

    const handleNextCard = () => {
        if (selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex(
                (prevIndex) => (prevIndex + 1) % selectedSet.cards.length
            );
        }
    };

    const handlePrevCard = () => {
        if (selectedSet) {
            handleReview(currentCardIndex);
            setCurrentCardIndex(
                (prevIndex) => 
                    (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length
            );
        }
    };

    const handleReview = async (index) => {
        const currentCard = selectedSet?.cards[currentCardIndex];
        if (!currentCard) return ;

        try {
            await flashcardService.reviewFlashcard(currentCard._id, index);
            toast.success("Flashcard Reviewed");
        } catch (error) {
            toast.error("Failed to review flashcard.");
        } 
    };

    const handleToggleStar = async (cardId) => {
        try {
            await flashcardService.toggleStar(cardId);
            const updatedSets = flashcardSets.map((set) => {
                if (set._id === selectedSet._id){
                    const updatedCards = set.cards.map((card) => 
                        card._id === cardId ? {...card, isStarred: !card.isStarred } :card
                    );
                    return { ...set, cards: updatedCards};
                }
                return set;
            });
            setFlashcardSets(updatedSets);
            setSelectedSet(updatedSets.find((set) => set._id === selectedSet._id));
            toast.success("Flashcard starred status updated!");

        } catch (error) {
            toast.error("Failed to update star status.")
        }
    };

    const handleDeleteRequest = (e, set) => {
        e.stopPropagation();
        setSetToDelete(set);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!setToDelete) return;
        setDeleting(true);
        try {
            await flashcardService.deleteFlashcardSet(setToDelete._id);
            toast.success("Flashcard set deleted successfully");
            setIsDeleteModalOpen(false);
            setSetToDelete(null);
            fetchFlashcardSets();

        } catch (error) {
            toast.error(error.message || "Failed to delete flashcard set");
        } finally {
            setDeleting(false);
        }
    };

    const handleSelectSet = (set) => {
        setSelectedSet(set);
        setCurrentCardIndex(0);
    };

    const renderFlashcardViewer = () => {
        const currentCard = selectedSet.cards[currentCardIndex];

        return (
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => setSelectedSet(null)}
                    className="inline-flex items-center gap-2 mb-8 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors group"
                >
                    <ArrowLeft
                        className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                        strokeWidth={2}
                    />
                    Back to Sets
                </button>

                {/* Flashcard Display */}
                <div className="relative">
                    <div className="w-full flex justify-center items-center min-h-[400px]">
                        <Flashcard
                            key={currentCard._id}
                            flashcard={currentCard}
                            onToggleStar={handleToggleStar}
                        />
                    </div>
                </div>
                {/* Navigatiion Controls */}
                <div className="flex items-center justify-between mt-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <button 
                        onClick={handlePrevCard}
                        disabled={selectedSet.cards.length <= 1}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-emerald-600 disabled:opacity-30 disabled:hover:text-slate-600 transition-colors group"
                    >
                        <ChevronLeft
                            className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                            strokeWidth={2.5}
                        />
                        Previous
                    </button>

                    <div className="px-4 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
                        <span className="text-sm font-bold text-slate-400">
                            <span className="text-emerald-600">{currentCardIndex + 1}</span>{" "}
                            <span className="mx-1 text-slate-300">/</span>{" "}
                            {selectedSet.cards.length}
                        </span>
                    </div>

                    <button 
                        onClick={handleNextCard}
                        disabled={selectedSet.cards.length <= 1}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-emerald-600 disabled:opacity-30 disabled:hover:text-slate-600 transition-colors group"
                    >
                        Next
                        <ChevronRight
                            className="w-5 h-5 transition-transform group-hover:translate-x-1"
                            strokeWidth={2.5}
                        />
                    </button>
                </div>

            </div>
        );
    };

    const renderSetList = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <Spinner/>

                </div>
            );
        }

        if (flashcardSets.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 mb-6">
                        <Brain className="w-8 h-8 text-emerald-600" strokeWidth={2}/>
                    </div>
                    <h3 className="text-xl font-semibold text-salte-900 mb-2"> 
                        No Flashcards Yet
                    </h3>
                    <p className="text-sm text-slate-500 mb-8 text-center max-w-sm">
                        Generate flashcards from your doucment to start learning and reinforce your knowledge.
                    </p>
                    <button 
                        onClick={handleGenerateFlashcards}
                        disabled={generating}
                        className="group inline-flex items-center gap-2 px-6 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                        {generating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                Generating....
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" strokeWidth={2} />
                                Generate Flashcards
                            </>
                        )}
                    </button>   
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Header with generate button */}
                <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Your Flashcard Sets</h3>
                    <p className="text-sm text-slate-500">
                    {flashcardSets.length} {flashcardSets.length === 1 ? "set" : "sets"} available
                    </p>
                </div>
                <button
                    onClick={handleGenerateFlashcards}
                    disabled={generating}
                    className="group inline-flex items-center gap-2 px-5 h-11 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {generating ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                    </div>
                    ) : (
                    <>
                        <Plus className="w-4 h-4" strokeWidth={2.5} />
                        Generate new set
                    </>
                    )}
                </button>
                </div>

                {/* Flashcard Set Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {flashcardSets.map((set) => (
                    <div
                    key={set._id}
                    onClick={() => handleSelectSet(set)}
                    className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1"
                    >
                    {/* Delete Button */}
                    <button
                        onClick={(e) => handleDeleteRequest(e, set)}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 z-10 opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 size={18} strokeWidth={2} />
                    </button>

                    {/* Set Content */}
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                        <Brain size={24} strokeWidth={2} />
                        </div>

                        <div>
                        <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                            Flashcard Set
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                            Created {moment(set.createdAt).format("MMM D, YYYY")}
                        </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                            {set.cards.length} {set.cards.length === 1 ? "card" : "cards"}
                            </span>
                            <span className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold">
                            View Set →
                            </span>
                        </div>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            </div>
        );
    };


    return (
        <>
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8">
            {selectedSet ? renderFlashcardViewer() : renderSetList()}
            
        </div>
        {/* Delete Confirmation Modal */}
        <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Delete Flashcard Set"
        >
            <div className="p-1">
                <p className="text-slate-600 leading-relaxed">
                    Are you sure you want to delete this flashcard set? This action{" "}
                    <span className="font-semibold text-slate-900">cannot be undone</span> and
                    all cards will be permanently removed.
                </p>

                <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDeleteModalOpen(false)}
                        disabled={deleting}
                    >
                        Cancel
                    </Button>
                    
                    <Button
                        variant="danger" // Make sure to add 'danger' to your Button component
                        onClick={handleConfirmDelete}
                        disabled={deleting}
                        className="bg-red-500 hover:bg-red-600 shadow-red-200" 
                    >
                        {deleting ? (
                            <span className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Deleting...
                            </span>
                        ) : (
                            "Delete Set"
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
        </>
    )
}

export default FlashcardManager;
