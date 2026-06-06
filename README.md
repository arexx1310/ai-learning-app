# 📚 AI-Powered Learning Platform

An intelligent document-based learning platform that leverages Google's Gemini AI to help users study more effectively. Upload PDF documents and automatically generate flashcards, quizzes, summaries, and engage in interactive chat with your study materials.

## ✨ Features

### 🎯 Core Functionality
All AI features are powered by Google Gemini AI (`gemini-2.5-flash-lite`) ([See GeminiService on backedn here](backend/utils/geminiService.js)).

- **PDF Document Upload & Processing**: Securely upload PDF documents — text is automatically extracted, cleaned, and split into intelligent overlapping chunks ready for AI processing
- **Flashcard Generation**: Analyses your document and generates structured Q&A flashcards, each automatically tagged with a difficulty level (easy, medium, or hard)
- **Quiz Generation**: Produces contextual multiple-choice questions with four options, a correct answer, and an explanation — instantly scored on submission
- **Document Summarization**: Reads the full extracted text and returns a concise, structured summary highlighting the key concepts and main ideas
- **Chat with Documents**: Ask any question about your document — relevant chunks are retrieved and used as context, giving you accurate, document-grounded answers with persistent chat history
- **Concept Explainer**: Enter any concept and get a detailed explanation grounded in the most relevant sections of your document, with examples where applicable


### 📊 Learning Features
- **Progress Dashboard**: Track your learning statistics and study activity
- **Review System**: Mark flashcards as reviewed and track review counts
- **Starred Flashcards**: Bookmark important flashcards for quick access
- **Quiz Results & Analytics**: View detailed results with correct/incorrect answers and explanations
- **Study Streak Tracking**: Monitor your learning consistency

### 🔐 User Management
- Secure authentication with httpOnly cookies (XSS-safe — the token is never accessible to JavaScript)
- User profiles with customizable settings
- Password management and account security
- Protected routes and authorization

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Google Gemini AI (gemini-2.5-flash-lite)
- **Authentication**: JWT stored in httpOnly cookies
- **Password Hashing**: bcryptjs
- **PDF Processing**: pdf-parse
- **Rate Limiting**: express-rate-limit

### Frontend
- **Framework**: React 18
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios (with `withCredentials: true` for cookie transport)
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
# or for MongoDB Atlas:
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/learning-platform

# Maximum File Size
MAX_FILE_SIZE=10485760

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=2d

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
│   ├── flashcardController.js  # Flashcard controllers
│   ├── quizController.js       # Quiz logic
│   └── progressController.js   # Progress tracking controller
├── middleware/
│   ├── auth.js              # JWT authentication (reads httpOnly cookie)
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
frontend/ai-learning-assistant
├── src/
│   ├── utils/
│   │   ├── apiPaths.js      # API endpoint definitions
│   │   └── axiosInstances.js # Axios instance & interceptors
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
│   │       ├── aiService.js
│   │       ├── authService.js
│   │       ├── documentService.js
│   │       ├── flashcardService.js
│   │       ├── progressService.js
│   │       └── quizService.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
└── vite.config.js
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout (clears cookie)
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

- **httpOnly Cookies**: The JWT is stored in an httpOnly cookie — it is never accessible to JavaScript, eliminating the XSS token-theft vector that localStorage has
- **Secure & SameSite flags**: In production the cookie is `Secure` (HTTPS only) and `SameSite: none` to support cross-origin requests while blocking CSRF from third-party sites
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**:
  - API routes: 100 requests per 15 minutes
  - Auth routes: 20 attempts per 10 minutes
- **CORS Protection**: Configured allowed origins with `credentials: true`
- **NoSQL Injection Sanitization**: `req.body`, `req.params`, and `req.query` are sanitized on every request
- **Input Validation**: express-validator on all auth routes, Mongoose schema validation on all models
- **Helmet**: Security headers including Content Security Policy
- **Protected Routes**: Middleware-based authorization on all private endpoints

## 🎨 Key Features Explained

### Frontend Architecture

#### Service Layer Pattern
All API calls are abstracted into service modules. Errors are normalised to plain `Error` objects by the Axios interceptor, so every caller only needs to handle `err.message`:

```javascript
// Example: authService.js
const login = async (email, password) => {
  const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });
  return response.data;
};
```

**Available Services:**
- `authService` — Authentication & user management
- `documentService` — Document CRUD operations
- `aiService` — AI feature interactions
- `flashcardService` — Flashcard management
- `quizService` — Quiz operations
- `progressService` — Dashboard data

#### Axios Configuration
Centralised HTTP client. `withCredentials: true` is set globally so the httpOnly cookie is sent automatically on every request — no manual token handling required:

```javascript
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true, // sends the httpOnly cookie on every request
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Response interceptor — normalises all errors to plain Error objects
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, data } = error.response ?? {};
    // Redirect to login on 401, but only when not already on an auth page
    // (the session-restore call returns 401 for unauthenticated users — that's normal)
    const authPages = ['/login', '/register'];
    if (status === 401 && !authPages.includes(window.location.pathname)) {
      window.location.replace('/login');
    }
    return Promise.reject(
      new Error(data?.error || data?.message || 'Something went wrong. Please try again.')
    );
  }
);
```

