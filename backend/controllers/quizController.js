import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } from 'docx';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ─────────────────────────────────────────────
   EXPORT QUIZZES TO DOCX
   GET /api/quizzes/:documentId/export
   Private
   
   NOTE: All other quiz CRUD lives in quizController.js.
   This file handles only the export — kept separate because
   the docx import is heavy and unrelated to core quiz logic.
───────────────────────────────────────────── */
export const exportQuizzesToDocx = async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.documentId)) {
            return res.status(400).json({ success: false, error: 'Invalid document ID' });
        }

        const quizzes = await Quiz.find({
            userId: req.user.id,
            documentId: req.params.documentId,
        }).sort({ createdAt: -1 });

        if (!quizzes.length) {
            return res.status(404).json({
                success: false,
                error: 'No quizzes found for this document',
            });
        }

        const optionLabels = ['A', 'B', 'C', 'D'];
        const children = [];

        // Document title
        children.push(
            new Paragraph({
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 0, after: 300 },
                children: [new TextRun({ text: 'Quiz Export', bold: true, size: 36, font: 'Arial' })],
            })
        );

        quizzes.forEach((quiz, quizIndex) => {
            children.push(
                new Paragraph({
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 },
                    children: [
                        new TextRun({
                            text: `Quiz ${quizIndex + 1}: ${quiz.title}`,
                            bold: true,
                            size: 28,
                            font: 'Arial',
                            color: '1a1a2e',
                        }),
                    ],
                })
            );

            children.push(
                new Paragraph({
                    spacing: { before: 0, after: 300 },
                    children: [
                        new TextRun({
                            text: `Total Questions: ${quiz.totalQuestions}   |   Score: ${quiz.completedAt ? `${quiz.score}%` : 'Not attempted'}`,
                            size: 20,
                            font: 'Arial',
                            color: '6b7280',
                            italics: true,
                        }),
                    ],
                })
            );

            quiz.questions.forEach((q, qIndex) => {
                children.push(
                    new Paragraph({
                        spacing: { before: 280, after: 120 },
                        children: [
                            new TextRun({
                                text: `Q${qIndex + 1}. ${q.question}`,
                                bold: true,
                                size: 22,
                                font: 'Arial',
                                color: '111827',
                            }),
                        ],
                    })
                );

                q.options.forEach((option, optIndex) => {
                    children.push(
                        new Paragraph({
                            spacing: { before: 60, after: 60 },
                            indent: { left: 480 },
                            children: [
                                new TextRun({
                                    text: `${optionLabels[optIndex]}. ${option}`,
                                    size: 20,
                                    font: 'Arial',
                                    color: '374151',
                                }),
                            ],
                        })
                    );
                });

                children.push(
                    new Paragraph({
                        spacing: { before: 140, after: 60 },
                        indent: { left: 480 },
                        children: [
                            new TextRun({ text: 'Correct Answer: ', bold: true, size: 20, font: 'Arial', color: '059669' }),
                            new TextRun({ text: q.correctAnswer, size: 20, font: 'Arial', color: '059669' }),
                        ],
                    })
                );

                if (q.explanation) {
                    children.push(
                        new Paragraph({
                            spacing: { before: 60, after: 160 },
                            indent: { left: 480 },
                            children: [
                                new TextRun({ text: 'Explanation: ', bold: true, size: 20, font: 'Arial', color: '6366f1' }),
                                new TextRun({ text: q.explanation, size: 20, font: 'Arial', color: '6b7280', italics: true }),
                            ],
                        })
                    );
                }

                children.push(
                    new Paragraph({
                        spacing: { before: 100, after: 100 },
                        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'e5e7eb', space: 1 } },
                        children: [new TextRun({ text: '' })],
                    })
                );
            });
        });

        const doc = new Document({
            styles: {
                default: { document: { run: { font: 'Arial', size: 22 } } },
                paragraphStyles: [
                    {
                        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
                        run: { size: 36, bold: true, font: 'Arial', color: '111827' },
                        paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 },
                    },
                    {
                        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
                        run: { size: 28, bold: true, font: 'Arial', color: '1a1a2e' },
                        paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 1 },
                    },
                ],
            },
            sections: [{
                properties: {
                    page: {
                        size: { width: 12240, height: 15840 },
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                    },
                },
                children,
            }],
        });

        const buffer = await Packer.toBuffer(doc);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename="quizzes.docx"');
        return res.send(buffer);

    } catch (error) {
        next(error);
    }
};


/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   GET ALL QUIZZES FOR A DOCUMENT
   GET /api/quizzes/:documentId
   Private
