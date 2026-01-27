import React, { useState } from 'react';
import { useParams } from "react-router-dom";
import { Sparkles, BookOpen, Lightbulb, X, ChevronRight, Zap, SettingsIcon } from 'lucide-react'; // Added X and Loader2
import aiService from "../../services/aiService";
import toast from "react-hot-toast";
import MarkDownRenderer from '../common/MarkDownRenderer';
import Modal from '../common/Modal';
const AIActions = () => {
    const {id: documentId} = useParams();
    const [loadingAction, setLoadingAction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [concept, setConcept] = useState("");

    const handleGenerateSummary = async () => {
        setLoadingAction("summary");
        try {
            const { summary } = await aiService.generateSummary(documentId);
            setModalTitle("Generated Summary");
            setModalContent(summary);
            setIsModalOpen(true);
        } catch (error) {
            toast.error("Failed to generate summary.");
        } finally {
            setLoadingAction(null);
        }
    };

    const handleExplainConcept = async (e) => {
        e.preventDefault();
        if (!concept.trim()) {
            toast.error("Please enter a concept to explain.");
            return;
        }
        setLoadingAction("explain");
        try {
            const { explanation } = await aiService.explainConcept(documentId, concept);
            setModalTitle(`Explanation of "${concept}"`);
            setModalContent(explanation);
            setIsModalOpen(true);
            setConcept("");
        } catch (error) {
            toast.error("Failed to explain concept.");
        } finally {
            setLoadingAction(null);
        }
    };

  return (
    <div className="w-full mx-auto p-4 md:p-0">
      <div className="relative group overflow-hidden bg-white/80 backdrop-blur-2xl border border-emerald-200/50 rounded-4xl shadow-2xl transition-all duration-500 hover:shadow-emerald-200/20">
        {/* Header Section */}
        <div className="relative px-6 py-8 border-b border-white/40 bg-linear-to-br from-emerald-600 to-cyan-600 overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Zap className="w-20 h-20 text-white rotate-12" />
          </div>
          <div className="relative flex items-center gap-5">
            <div className="p-3.5 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 shadow-inner">
              <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5}/>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white tracking-tight">
                AI Assistant
              </h3>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                <p className="text-sm text-emerald-50/80 font-medium">
                  Smart insights • Ready to help
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6  mx-auto">
          {/* Action 1: Summary Card (Blue Theme) */}
          <div className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-sky-200/40 hover:-translate-y-1 hover:border-sky-200 transition-all duration-300 ease-out">
            <div className="flex gap-5 items-center">
              {/* Icon: Pastel Gradient (Sky to Soft Blue) */}
              <div className="shrink-0 p-4 rounded-xl bg-linear-to-br from-sky-300 to-blue-400 shadow-lg shadow-sky-300/30 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              
              <div>
                {/* Title Hover: Soft Sky Blue */}
                <h4 className="text-lg font-bold text-slate-800 group-hover:text-sky-500 transition-colors">
                  Generate Summary
                </h4>
                <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                  Extract concise summary of the document.
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateSummary}
              disabled={loadingAction === "summary"}
              // Button: Dark default -> Baby Blue hover
              className="w-full sm:w-auto mt-5 sm:mt-0 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl bg-slate-900 hover:bg-sky-400 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-sky-300/30"
            >
              {loadingAction === "summary" ? (
                <span className="flex items-center gap-2">
                  <span className="animate-pulse">Thinking...</span>
                </span>
              ) : (
                <>Summarize <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>

          {/* Action 2: Explain Concept Card (Yellow/Amber Theme) */}
          <div className="p-1 rounded-2xl bg-linear-to-b from-white to-amber-50/50 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300">
            <div className="p-6 space-y-4">
              
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-100 text-amber-600 ring-1 ring-amber-500/20 shadow-sm">
                  <Lightbulb className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800">Explain Concept</h4>
                  <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                    Enter a topic or concept from the document to get a detailed explanation.
                  </p>
                </div>
              </div>

              {/* Input Area */}
              <form onSubmit={handleExplainConcept} className="relative flex flex-col sm:flex-row gap-3 pt-2">
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="e.g. Quantum Entanglement"
                  className="flex-1 text-sm font-medium text-slate-700 px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 placeholder:text-slate-400 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all duration-200 ease-out"
                />
                <button
                  type="submit"
                  disabled={loadingAction === "explain" || !concept}
                  className="px-6 py-3.5 text-sm font-bold rounded-xl bg-linear-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 active:scale-95 transition-all duration-200 shadow-lg shadow-orange-500/20 disabled:grayscale disabled:opacity-50 disabled:shadow-none"
                >
                  {loadingAction === "explain" ? "Thinking..." : "Explain"}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* Modal Implementation */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        {/* Content Container */}
        <div className="prose prose-sm sm:prose-base max-w-none text-slate-600 prose-headings:font-bold prose-headings:text-slate-800 prose-a:text-blue-600 prose-strong:text-slate-700">
          {loadingAction === "summary" || loadingAction === "explain" ? (
            // Optional: A skeleton loader or loading text inside the modal if needed
            <div className="flex items-center gap-2 text-slate-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                Generating response...
            </div>
          ) : (
            <MarkDownRenderer content={modalContent} />
          )}
        </div>
      </Modal>
    </div>
  );
}

export default AIActions;