#### Authentication Context
Global auth state management. Session is restored on mount by calling `GET /api/auth/profile` — the cookie is sent automatically by the browser. No localStorage involved:

```javascript
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session on page load — cookie sent automatically
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await axiosInstance.get(API_PATHS.AUTH.ME);
        setUser(data.data);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // Called after login — stores user in React state only.
  // The actual session is the httpOnly cookie set by the server.
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await axiosInstance.post(API_PATHS.AUTH.LOGOUT); // server clears the cookie
    setUser(null);
    setIsAuthenticated(false);
    window.location.replace('/login');
  };
};
```

#### Protected Routes
Route protection with automatic redirects. The `loading` state prevents a flash of the login page while the session-restore call is in flight:

```javascript
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? (
    <AppLayout><Outlet /></AppLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};
```

```jsx
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
  <Route path="/documents" element={<DocumentListPage />} />
  {/* Other protected routes */}
</Route>
```

#### Design System
Custom Tailwind CSS with glassmorphism and modern UI patterns:

**Color Palette:**
- Primary: Emerald/Teal gradient (`from-emerald-500 to-teal-500`)
- Background: Slate grays (`slate-50`, `slate-100`)
- Borders: Subtle slate borders with transparency
- Shadows: Layered shadow system for depth

**UI Patterns:**
- **Glassmorphism**: `bg-white/80 backdrop-blur-xl`
- **Smooth Animations**: `transition-all duration-200`
- **Hover States**: Scale transforms and shadow elevation
- **Focus Rings**: `focus:ring-4 focus:ring-emerald-500/20`
- **Gradient Buttons**: With shine effect on hover
- **Icon Integration**: Lucide React icons with consistent sizing

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

### Backend
- Centralised error middleware (`errorHandlers.js`)
- Graceful PDF parsing failures
- API timeout handling
- Database connection error recovery
- User-friendly error messages

### Frontend
- **Axios Interceptor**: Normalises all API errors into plain `Error` objects with a `.message` string — callers never need to inspect `error.response` directly
- **Service Layer**: No try/catch wrappers — errors propagate cleanly from the interceptor
- **Toast Notifications**: User-friendly error messages via react-hot-toast
- **Form Validation**: Client-side validation before API calls
- **Fallback UI**: Empty states for missing data
- **Network Error Detection**: Timeout and connection error handling

**Error flow example:**

```javascript
try {
  const data = await documentService.getDocuments();
  setDocuments(data);
} catch (err) {
  toast.error(err.message || 'Failed to fetch documents');
} finally {
  setLoading(false);
}
```

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

## 🗺️ Routing & Navigation

### Route Structure

**Public Routes:**
- `/login` — User login page
- `/register` — New user registration
- `/` — Redirects to `/dashboard` if authenticated, `/login` otherwise

**Protected Routes** (require authentication):
- `/dashboard` — Learning overview and statistics
- `/documents` — All uploaded documents
- `/documents/:id` — Single document detail view
- `/flashcards` — All flashcard sets
- `/documents/:id/flashcards` — Flashcards for specific document
- `/quizzes/:quizId` — Take a quiz
- `/quizzes/:quizId/results` — View quiz results
- `/profile` — User profile management
- `*` — 404 Not Found page

### Navigation Flow

1. **Unauthenticated user**:
   - Lands on `/` → redirected to `/login`
   - After login → redirected to `/dashboard`

2. **Authenticated user**:
   - Lands on `/` → redirected to `/dashboard`
   - Can access all protected routes
   - On logout → redirected to `/login`

3. **Session persistence**:
   - JWT is stored in an httpOnly cookie set by the server
   - On every page load, `AuthContext` calls `GET /api/auth/profile` — the browser sends the cookie automatically
   - No token handling in JavaScript; no localStorage reads on startup

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

## 🙏 Acknowledgments

### Core Technologies
- [Google Gemini AI](https://ai.google.dev/) — Powers all AI features (flashcards, quizzes, chat, summaries)
- [MongoDB](https://www.mongodb.com/) — NoSQL database for flexible data storage
- [Express.js](https://expressjs.com/) — Fast, minimalist backend framework
- [React](https://react.dev/) — Component-based frontend library
- [Node.js](https://nodejs.org/) — JavaScript runtime

### Key Libraries & Tools
- [Mongoose](https://mongoosejs.com/) — Elegant MongoDB object modeling
- [Vite](https://vitejs.dev/) — Next-generation frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [Lucide Icons](https://lucide.dev/) — Beautiful, consistent icon library
- [React Router](https://reactrouter.com/) — Client-side routing
- [Axios](https://axios-http.com/) — Promise-based HTTP client
- [React Hot Toast](https://react-hot-toast.com/) — Lightweight toast notifications
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) — Password hashing
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) — JWT authentication
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) — PDF text extraction
- [cookie-parser](https://www.npmjs.com/package/cookie-parser) — Cookie parsing middleware
- [helmet](https://www.npmjs.com/package/helmet) — Security headers

## 📧 Contact

For questions or support, please open an issue in the GitHub repository.

---

**Happy Learning! 🎓**