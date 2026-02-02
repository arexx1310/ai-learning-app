import React, { useState, useEffect } from 'react';
import { Plus, Upload, Trash2, FileText, X, AlertCircle, Loader2 } from "lucide-react"
import toast from "react-hot-toast";
import documentService from '../../services/documentService';
import Spinner from "../../components/common/Spinner";
import Button from '../../components/common/Button';
import DocumentCard from '../../components/documents/DocumentCard';
import PageHeader from '../../components/common/PageHeader';

const DocumentListPage = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTitle, setUploadTitle] = useState("");
    const [uploading, setUploading] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);

    const fetchDocuments = async () => {
        try {
            const data = await documentService.getDocuments();
            setDocuments(data || []);
        } catch (error) {
            toast.error("Failed to fetch documents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadFile(file);
            setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile || !uploadTitle) {
            toast.error("Please provide a title and select a file");
            return;
        }
        setUploading(true);
        const formData = new FormData();
        formData.append("file", uploadFile);
        formData.append("title", uploadTitle);

        try {
            await documentService.uploadDocument(formData);
            toast.success("Document uploaded successfully!");
            setIsUploadModalOpen(false);
            setUploadFile(null);
            setUploadTitle("");
            fetchDocuments();
        } catch (error) {
            toast.error(error.message || "Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteRequest = (doc) => {
        setSelectedDoc(doc);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDoc) return;
        setDeleting(true);
        try {
            await documentService.deleteDocument(selectedDoc._id);
            toast.success(`'${selectedDoc.title}' deleted.`);
            setIsDeleteModalOpen(false); 
            setSelectedDoc(null);
            setDocuments(documents.filter((d) => d._id !== selectedDoc._id));
        } catch (error) {
            toast.error(error.message || "Failed to delete document.");
        } finally {
            setDeleting(false);
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Spinner/>
                    <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading library...</p>
                </div>
            );
        }

        if (documents.length === 0) {
            return (
                <div className="mx-auto max-w-lg mt-10 p-10 text-center border-2 border-dashed border-slate-200 rounded-4xl bg-white shadow-sm">
                    <div className="inline-flex p-5 bg-blue-50 rounded-full mb-6">
                        <FileText className="w-12 h-12 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">Your library is empty</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Upload your lecture notes, PDFs, or textbooks to generate AI-powered flashcards and quizzes.
                    </p>
                    <Button onClick={() => setIsUploadModalOpen(true)} className="w-full sm:w-auto px-8 py-4 shadow-lg shadow-blue-200">
                        <Plus className="mr-2" /> Upload First Document
                    </Button>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {documents.map((doc) => (
                    <DocumentCard
                        key={doc._id}
                        document={doc}
                        onDelete={handleDeleteRequest}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Background Decor */}
            <div className="fixed inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                    <PageHeader 
                        title="My Documents"
                        subtitle={`${documents.length} in your collection.`}
                    />
                    <Button 
                        onClick={() => setIsUploadModalOpen(true)} 
                        className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 group"
                    >
                        <Plus className="mr-2 group-hover:rotate-90 transition-transform" />
                        <span className="font-bold uppercase tracking-wider text-xs">New Document</span>
                    </Button>
                </div>

                {renderContent()}
            </div>

            {isUploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-300">
                        
                        {/* Close Button */}
                        <button
                            onClick={() => setIsUploadModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                        >
                            <X size={20} strokeWidth={2.5} />
                        </button>

                        {/* Modal Header */}
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                Upload New Document
                            </h2>
                            <p className="text-slate-500 text-sm mt-1 font-medium">
                                Add a PDF document to your library to generate AI materials.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleUpload} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">
                                    Document Title
                                </label>
                                <input
                                    type="text"
                                    value={uploadTitle}
                                    onChange={(e) => setUploadTitle(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all font-medium"
                                    placeholder="e.g. React Interview Prep"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">
                                    PDF File
                                </label>
                                <div className="relative group">
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        onChange={handleFileChange}
                                        accept=".pdf"
                                    />
                                    <div className={`
                                        border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
                                        ${uploadFile 
                                            ? 'border-blue-400 bg-blue-50/30' 
                                            : 'border-slate-200 bg-slate-50 group-hover:border-blue-300 group-hover:bg-slate-100/50'}
                                    `}>
                                        <div className="inline-flex items-center justify-center p-3 bg-white rounded-xl shadow-sm text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">
                                            <Upload size={24} strokeWidth={2.5} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">
                                            {uploadFile ? (
                                                <span className="text-blue-600 break-all">
                                                    {uploadFile.name}
                                                </span>
                                            ) : (
                                                "Click to upload or drag and drop"
                                            )}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-2 font-medium">
                                            PDF documents up to 10 MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadModalOpen(false)}
                                    disabled={uploading}
                                    className="flex-1 px-6 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 sm:flex-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        "Upload Document"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="relative bg-white w-full max-w-md rounded-4xl shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-300">
                        
                        {/* Close button */}
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                        >
                            <X size={20} strokeWidth={2.5} />
                        </button>

                        {/* Modal Header */}
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-50 text-red-500 rounded-2xl mb-6 animate-bounce-short">
                                <Trash2 size={32} strokeWidth={2.5} />
                            </div>
                            
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
                                Confirm Deletion
                            </h2> 

                            {/* Content */}
                            <p className="text-slate-500 leading-relaxed mb-8">
                                Are you sure you want to delete <span className="font-bold text-slate-800 break-all underline decoration-red-200">
                                    "{selectedDoc?.title}"
                                </span>? This action is permanent and cannot be undone.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    disabled={deleting}
                                    className="flex-1 px-6 py-3.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                                >
                                    Keep Document
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={deleting}
                                    className="flex-1 px-6 py-3.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Deleting...</span>
                                        </>
                                    ) : (
                                        "Yes, Delete"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentListPage;