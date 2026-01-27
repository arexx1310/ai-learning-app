import React from 'react'

const PageHeader = ({ title, subtitle, children }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
            <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-slate-500 font-medium italic">
                        {subtitle}
                    </p>
                )}
            </div>
            
            {/* This will render any buttons or search bars on the right */}
            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </div>
    )
}

export default PageHeader;