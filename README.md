# 📚 AI-Powered Learning Platform

An intelligent document-based learning platform that leverages Google's Gemini AI to help users study more effectively. Upload PDF documents and automatically generate flashcards, quizzes, summaries, and engage in interactive chat with your study materials.

## ✨ Features

### 🎯 Core Functionality
- **PDF Document Upload & Processing**: Upload and parse PDF documents with automatic text extraction and intelligent chunking
- **AI-Powered Flashcard Generation**: Create customized flashcards with difficulty levels (easy, medium, hard)
- **Interactive Quiz System**: Generate multiple-choice quizzes with explanations and instant scoring
- **Document Summarization**: Get concise summaries highlighting key concepts and main ideas
- **Chat with Documents**: Ask questions about your documents and receive context-aware answers
- **Concept Explanation**: Deep-dive into specific concepts with AI-generated explanations

### 📊 Learning Features
- **Progress Dashboard**: Track your learning statistics and study activity
- **Review System**: Mark flashcards as reviewed and track review counts
- **Starred Flashcards**: Bookmark important flashcards for quick access
- **Quiz Results & Analytics**: View detailed results with correct/incorrect answers and explanations
- **Study Streak Tracking**: Monitor your learning consistency

### 🔐 User Management
- Secure authentication with JWT tokens
- User profiles with customizable settings
- Password management and account security
- Protected routes and authorization

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Google Gemini AI (gemini-2.5-flash-lite)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **PDF Processing**: pdf-parse
- **Rate Limiting**: express-rate-limit

### Frontend
- **Framework**: React 18
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS 
- **State Management**: React Context API

## 📋 Prerequisites

