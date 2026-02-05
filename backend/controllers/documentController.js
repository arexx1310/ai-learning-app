import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import mongoose from 'mongoose';
import fs from 'fs/promises';

// @desc Upload PDF document
// @route POST /api/documents/upload
// @access Private
export const uploadDocument = async (req, res, next) => {
    let localFilePath = null;

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a PDF file',
                statusCode: 400
            });
        }
        
        const { title } = req.body;
        localFilePath = req.file.path;
        
        if (!title) {
            await fs.unlink(localFilePath);
            return res.status(400).json({
                success: false,
                error: 'Please provide a document title',
                statusCode: 400
            });
        }

        console.log('Extracting text from PDF...');
        
        // Extract text
        const { text, numPages } = await extractTextFromPDF(localFilePath);
        console.log(`Extracted ${text.length} characters from ${numPages} pages`);

        // Create chunks
        const chunks = chunkText(text, 500, 50);
        console.log('Created', chunks.length, 'chunks');

        // Save document with text only
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            extractedText: text,
            chunks: chunks,
            status: 'ready'
        });

        // Delete temp file
        await fs.unlink(localFilePath);
        console.log('Temp file deleted');

        res.status(201).json({
            success: true,
            data: {
                _id: document._id,
                title: document.title,
                fileName: document.fileName,
                uploadDate: document.uploadDate,
                status: document.status
            },
            message: 'Document processed successfully'
        });

    } catch (error) {
        console.error('Upload error:', error);
        
        if (localFilePath) {
            await fs.unlink(localFilePath).catch(() => {});
        }
        
        next(error);
    }
};

// @desc Get all user documents
// @route GET /api/documents
// @access Private
export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(req.user._id) }
            },
            {
                $lookup: {
                    from: 'flashcards',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'flashcardSets'
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: 'documentId',
                    as: 'quizzes'
                }
            },
            {
                $addFields: {
                    flashcardCount: { $size: '$flashcardSets' },
                    quizCount: { $size: '$quizzes' },
                    wordCount: {
                        $size: {
                            $split: ['$extractedText', ' ']
                        }
                    }
                }
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0
                }
            },
            {
                $sort: { uploadDate: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        console.error('Get documents error:', error);
        next(error);
    }
};

// @desc Get single document with text
// @route GET /api/documents/:id
// @access Private
export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // Get counts
        const flashcardCount = await Flashcard.countDocuments({ 
            documentId: document._id, 
            userId: req.user._id 
        });
        const quizCount = await Quiz.countDocuments({ 
            documentId: document._id, 
            userId: req.user._id 
        });
        
        // Update last accessed
        document.lastAccessed = Date.now();
        await document.save();

        // Return document with text
        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        res.status(200).json({
            success: true,
            data: documentData
        });

    } catch (error) {
        console.error('Get document error:', error);
        next(error);
    }
};

// @desc Delete document
// @route DELETE /api/documents/:id
// @access Private
export const deleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!document) {
            return res.status(404).json({ 
                success: false, 
                error: 'Document not found' 
            });
        }

        await Document.findByIdAndDelete(document._id);

        res.status(200).json({ 
            success: true, 
            message: 'Document deleted' 
        });

    } catch (error) {
        console.error('Delete document error:', error);
        next(error);
    }
};