───────────────────────────────────────────── */
export const getQuizzes = async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.documentId)) {
            return res.status(400).json({ success: false, error: 'Invalid document ID' });
        }

        const quizzes = await Quiz.find({
            userId: req.user.id,
            documentId: req.params.documentId,
        })
            .populate('documentId', 'title fileName')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes,
        });
    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   GET SINGLE QUIZ BY ID
   GET /api/quizzes/quiz/:id
   Private
───────────────────────────────────────────── */
export const getQuizById = async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid quiz ID' });
        }

        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user.id,
        }).populate('documentId', 'title fileName');

        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        return res.status(200).json({
            success: true,
            data: quiz,
        });
    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   SUBMIT QUIZ ANSWERS
   POST /api/quizzes/:id/submit
   Private
───────────────────────────────────────────── */
export const submitQuiz = async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid quiz ID' });
        }

        const { answers } = req.body;

        if (!Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ success: false, error: 'Please provide a non-empty answers array' });
        }

        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        // Prevent re-submission without an explicit retake
        if (quiz.completedAt) {
            return res.status(409).json({
                success: false,
                error: 'Quiz already submitted. Use the retake endpoint to reset it first.',
            });
        }

        let correctCount = 0;
        const userAnswers = [];

        for (const answer of answers) {
            const { questionIndex, selectedAnswer } = answer;

            // Validate each answer entry
            if (
                typeof questionIndex !== 'number' ||
                !Number.isInteger(questionIndex) ||
                questionIndex < 0 ||
                questionIndex >= quiz.questions.length
            ) {
                continue; // skip malformed or out-of-range entries
            }

            if (typeof selectedAnswer !== 'string' || !selectedAnswer.trim()) {
                continue;
            }

            const question = quiz.questions[questionIndex];
            const isCorrect = selectedAnswer.trim() === question.correctAnswer;

            if (isCorrect) correctCount++;

            userAnswers.push({
                questionIndex,
                selectedAnswer: selectedAnswer.trim(),
                isCorrect,
                answeredAt: new Date(),
            });
        }

        if (userAnswers.length === 0) {
            return res.status(400).json({ success: false, error: 'No valid answers were provided' });
        }

        const score = Math.round((correctCount / quiz.totalQuestions) * 100);

        quiz.userAnswers = userAnswers;
        quiz.score = score;
        quiz.completedAt = new Date();

        await quiz.save();

        return res.status(200).json({
            success: true,
            data: {
                quizId: quiz._id,
                score,
                correctCount,
                totalQuestions: quiz.totalQuestions,
                percentage: score,
                userAnswers: quiz.userAnswers,
            },
            message: 'Quiz submitted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   GET QUIZ RESULTS
   GET /api/quizzes/:id/results
   Private
───────────────────────────────────────────── */
export const getQuizResults = async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid quiz ID' });
        }

        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user.id,
        }).populate('documentId', 'title');

        if (!quiz) {
            // Was 400 in original — fixed to 404
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        if (!quiz.completedAt) {
            return res.status(400).json({ success: false, error: 'Quiz not completed yet' });
        }

        const detailedResults = quiz.questions.map((question, index) => {
            const userAnswer = quiz.userAnswers.find(a => a.questionIndex === index);
            return {
                questionIndex: index,
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                selectedAnswer: userAnswer?.selectedAnswer ?? null,
                isCorrect: userAnswer?.isCorrect ?? false,
                explanation: question.explanation,
            };
        });

        return res.status(200).json({
            success: true,
            data: {
                quiz: {
                    id: quiz._id,
                    title: quiz.title,
                    document: quiz.documentId,
                    score: quiz.score,
                    totalQuestions: quiz.totalQuestions,
                    completedAt: quiz.completedAt,
                },
                results: detailedResults,
            },
        });
    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   DELETE QUIZ
   DELETE /api/quizzes/:id
   Private
───────────────────────────────────────────── */
export const deleteQuiz = async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid quiz ID' });
        }

        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        await quiz.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/* ─────────────────────────────────────────────
   RETAKE QUIZ
   PATCH /api/quizzes/:id/retake
   Private
───────────────────────────────────────────── */
export const retakeQuiz = async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, error: 'Invalid quiz ID' });
        }

        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!quiz) {
            return res.status(404).json({ success: false, error: 'Quiz not found' });
        }

        quiz.userAnswers = [];
        quiz.score = 0;          // reset to schema default, not null
        quiz.completedAt = null;

        await quiz.save();

        return res.status(200).json({
            success: true,
            message: 'Quiz reset successfully',
        });
    } catch (error) {
        next(error);
    }
};