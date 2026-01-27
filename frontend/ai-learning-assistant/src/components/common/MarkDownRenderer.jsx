import React from 'react';
import ReactMarkDown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MarkDownRenderer = ({ content }) => {
    return (
        // Added max-width, padding, and font smoothing for better readability
        <div className="max-w-4xl mx-auto p-6 text-gray-800 leading-relaxed antialiased">
            <ReactMarkDown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Typography Scaling & Spacing
                    h1: ({ node, ...props }) => <h1 className="text-4xl font-bold mt-8 mb-4 border-b pb-2" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-3xl font-semibold mt-6 mb-3 border-b pb-1" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-2xl font-medium mt-5 mb-2" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="text-xl font-medium mt-4 mb-2" {...props} />,
                    
                    // Body Text
                    p: ({ node, ...props }) => <p className="mb-4 text-base leading-7" {...props} />,
                    
                    // Links & Lists
                    a: ({ node, ...props }) => <a className="text-blue-600 hover:underline transition-colors" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    
                    // Styling Elements
                    strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                    em: ({ node, ...props }) => <em className="italic" {...props} />,
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-gray-300 pl-4 py-1 my-4 italic text-gray-600 bg-gray-50" {...props} />
                    ),
                    
                    // Code Blocks & Inline Code
                    code: ({ node, inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || ''); // Fixed typo: .exece -> .exec
                        return !inline && match ? (
                            <div className="rounded-lg overflow-hidden my-6 shadow-md">
                                <SyntaxHighlighter
                                    style={dracula}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{ margin: 0, padding: '1.5rem' }}
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            <code className="bg-gray-100 text-red-500 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                {children}
                            </code>
                        );
                    },
                    pre: ({ node, ...props }) => <pre className="bg-transparent" {...props} /> 
                }}
            >
                {content}
            </ReactMarkDown>
        </div>
    );
}

export default MarkDownRenderer;