import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import * as geminiService from '../utils/geminiService.js';
import { findRelevantChunks } from '../utils/textChunker.js';

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

// Shared document lookup — always scoped to the authenticated user
const findReadyDocument = (documentId, userId) =>
    Document.findOne({ _id: documentId, userId, status: 'ready' });

// Clamp AI count inputs to a sane range
const clampCount = (value, min, max, fallback) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return fallback;
    return Math.min(Math.max(parsed, min), max);
};

/* ─────────────────────────────────────────────
   GENERATE FLASHCARDS
   POST /api/ai/generate-flashcards
   Private
───────────────────────────────────────────── */
export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count = 10 } = req.body;

        if (!documentId) {
            return res.status(400).json({ success: false, error: 'Please provide documentId' });
        }

        const document = await findReadyDocument(documentId, req.user.id);
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found or not ready' });
        }

        const safeCount = clampCount(count, 1, 50, 10);

        const cards = await geminiService.generateFlashcards(document.extractedText, safeCount);

        if (!cards || cards.length === 0) {
            return res.status(502).json({ success: false, error: 'AI returned no flashcards. Try again.' });
        }

        const flashcardSet = await Flashcard.create({
            userId: req.user.id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                reviewCount: 0,   // matches schema field name
                isStarred: false,
            })),
        });

        return res.status(201).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcards generated successfully',
        });
    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   GENERATE QUIZ
   POST /api/ai/generate-quiz
   Private
───────────────────────────────────────────── */
export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;

        if (!documentId) {
            return res.status(400).json({ success: false, error: 'Please provide documentId' });
        }

        const document = await findReadyDocument(documentId, req.user.id);
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found or not ready' });
        }

        const safeCount = clampCount(numQuestions, 1, 30, 5);

        const questions = await geminiService.generateQuiz(document.extractedText, safeCount);

        if (!questions || questions.length === 0) {
            return res.status(502).json({ success: false, error: 'AI returned no questions. Try again.' });
        }

        const quiz = await Quiz.create({
            userId: req.user.id,
            documentId: document._id,
            title: (title && title.trim()) ? title.trim() : `${document.title} - Quiz`,
            questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0,
        });

        return res.status(201).json({
            success: true,
            data: quiz,
            message: 'Quiz generated successfully',
        });
    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   GENERATE SUMMARY
   POST /api/ai/generate-summary
   Private
───────────────────────────────────────────── */
export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;

        if (!documentId) {
            return res.status(400).json({ success: false, error: 'Please provide documentId' });
        }

        const document = await findReadyDocument(documentId, req.user.id);
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found or not ready' });
        }

        const summary = await geminiService.generateSummary(document.extractedText);

        return res.status(200).json({
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary,
            },
            message: 'Summary generated successfully',
        });
    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   CHAT WITH DOCUMENT
   POST /api/ai/chat
   Private
───────────────────────────────────────────── */

// Keep chat history bounded — no single conversation should grow unbounded
const MAX_CHAT_MESSAGES = 100;

export const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;

        if (!documentId || !question) {
            return res.status(400).json({ success: false, error: 'Please provide documentId and question' });
        }

        if (typeof question !== 'string' || !question.trim()) {
            return res.status(400).json({ success: false, error: 'Question must be a non-empty string' });
        }

        const document = await findReadyDocument(documentId, req.user.id);
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found or not ready' });
        }

        const relevantChunks = findRelevantChunks(document.chunks, question.trim(), 3);
        const chunkIndices = relevantChunks.map(c => c.chunkIndex);

        let chatHistory = await ChatHistory.findOne({
            userId: req.user.id,
            documentId: document._id,
        });

        if (!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user.id,
                documentId: document._id,
                messages: [],
            });
        }

        const answer = await geminiService.chatWithContext(question.trim(), relevantChunks);

        // Guard against runaway growth
        if (chatHistory.messages.length >= MAX_CHAT_MESSAGES) {
            // Drop oldest pair (user + assistant) to stay within limit
            chatHistory.messages.splice(0, 2);
        }

        chatHistory.messages.push(
            { role: 'user', content: question.trim(), timestamp: new Date(), relevantChunks: [] },
            { role: 'assistant', content: answer, timestamp: new Date(), relevantChunks: chunkIndices }
        );

        await chatHistory.save();

        return res.status(200).json({
            success: true,
            data: {
                question,
                answer,
                relevantChunks: chunkIndices,
                chatHistoryId: chatHistory._id,
            },
            message: 'Response generated successfully',
        });
    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   EXPLAIN CONCEPT
   POST /api/ai/explain-concept
   Private
───────────────────────────────────────────── */
export const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;

        if (!documentId || !concept) {
            return res.status(400).json({ success: false, error: 'Please provide documentId and concept' });
        }

        if (typeof concept !== 'string' || !concept.trim()) {
            return res.status(400).json({ success: false, error: 'Concept must be a non-empty string' });
        }

        const document = await findReadyDocument(documentId, req.user.id);
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found or not ready' });
        }

        const relevantChunks = findRelevantChunks(document.chunks, concept.trim(), 3);
        const context = relevantChunks.map(c => c.content).join('\n\n');

        const explanation = await geminiService.explainConcept(concept.trim(), context);

        return res.status(200).json({
            success: true,
            data: {
                concept,
                explanation,
                relevantChunks: relevantChunks.map(c => c.chunkIndex),
            },
            message: 'Explanation generated successfully',
        });
    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   GET CHAT HISTORY
   GET /api/ai/chat-history/:documentId
   Private
───────────────────────────────────────────── */
export const getChatHistory = async (req, res, next) => {
    try {
        const { documentId } = req.params;

        // Validate that the document belongs to this user before returning chat
        const document = await Document.findOne({ _id: documentId, userId: req.user.id });
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        const chatHistory = await ChatHistory.findOne({
            userId: req.user.id,
            documentId,
        }).select('messages');

        if (!chatHistory) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No chat history found for this document',
            });
        }

        return res.status(200).json({
            success: true,
            data: chatHistory.messages,
            message: 'Chat history retrieved successfully',
        });
    } catch (error) {
        next(error);
    }
};