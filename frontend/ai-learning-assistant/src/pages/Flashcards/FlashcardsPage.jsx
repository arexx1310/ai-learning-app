import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import flashcardService from "../../services/flashcardService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button"; // Tumhara custom button
import Modal from "../../components/common/Modal";
import Flashcard from "../../components/flashcards/Flashcard";

const FlashcardsPage = () => {
    const { id: documentId } = useParams();
    const [flashcardSets, setFlashcardSets] = useState(null);
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const fetchFlashcards = async () => {
        setLoading(true);
        try {
            const response = await flashcardService.getFlashcardsForDocument(documentId);
            const setData = response.data[0];
            setFlashcardSets(setData);
            setFlashcards(setData?.cards || []);
        } catch (error) {
            toast.error("Failed to fetch flashcards.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlashcards();
    }, [documentId]);

    const handleNextCard = () => {
        setCurrentCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
    };

    const handlePrevCard = () => {
        setCurrentCardIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
    };

    const handleToggleStar = async (cardId) => {
        try {
            await flashcardService.toggleStar(cardId);
            setFlashcards((prev) =>
                prev.map((card) =>
                    card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
                )
            );
        } catch (error) {
            toast.error("Failed to update star.");
        }
    };

    const handleDeleteFlashcardSet = async () => {
        setDeleting(true);
        try {
            await flashcardService.deleteFlashcardSet(flashcardSets._id);
            toast.success("Set deleted successfully!");
            setIsDeleteModalOpen(false);
            setFlashcards([]);
        } catch (error) {
            toast.error("Failed to delete set.");
        } finally {
            setDeleting(false);
        }
    };

    const renderFlashcardContent = () => {
        if (loading) return (
            <div className="flex justify-center items-center h-64">
                <Spinner />
            </div>
        );

        if (flashcards.length === 0) return (
            <EmptyState
                title="No Flashcards Yet"
                description="There are no flashcards available for this document."
            />
        );

        const currentCard = flashcards[currentCardIndex];

        return (
            <div className="flex flex-col items-center mt-10 w-full max-w-2xl mx-auto">
                {/* Flashcard Component */}
                <Flashcard flashcard={currentCard} onToggleStar={handleToggleStar} />

                {/* Your Custom Navigation Bar using your Button Component */}
                <div className="flex items-center justify-between mt-8 bg-slate-50 p-4 rounded-2xl border border-slate-100 w-full">
                    <Button
                        variant="secondary"
                        onClick={handlePrevCard}
                        disabled={flashcards.length <= 1}
                        className="bg-transparent hover:bg-transparent shadow-none text-slate-600 hover:text-emerald-600 group"
                    >
                        <ChevronLeft
                            className="w-5 h-5 transition-transform group-hover:-translate-x-1"
                            strokeWidth={2.5}
                        />
                        Previous
                    </Button>

                    <div className="px-4 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
                        <span className="text-sm font-bold text-slate-400">
                            <span className="text-emerald-600">{currentCardIndex + 1}</span>{" "}
                            <span className="mx-1 text-slate-300">/</span>{" "}
                            {flashcards.length}
                        </span>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={handleNextCard}
                        disabled={flashcards.length <= 1}
                        className="bg-transparent hover:bg-transparent shadow-none text-slate-600 hover:text-emerald-600 group"
                    >
                        Next
                        <ChevronRight
                            className="w-5 h-5 transition-transform group-hover:translate-x-1"
                            strokeWidth={2.5}
                        />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-6">
                <Link
                    to={`/documents/${documentId}`}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-bold text-xs uppercase tracking-widest"
                >
                    <ArrowLeft size={16} />
                    Back to Document
                </Link>
            </div>

            <PageHeader title="Study Session">
                {flashcards.length > 0 && !loading && (
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setIsDeleteModalOpen(true)}
                        disabled={deleting}
                    >
                        <Trash2 size={16} /> Delete Set
                    </Button>
                )}
            </PageHeader>

            {renderFlashcardContent()}

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Delete"
            >
                <div className="space-y-4">
                    <p className="text-slate-600">
                        Are you sure you want to delete this flashcard set? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteFlashcardSet}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete Permanently"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default FlashcardsPage;