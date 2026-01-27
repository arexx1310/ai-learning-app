import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import documentService from '../../services/documentService';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Tabs from '../../components/common/Tabs';
import ChatInterface from '../../components/chat/ChatInterface';
import AIActions from '../../components/ai/AIActions';
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
 
  // Helper functiont to get the full PDF URL
  const getPdfUrl = () => {
    if(!document?.data?.filePath) return null;

    const filePath = document.data.filePath;
    
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    return `${baseUrl}${filePath.startsWith('/') ? '':'/'}${filePath}`;
  };

  /* ---------------- TAB RENDERERS ---------------- */
  const renderContent = () => {
    if (loading) {
        return <Spinner/>

    }
    if (!document || !document.data || !document.data.filePath) {
        return <div className="">PDF not available</div>
    }

    const pdfUrl = getPdfUrl();

    return (
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Document Viewer
          </span>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-bold transition-all hover:scale-105"
          >
            <ExternalLink size={16} strokeWidth={2.5} />
            Open in new tab
          </a>
        </div>

        <div className="bg-slate-200 p-2 md:p-4">
          <iframe
            src={pdfUrl}
            className="w-full h-[75vh] bg-white rounded-2xl shadow-inner"
            title="PDF Viewer"
            style={{
                colorScheme: 'light',
            }}
          />
        </div>
      </div>
    );
  };

const renderChat = () => {
    return <ChatInterface/>
};

  const renderAIActions = () => {
    return <AIActions/>
  };

  const renderFlashcardsTab = () => {
    <div className="p-6">Flashcards coming soon 🧠</div>
  };

  const renderQuizzesTab = () => {
    <div className="p-6">Quizzes coming soon 📝</div>
  };

  /* ---------------- TABS CONFIG ---------------- */

  const tabs = [
    { name: 'Content', label: 'Content', content: renderContent() },
    { name: 'Chat', label: 'Chat', content: renderChat() },
    { name: 'AI Actions', label: 'AI Actions', content: renderAIActions() },
    { name: 'Flashcards', label: 'Flashcards', content: renderFlashcardsTab() },
    { name: 'Quizzes', label: 'Quizzes', content: renderQuizzesTab() },
  ];

  /* ---------------- GLOBAL STATES ---------------- */

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
      <PageHeader title={document.title} />

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
