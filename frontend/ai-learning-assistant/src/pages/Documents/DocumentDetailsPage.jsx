import React, { useState, useEffect,useMemo} from 'react';
import { useParams, Link } from 'react-router-dom';
import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, FileText, BookOpen,ExternalLink  } from 'lucide-react';
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

  const fetchDocumentDetails = async () => {
    try {
        const response = await documentService.getDocumentById(id);
        setDocument(response);
      } catch (error) {
        toast.error('Failed to fetch document details.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchDocumentDetails();
    }, [id]);

    useEffect(() => {
      if (activeTab === 'PDF') {
        fetchDocumentDetails(); 
      }
    }, [activeTab]);

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

  const renderPDF = () => {
    const url = document?.data?.fileUrl;
    if (!url) {
      return <div className="p-8 text-center text-slate-500">No PDF available for preview.</div>;
    }

    return (
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <FileText className="text-emerald-600" size={20} strokeWidth={2.5} />
            <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">PDF Viewer</span>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Open in new tab <ExternalLink size={14} />
          </a>
        </div>
        <iframe
          src={url}
          title="Document Preview"
          width="100%"
          height="800px"
          className="border-none"
        />
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
    { name: 'PDF', label: 'PDF', content: renderPDF() },
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
