import Quiz from '../models/Quiz.js';

// @desc Get all quizzes
// @route GET/api/quizzes/:documentId
// @access Private

export const getQuizzes = async (req, res, next) => {
    try{
        const quizzes = await Quiz.find({
            userId: req.user._id,
            documentId: req.params.documentId
        })
            .populate('documentId','title fileName')
            .sort({createdAt: -1});

        res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes
        });
    } catch (error) {
        next(error);
    }
};

// @desc Get a single quiz by ID
// @route GET/api/quizzes/quiz/:id
// @access Private

export const getQuizById = async (req, res, next) => {
    try{
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('documentId', 'title fileName');


        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        res.status(200).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        next(error);
    }
};


// @desc Submit quiz answers
// @route POST/api/quizzes/:id/submit
// @access Private

export const submitQuiz = async (req, res, next) => {
    try{
        const { answers } = req.body;

        if (!Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide answer array',
                statusCode: 400
            });
        }

        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: (404)
            });
        }

        let correctCount = 0;
        const userAnswers = [];

        answers.forEach(answer => {
            const { questionIndex, selectedAnswer} = answer;

            if (questionIndex < quiz.questions.length) {
                const question = quiz.questions[questionIndex];
                const isCorrect = selectedAnswer === question.correctAnswer;

                if (isCorrect) correctCount++;

                userAnswers.push({
                    questionIndex,
                    selectedAnswer,
                    isCorrect,
                    answeredAt: new Date()
                });
            }
        });

        // Calculate score

        const score = Math.round((correctCount/ quiz.totalQuestions) * 100);

        //Update quiz

        quiz.userAnswers = userAnswers;
        quiz.score = score;
        quiz.completedAt = new Date();

        await quiz.save();

        res.status(200).json({
            success: true,
            data: {
                quizId: quiz._id,
                score,
                correctCount, 
                totalQuestions: quiz.totalQuestions,
                percentage: score,
                userAnswers: quiz.userAnswers
            },
            message: 'Quiz submitted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc Get quiz results
// @route GET/api/quizzes/:id/results
// @access Private

export const getQuizResults = async (req, res, next) => {
    try{
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('documentId','title');

        if (!quiz) {
            return res.status(400).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        if (!quiz.completedAt) {
            return res.status(400).json({
                success: false,
                error: 'Quiz not completed yet',
                statusCode: 400
            });
        }

        // Build detailed results

        const detailedResults = quiz.questions.map((question, index) => {
        const userAnswer = quiz.userAnswers.find(a => a.questionIndex === index);
           
            return {
                questionIndex: index,
                question: question.question,
                options: question.options,
                correctAnswer: question.correctAnswer,
                selectedAnswer: userAnswer?.selectedAnswer || null,
                isCorrect: userAnswer?.isCorrect || false,
                explanation: question.explanation
                };
        });
            
        res.status(200).json({
            success: true,
            data: {
                quiz: {
                    id: quiz._id,
                    title: quiz.title,
                    document: quiz.documentId,
                    score: quiz.score,
                    totalQuestions: quiz.totalQuestions,
                    completedAt: quiz.completedAt 
                },
                results: detailedResults
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc Get a single quiz by ID
// @route DELETE/api/quizzes/:id
// @access Private

export const deleteQuiz = async (req, res, next) => {
    try{
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        await quiz.deleteOne();
        
        res.status(200).json({
            success: true,
            message: 'Quiz deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc Retake quiz (clear answers and score)
// @route PATCH /api/quizzes/:id/retake
// @access Private

export const retakeQuiz = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        quiz.userAnswers = [];
        quiz.score = null;
        quiz.completedAt = null;

        await quiz.save();

        res.status(200).json({
            success: true,
            message: 'Quiz reset successfully'
        });
    } catch (error) {
        next(error);
    }
};

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat, BorderStyle } from 'docx';

// @desc Export all quizzes for a document as a Word file
// @route GET /api/quizzes/:documentId/export
// @access Private

export const exportQuizzesToDocx = async (req, res, next) => {
    try {
        const quizzes = await Quiz.find({
            userId: req.user._id,
            documentId: req.params.documentId
        }).sort({ createdAt: -1 });

        if (!quizzes.length) {
            return res.status(404).json({
                success: false,
                error: 'No quizzes found for this document',
                statusCode: 404
            });
        }

        const optionLabels = ['A', 'B', 'C', 'D'];
        const children = [];

        // Document Title
        children.push(
            new Paragraph({
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 0, after: 300 },
                children: [new TextRun({ text: 'Quiz Export', bold: true, size: 36, font: 'Arial' })]
            })
        );

        quizzes.forEach((quiz, quizIndex) => {
            // Quiz title heading
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
                            color: '1a1a2e'
                        })
                    ]
                })
            );

            // Quiz meta
            children.push(
                new Paragraph({
                    spacing: { before: 0, after: 300 },
                    children: [
                        new TextRun({
                            text: `Total Questions: ${quiz.totalQuestions}   |   Score: ${quiz.score ?? 'Not attempted'}%`,
                            size: 20,
                            font: 'Arial',
                            color: '6b7280',
                            italics: true
                        })
                    ]
                })
            );

            quiz.questions.forEach((q, qIndex) => {
                // Question
                children.push(
                    new Paragraph({
                        spacing: { before: 280, after: 120 },
                        children: [
                            new TextRun({
                                text: `Q${qIndex + 1}. ${q.question}`,
                                bold: true,
                                size: 22,
                                font: 'Arial',
                                color: '111827'
                            })
                        ]
                    })
                );

                // Options
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
                                    color: '374151'
                                }),
                                
                            ]
                        })
                    );
                });

                // Correct Answer label
                children.push(
                    new Paragraph({
                        spacing: { before: 140, after: 60 },
                        indent: { left: 480 },
                        children: [
                            new TextRun({ text: 'Correct Answer: ', bold: true, size: 20, font: 'Arial', color: '059669' }),
                            new TextRun({ text: q.correctAnswer, size: 20, font: 'Arial', color: '059669' })
                        ]
                    })
                );

                // Explanation
                if (q.explanation) {
                    children.push(
                        new Paragraph({
                            spacing: { before: 60, after: 160 },
                            indent: { left: 480 },
                            children: [
                                new TextRun({ text: 'Explanation: ', bold: true, size: 20, font: 'Arial', color: '6366f1' }),
                                new TextRun({ text: q.explanation, size: 20, font: 'Arial', color: '6b7280', italics: true })
                            ]
                        })
                    );
                }

                // Divider between questions
                children.push(
                    new Paragraph({
                        spacing: { before: 100, after: 100 },
                        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'e5e7eb', space: 1 } },
                        children: [new TextRun({ text: '' })]
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
                        paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 }
                    },
                    {
                        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
                        run: { size: 28, bold: true, font: 'Arial', color: '1a1a2e' },
                        paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 1 }
                    }
                ]
            },
            sections: [{
                properties: {
                    page: {
                        size: { width: 12240, height: 15840 },
                        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
                    }
                },
                children
            }]
        });

        const buffer = await Packer.toBuffer(doc);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', 'attachment; filename="quizzes.docx"');
        res.send(buffer);

    } catch (error) {
        next(error);
    }
};