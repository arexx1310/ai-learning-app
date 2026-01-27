import React, { useEffect } from 'react';
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
  // Prevent scrolling on the body when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // If not open, do not render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      
      {/* Backdrop with Blur */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ease-out"
        onClick={onClose}
      />

      {/* Modal Content Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl shadow-slate-900/20 transform transition-all duration-300 ease-out animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
        
        {/* Header (Fixed at top of modal) */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white/50 rounded-t-2xl">
          <h3 className="text-xl font-bold text-slate-800">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
        
      </div>
    </div>
  );
};

export default Modal;