import React, { useState, useEffect } from 'react';
import flashcardService from '../../services/flashcardService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import FlashcardSetCard from '../../components/flashcards/FlashcardSetCard';
import toast from 'react-hot-toast';

const FlashcardsListPage = () => {
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFlashcardSets = async () => {
            try {
                const response = await flashcardService.getAllFlashcardsSets();
                console.log("fetchFlashcardSets__", response.data);
                setFlashcardSets(response.data);
            } catch (error) {
                toast.error('Failed to fetch flashcard sets.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchFlashcardSets();
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Spinner/>
                    <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading sets...</p>
                </div>
            );
        }

        if (flashcardSets.length === 0) {
            return (
                <div className="mt-10">
                    <EmptyState
                        title="No Flashcard Sets Found"
                        description="You haven't generated any flashcards. Go to a document to generate a set of flashcards."
                    />
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {flashcardSets.map((set) => (
                    <FlashcardSetCard key={set._id} flashcardSet={set} />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="fixed inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
              
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                    <PageHeader 
                        title="All Flashcard Sets" 
                    />
                
                    <div className="hidden sm:block"></div> 
                </div>

                {renderContent()}
            </div>
        </div>
    );
};

export default FlashcardsListPage;