import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import mongoose from 'mongoose';
import fs from 'fs/promises';

import supabase from '../config/supabase.js';
import { Readable } from 'stream';

const uploadToSupabase = async (buffer, fileName) => {
  const cleanName = fileName.replace(/\s+/g, '_');
  const filePath = `${Date.now()}-${cleanName}`;

  console.log("Bucket:", "documents");
  console.log("FilePath:", filePath);

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, buffer, {
      contentType: 'application/pdf'
    });

  console.log("Supabase response:", data, error);

  if (error) throw error;

  return { filePath };
};
// @desc Upload PDF document
// @route POST /api/documents/upload
// @access Private
export const uploadDocument = async (req, res, next) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a PDF file',
                statusCode: 400
            });
        }
        
        const { title } = req.body;
        
        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a document title',
                statusCode: 400
            });
        }

        const fileBuffer = req.file.buffer;

         // Upload to Supabase (runs in parallel with text extraction below)
      
        console.log("Uploading Document To Supabase....")

        const [supabaseResult, extractedData] = await Promise.all([
            uploadToSupabase(fileBuffer, req.file.originalname),
            extractTextFromPDF(fileBuffer)
        ]);

        console.log('File stored at:', supabaseResult.filePath);
        console.log(`Extracted ${extractedData.text.length} characters`);

        // Create chunks
        const chunks = chunkText(extractedData.text, 500, 50);
        console.log('Created', chunks.length, 'chunks');

        // Save document with text only
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: supabaseResult.filePath,
            extractedText: extractedData.text,
            chunks: chunks,
            status: 'ready'
        });

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

        let fileUrl = null;

        const { data, error: supabaseError } = await supabase.storage
            .from('documents')
            .createSignedUrl(document.filePath, 60 * 10);

        if (supabaseError) {
            console.error('Supabase error:', supabaseError.message);
        } else {
            fileUrl = data.signedUrl;
        }

        documentData.fileUrl = fileUrl;

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

        // Delete from Supabasefirst
        const { error } = await supabase.storage
            .from('documents')
            .remove([document.filePath]);

         if (error) {
            console.error('Supabase delete error:', error);
            throw error;
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
