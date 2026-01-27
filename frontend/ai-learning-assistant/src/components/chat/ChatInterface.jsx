import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Sparkles, User, Bot } from 'lucide-react';
import { useParams } from 'react-router-dom';
import aiService from '../../services/aiService.js';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../common/Spinner';
import MarkDownRenderer from '../common/MarkDownRenderer';

const ChatInterface = () => {
    const { id: documentId } = useParams();
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                setInitialLoading(true);
                const response = await aiService.getChatHistory(documentId);
                setHistory(response.data);
            } catch (error) {
                console.error('Failed to fetch chat history:', error);
            } finally {
                setInitialLoading(false);
            }
        };
        fetchChatHistory();
    }, [documentId]);

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        const userMessage = { role: 'user', content: message, timestamp: new Date() };
        setHistory(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);

        try {
            const response = await aiService.chat(documentId, userMessage.content);
            const assistantMessage = {
                role: 'assistant',
                content: response.data.answer,
                timestamp: new Date(),
                relevantChunks: response.data.relevantChunks
            };
            setHistory(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat Error:', error);
            setHistory(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = (msg, index) => {
        const isUser = msg.role === 'user';
        return (
            <div key={index} className={`flex items-start gap-3 my-4 ${isUser ? 'flex-row-reverse' : ''}`}> 
                {!isUser && (
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-white" strokeWidth={2}/>
                    </div>
                )}
                <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                    isUser
                    ? 'bg-linear-to-br from-emerald-500 to-teal-500 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200/60 text-slate-800 rounded-tl-none'
                }`}>
                    {isUser ? (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                        <div className="prose prose-sm max-w-none prose-slate">
                            <MarkDownRenderer content={msg.content}/>
                        </div>
                    )}
                </div>
                {isUser && (
                    <div className="w-9 h-9 rounded-xl bg-linear-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-700 font-semibold text-sm shrink-0 shadow-sm">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                )}
            </div>
        );
    };

    if (initialLoading) {
        return (
            <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl items-center justify-center shadow-xl shadow-slate-200/50">
                <Spinner />
                <p className="text-sm text-slate-500 mt-3 font-medium">Loading chat history...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
            
           
            <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 bg-linear-to-br from-slate-50/50 via-white/50 to-slate-50/50">
                {history && history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
                            <MessageSquare className="w-8 h-8 text-emerald-600" strokeWidth={2} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Start a conversation</h3>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">Ready to analyze your file. Ask a question.</p>
                    </div>
                ) : (
                    <div className="space-y-6 pb-4">
                        {history && history.map(renderMessage)}
                        
                        {loading && (
                            <div className="flex items-center gap-3 my-4">
                                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2}/>
                                </div>
                                <div className="bg-emerald-50/50 border border-emerald-100 px-3 py-2 rounded-xl rounded-tl-none flex items-center">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                                    </div> 
                                </div>
                            </div>
                        )}
                        {/* Invisible element to scroll to */}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div> 

            {/* Input Area */}
            <div className="bg-white border-t border-slate-100 pb-6 pt-4 px-4">
                <div className="max-w-3xl mx-auto">
                    <form 
                        onSubmit={handleSendMessage} 
                        className="relative flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all duration-200"
                    >
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask a question..."
                            className="flex-1 pl-3 pr-2 py-2 text-sm bg-transparent outline-none disabled:opacity-50 text-slate-700 placeholder:text-slate-400"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !message.trim()} 
                            className={`p-2 rounded-xl transition-all duration-200 shrink-0
                                ${loading || !message.trim() 
                                    ? 'text-slate-300 bg-slate-50' 
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:scale-95'
                                }`}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" strokeWidth={2.5} />
                            )}
                        </button>
                    </form>
                    <p className="text-center text-[10px] text-slate-400 mt-3 font-medium tracking-wide uppercase">
                        Powered by AI
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ChatInterface;