Before running this project, ensure you have:

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Google Gemini API Key ([Get it here](https://ai.google.dev/))
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-learning-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
touch .env
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory with the following:

```env
# Server Configuration
NODE_ENV=development
PORT=8000

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/learning-platform
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/learning-platform

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend/ai-learning-assistant

# Install dependencies
npm install

# Create .env file
touch .env
```

Create a `.env` file in the frontend directory:

```env
VITE_BACKEND_URL=http://localhost:8000
```

### 5. Create Upload Directories

```bash
# In backend directory
mkdir -p uploads/documents
```

## 🎮 Running the Application

### Start Backend Server

```bash
# In backend directory
npm run dev
# or
npm start
```

The server will start on `http://localhost:8000`

### Start Frontend Development Server

```bash
# In frontend directory
npm run dev
```

The application will open at `http://localhost:5173`

## 📁 Project Structure

### Backend Structure

```
backend/
├── config/
    ├── db.js                # MongoDB connection
│   └── multer.js            # Multer Configuration    
├── controllers/
│   ├── aiController.js         # AI feature controllers
│   ├── authController.js       # Authentication logic
│   ├── documentController.js   # Document management
│   ├── flashcardController.js  #Flashcard Controllers
│   ├── quizController.js       #Quiz Logic
│   └── progressController.js   #Progress Tracking Controller
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── errorHandlers.js     # Error handling
├── models/
│   ├── User.js
│   ├── Document.js
│   ├── Flashcard.js
│   ├── Quiz.js
│   └── ChatHistory.js
├── routes/
│   ├── authRoutes.js
│   ├── documentRoutes.js
│   ├── flashcardRoutes.js
│   ├── aiRoutes.js
│   ├── quizRoutes.js
│   └── progressRoutes.js
├── utils/
│   ├── geminiService.js     # Gemini AI integration
│   ├── pdfParser.js         # PDF text extraction
│   └── textChunker.js       # Text chunking & search
├── uploads/                 # File storage
├── server.js               # Entry point
├── package-lock.json
└── package.json
```

### Frontend Structure

```
frontend/ai=learning-assistant
├── src/
│   ├── utils/
│   │   ├── apiPaths.js      # API endpoint definitions
│   │   └── axiosConfig.js   # Axios instance & interceptors
│   ├── components/
│   │   └── ai/
│   │       └── AIActions.jsx
│   │   └── auth/
│   │       └── ProtectedRoutes.jsx
│   │   └── chat/
│   │       └── ChatInterface.jsx
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── EmptyState.jsx
│   │       ├── MarkDownRender.jsx
│   │       ├── Modal.jsx
│   │       ├── PageHeader.jsx
│   │       ├── Spinner.jsx
│   │       └── Tabs.jsx
│   │   └── documents/
│   │       └── DocumentCard.jsx
│   │   └── flashcards/
│   │       ├── Flashcard.jsx
│   │       ├── FlashcardManager.jsx
│   │       └── FlashcardSetCard.jsx
│   │   └── layout/
│   │       ├── AppLayout.jsx
│   │       ├── Header.jsx
│   │       └── Sidebar.jsx
│   │   └── quizzes/
│   │       ├── QuizCard.jsx
│   │       └── QuizManager.jsx
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication state
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── Dashboard/
│   │   │   └── DashboardPage.jsx
│   │   ├── Documents/
│   │   │   ├── DocumentListPage.jsx
│   │   │   └── DocumentDetailsPage.jsx
│   │   ├── Flashcards/
│   │   │   ├── FlashcardsPage.jsx
│   │   │   └── FlashcardsListPage.jsx
│   │   ├── Quizzes/
│   │   │   ├── QuizTakePage.jsx
│   │   │   └── QuizResultPage.jsx
│   │   ├── Profile/
│   │   │   └── ProfilePage.jsx
│   │   └── NotFoundPage.jsx
│   ├── services/
│   │       ├── aiService.jsx
│   │       ├── authService.jsx
│   │       ├── documentService.jsx
│   │       ├── flashcardService.jsx
│   │       ├── progressService.jsx
│   │       └── quizService.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
├──.gitignore
├──README.md
├──eslint.config.js
├──index.html
├──package-lock.json
├──package.json
└──vite.config.js
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)
- `POST /api/auth/change-password` - Change password (Protected)

### Documents
- `POST /api/documents/upload` - Upload PDF document
- `GET /api/documents` - Get all user documents
- `GET /api/documents/:id` - Get single document
- `DELETE /api/documents/:id` - Delete document

### AI Features
- `POST /api/ai/generate-flashcards` - Generate flashcards from document
- `POST /api/ai/generate-quiz` - Generate quiz questions
- `POST /api/ai/generate-summary` - Generate document summary
- `POST /api/ai/chat` - Chat with document
- `POST /api/ai/explain-concept` - Explain specific concept
- `GET /api/ai/chat-history/:documentId` - Get chat history

### Flashcards
- `GET /api/flashcards` - Get all flashcard sets
- `GET /api/flashcards/:documentId` - Get flashcards for document
- `POST /api/flashcards/:cardId/review` - Mark card as reviewed
- `PUT /api/flashcards/:cardId/star` - Toggle star on card
- `DELETE /api/flashcards/:id` - Delete flashcard set

### Quizzes
- `GET /api/quizzes/:documentId` - Get quizzes for document
- `GET /api/quizzes/quiz/:id` - Get single quiz
- `POST /api/quizzes/:id/submit` - Submit quiz answers
- `GET /api/quizzes/:id/results` - Get quiz results
- `DELETE /api/quizzes/:id` - Delete quiz

### Progress
- `GET /api/progress/dashboard` - Get learning dashboard data

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: 
  - API routes: 100 requests per 15 minutes
  - Auth routes: 5 attempts per 10 minutes
- **CORS Protection**: Configured allowed origins
- **Input Validation**: Mongoose schema validation
- **Protected Routes**: Middleware-based authorization

## 🎨 Key Features Explained

### Document Chunking
Documents are intelligently split into chunks for better AI processing:
- **Chunk Size**: 500 words (configurable)
- **Overlap**: 50 words between chunks
- **Smart Splitting**: Preserves paragraph structure
- **Relevance Scoring**: Keyword-based chunk retrieval for Q&A

### AI Generation
Using Google Gemini 2.5 Flash Lite:
- **Flashcards**: Q&A format with difficulty levels
- **Quizzes**: 4-option multiple choice with explanations
- **Summaries**: Concise key points extraction
- **Chat**: Context-aware responses using relevant chunks
- **Explanations**: In-depth concept breakdowns

### Progress Tracking
- Total documents, flashcards, and quizzes
- Review statistics
- Average quiz scores
- Recent activity feed
- Study streak counting

## 🐛 Error Handling

The application includes comprehensive error handling:
- Centralized error middleware
- Graceful PDF parsing failures
- API timeout handling (10s)
- Database connection error recovery
- User-friendly error messages

## 📊 Database Models

### User
- username, email, password (hashed)
- profileImage
- timestamps

### Document
- userId, title, fileName, filePath, fileSize
- extractedText, chunks[]
- status: processing | ready | failed
- uploadDate, lastAccessed

### Flashcard
- userId, documentId
- cards[] with question, answer, difficulty
- review tracking (lastReviewed, reviewCount)
- isStarred flag

### Quiz
- userId, documentId, title
- questions[] with options, correctAnswer, explanation
- userAnswers[], score, totalQuestions
- completedAt timestamp

### ChatHistory
- userId, documentId
- messages[] with role, content, timestamp
- relevantChunks tracking

## 🚧 Future Enhancements

- [ ] Spaced repetition algorithm for flashcards
- [ ] Export flashcards/quizzes to PDF
- [ ] Collaborative study groups
- [ ] Mobile app (React Native)
- [ ] Support for more file formats (DOCX, TXT)
- [ ] Advanced analytics and insights
- [ ] Email notifications for study reminders
- [ ] Social sharing features
- [ ] Dark mode support

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powering the AI features
- [MongoDB](https://www.mongodb.com/) for the database
- [Express.js](https://expressjs.com/) for the backend framework
- [React](https://react.dev/) for the frontend framework

## 📧 Contact

For questions or support, please open an issue in the GitHub repository.

---

**Happy Learning! 🎓**
