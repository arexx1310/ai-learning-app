import mongoose from 'mongoose';
import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';

import supabase from '../config/supabase.js';

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const uploadToSupabase = async (buffer, fileName) => {
    const cleanName = fileName.replace(/\s+/g, '_');
    const filePath = `${Date.now()}-${cleanName}`;

    const { error } = await supabase.storage
        .from('documents')
        .upload(filePath, buffer, { contentType: 'application/pdf' });

    if (error) throw error;
    return { filePath };
};

/* ─────────────────────────────────────────────
   UPLOAD DOCUMENT
   POST /api/documents/upload
   Private
───────────────────────────────────────────── */
export const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Please upload a PDF file' });
        }

        const title = req.body.title?.trim();
        if (!title) {
            return res.status(400).json({ success: false, error: 'Please provide a document title' });
        }

        const fileBuffer = req.file.buffer;

        // Run Supabase upload and text extraction concurrently.
        // Supabase is non-critical — a failure stores null filePath but processing continues.
        const [supabaseOutcome, extractedData] = await Promise.all([
            uploadToSupabase(fileBuffer, req.file.originalname).catch(err => {
                console.warn('Supabase upload failed (non-critical):', err.message);
                return null;
            }),
            extractTextFromPDF(fileBuffer),
        ]);

        if (!extractedData.text || extractedData.text.trim().length === 0) {
            return res.status(422).json({
                success: false,
                error: 'Could not extract text from PDF. The file may be scanned or image-based.',
            });
        }

        const filePath = supabaseOutcome?.filePath ?? null;

        console.log(`Extracted ${extractedData.text.length} characters, filePath: ${filePath ?? 'none'}`);

        const chunks = chunkText(extractedData.text, 500, 50);
        console.log(`Created ${chunks.length} chunks`);

        const document = await Document.create({
            userId: req.user.id,
            title,
            fileName: req.file.originalname,
            filePath,
            extractedText: extractedData.text,
            chunks,
            status: 'ready',
        });

        return res.status(201).json({
            success: true,
            data: {
                _id: document._id,
                title: document.title,
                fileName: document.fileName,
                uploadDate: document.uploadDate,
                status: document.status,
                fileStored: !!filePath,
            },
            message: 'Document processed successfully',
        });
    } catch (error) {
        console.error('Upload error:', error);
        next(error);
    }
};

/* ─────────────────────────────────────────────
   GET ALL DOCUMENTS
   GET /api/documents
   Private
───────────────────────────────────────────── */
export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.user.id) },
            },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets',
                },
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes',
                },
            },
            {
                $addFields: {
                    flashcardCount: { $size: '$flashcardSets' },
                    quizCount: { $size: '$quizzes' },
                    wordCount: { $size: { $split: ['$extractedText', ' '] } },
                },
            },
            {
                // Never send extractedText or chunks to the list view — too large
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0,
                },
            },
            { $sort: { uploadDate: -1 } },
        ]);

        return res.status(200).json({
            success: true,
            count: documents.length,
            data: documents,
        });
    } catch (error) {
        console.error('Get documents error:', error);
        next(error);
    }
};

/* ─────────────────────────────────────────────
   GET SINGLE DOCUMENT
   GET /api/documents/:id
   Private
───────────────────────────────────────────── */
export const getDocument = async (req, res, next) => {
    try {
        // Select everything except the heavy extractedText field —
        // AI routes use document.chunks directly; callers don't need raw text
        const document = await Document.findOne(
            { _id: req.params.id, userId: req.user.id },
        );
        
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        const [flashcardCount, quizCount] = await Promise.all([
            Flashcard.countDocuments({ documentId: document._id, userId: req.user.id }),
            Quiz.countDocuments({ documentId: document._id, userId: req.user.id }),
        ]);

        

        let fileUrl = null;
        if (document.filePath) {
            const { data, error: supabaseError } = await supabase.storage
                .from('documents')
                .createSignedUrl(document.filePath, 60 * 10); // 10-min signed URL

            if (supabaseError) {
                console.warn('Supabase signed URL error:', supabaseError.message);
            } else {
                fileUrl = data.signedUrl;
            }
        }

        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;
        documentData.fileUrl = fileUrl;

        return res.status(200).json({
            success: true,
            data: documentData,
        });
    } catch (error) {
        console.error('Get document error:', error);
        next(error);
    }
};

/* ─────────────────────────────────────────────
   DELETE DOCUMENT
   DELETE /api/documents/:id
   Private
───────────────────────────────────────────── */
export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }

        // 1. Remove remote file (non-critical)
        if (document.filePath) {
            const { error } = await supabase.storage
                .from('documents')
                .remove([document.filePath]);

            if (error) {
                console.warn('Supabase delete failed (non-critical):', error.message);
            }
        }

        // 2. Delete all child records first, then the document itself
        await Promise.all([
            Flashcard.deleteMany({ documentId: document._id }),
            Quiz.deleteMany({ documentId: document._id }),
            ChatHistory.deleteMany({ documentId: document._id }),
        ]);

        await Document.findByIdAndDelete(document._id);

        return res.status(200).json({
            success: true,
            message: 'Document deleted',
        });
    } catch (error) {
        console.error('Delete document error:', error);
        next(error);
    }
};