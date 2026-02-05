import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, FileText, BookOpen } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import ChatInterface from '../../components/chat/ChatInterface';
import AIActions from '../../components/ai/AIActions';
import FlashcardManager from '../../components/flashcards/FlashcardManager';
import QuizManager from '../../components/quizzes/QuizManager';

const DocumentDetailPage = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Content');

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (error) {
        toast.error('Failed to fetch document details.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  /* ---------------- TAB RENDERERS ---------------- */
  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }
    
    if (!document || !document.data || !document.data.extractedText) {
      return (
        <div className="text-center p-8 text-slate-500">
          No content available
        </div>
      );
    }

    const text = document.data.extractedText;
    const wordCount = text.split(/\s+/).length;
    const charCount = text.length;

    return (
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <FileText className="text-emerald-600" size={20} strokeWidth={2.5} />
            <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Extracted Content
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <BookOpen size={16} />
              <span>{wordCount.toLocaleString()} words</span>
            </div>
            <div className="text-slate-400">•</div>
            <div>{charCount.toLocaleString()} characters</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto bg-slate-50">
          <div className="prose prose-slate max-w-none">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
              <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed text-base">
                {text}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return <ChatInterface />;
  };

  const renderAIActions = () => {
    return <AIActions />;
  };

  const renderFlashcardsTab = () => {
    return <FlashcardManager documentId={id} />;
  };

  const renderQuizzesTab = () => {
    return <QuizManager documentId={id} />;
  };

  /* ---------------- TABS CONFIG ---------------- */
  const tabs = [
    { name: 'Content', label: 'Content', content: renderContent() },
    { name: 'Chat', label: 'Chat', content: renderChat() },
    { name: 'AI Actions', label: 'AI Actions', content: renderAIActions() },
    { name: 'Flashcards', label: 'Flashcards', content: renderFlashcardsTab() },
    { name: 'Quizzes', label: 'Quizzes', content: renderQuizzesTab() },
  ];

  /* ---------------- RENDER ---------------- */
  if (loading) {
    return <Spinner />;
  }

  if (!document) {
    return (
      <div className="text-center p-8 text-slate-500 font-medium">
        Document not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/documents"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Documents
      </Link>

      {/* Header */}
      <PageHeader title={document.data.title} />

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
};

export default DocumentDetailPage;
