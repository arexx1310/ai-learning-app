import mongoose from 'mongoose';
import Flashcard from '../models/Flashcard.js';

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ─────────────────────────────────────────────
   GET FLASHCARDS FOR A DOCUMENT
   GET /api/flashcards/:documentId
   Private
───────────────────────────────────────────── */
export const getFlashcards = async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.documentId)) {
            return res.status(400).json({ success: false, error: 'Invalid document ID' });
        }

        const flashcards = await Flashcard.find({
            userId: req.user.id,
            documentId: req.params.documentId,
        })
            .populate('documentId', 'title fileName')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: flashcards.length,
            data: flashcards,
        });
    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   GET ALL FLASHCARD SETS FOR USER
   GET /api/flashcards
   Private
───────────────────────────────────────────── */
export const getAllFlashcardSets = async (req, res, next) => {
    try {
        const flashcardSets = await Flashcard.find({ userId: req.user.id })
            .populate('documentId', 'title')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: flashcardSets.length,
            data: flashcardSets,
        });
    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   MARK FLASHCARD AS REVIEWED
   POST /api/flashcards/:cardId/review
   Private
───────────────────────────────────────────── */
export const reviewFlashcard = async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.cardId)) {
            return res.status(400).json({ success: false, error: 'Invalid card ID' });
        }

        const flashcardSet = await Flashcard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user.id,
        });

        if (!flashcardSet) {
            return res.status(404).json({ success: false, error: 'Flashcard set or card not found' });
        }

        const cardIndex = flashcardSet.cards.findIndex(
            card => card._id.toString() === req.params.cardId
        );

        // findOne already confirmed existence — cardIndex should always be ≥ 0,
        // but guard defensively in case of data inconsistency
        if (cardIndex === -1) {
            return res.status(404).json({ success: false, error: 'Card not found in set' });
        }

        flashcardSet.cards[cardIndex].lastReviewed = new Date();
        flashcardSet.cards[cardIndex].reviewCount += 1;

        await flashcardSet.save();

        return res.status(200).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcard reviewed successfully',
        });
    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   TOGGLE STAR ON FLASHCARD
   PUT /api/flashcards/:cardId/star
   Private
───────────────────────────────────────────── */
export const toggleStarFlashcard = async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.cardId)) {
            return res.status(400).json({ success: false, error: 'Invalid card ID' });
        }

        const flashcardSet = await Flashcard.findOne({
            'cards._id': req.params.cardId,
            userId: req.user.id,
        });

        if (!flashcardSet) {
            return res.status(404).json({ success: false, error: 'Flashcard set or card not found' });
        }

        const cardIndex = flashcardSet.cards.findIndex(
            card => card._id.toString() === req.params.cardId
        );

        if (cardIndex === -1) {
            return res.status(404).json({ success: false, error: 'Card not found in set' });
        }

        flashcardSet.cards[cardIndex].isStarred = !flashcardSet.cards[cardIndex].isStarred;

        await flashcardSet.save();

        return res.status(200).json({
            success: true,
            data: flashcardSet,
            message: `Flashcard ${flashcardSet.cards[cardIndex].isStarred ? 'starred' : 'unstarred'}`,
        });
    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   DELETE FLASHCARD SET
   DELETE /api/flashcards/:id
   Private
───────────────────────────────────────────── */
export const deleteFlashcardSet = async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid flashcard set ID' });
        }

        const flashcardSet = await Flashcard.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!flashcardSet) {
            return res.status(404).json({ success: false, error: 'Flashcard set not found' });
        }

        await flashcardSet.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Flashcard set deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};