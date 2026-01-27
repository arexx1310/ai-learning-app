import React from 'react'

const Tabs = ({ tabs, activeTab, setActiveTab}) => {
    return (
        <div className="w-full">
            {/* Tab Navigation Wrapper */}
            <div className="relative border-b-2 border-slate-100">
                <nav className="flex gap-2">
                    {tabs.map((tab)=> (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`relative pb-4 px-6 text-sm font-bold transition-all duration-300 whitespace-nowrap outline-none ${
                                activeTab === tab.name
                                ? 'text-emerald-600'
                                : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <span className="relative z-10">{tab.label}</span>
                            
                            {/* Active Underline Indicator */}
                            {activeTab === tab.name && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-emerald=500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/25"/>
                            )}
                            
                            {/* Subtle hover background */}
                            <div className="absolute inset-0 bg-linear-to-b from-emerald-50/50 to-transparent rounded-t-xl -z-10" />
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content Area */}
            <div className="py-6">
                {tabs.map((tab) => {
                    if (tab.name === activeTab) {
                        return (
                            <div
                                key={tab.name}
                                className="animate-in fade-in duration-300"
                            >
                                {tab.content}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    )
}

export default Tabs;