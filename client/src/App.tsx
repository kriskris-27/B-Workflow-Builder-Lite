import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
import { PlusCircle, LayoutDashboard, Activity as PulseIcon, Sidebar, ArrowLeft } from 'lucide-react';

import HistorySidebar from './components/HistorySidebar';
import StatusPage from './components/StatusPage';
import WorkflowCreator from './components/WorkflowCreator';
import RunDashboard from './components/RunDashboard';


export default function App() {
    const [view, setView] = useState<'dashboard' | 'creator' | 'run' | 'status'>('dashboard');
    const [showHistory, setShowHistory] = useState(true);
    const [userId, setUserId] = useState<string>('');
    const [apiOk, setApiOk] = useState<boolean | null>(null);
    const [dbOk, setDbOk] = useState<boolean | null>(null);
    const [geminiStatus, setGeminiStatus] = useState<'connected' | 'error' | 'rate_limited' | 'checking'>('checking');

    // Selected workflow for RunDashboard
    const [activeWorkflow, setActiveWorkflow] = useState<{ name: string, steps: any[] } | null>(null);
    const [activeRun, setActiveRun] = useState<{ input: string, result: string | null } | null>(null);

    useEffect(() => {
        // Initialize User ID
        let id = localStorage.getItem('aggrosso_user_id');
        if (!id) {
            id = crypto.randomUUID();
            localStorage.setItem('aggrosso_user_id', id);
        }
        setUserId(id);

        const checkHealth = async () => {
            try {
                const apiRes = await fetch(`${API_URL}/health`);
                setApiOk(apiRes.ok);
            } catch { setApiOk(false); }

            try {
                const dbRes = await fetch(`${API_URL}/health/db`);
                setDbOk(dbRes.ok);
            } catch { setDbOk(false); }

            if (geminiStatus !== 'connected') {
                try {
                    const geminiRes = await fetch(`${API_URL}/health/gemini`);
                    const data = await geminiRes.json();
                    if (data.ok) setGeminiStatus('connected');
                    else if (data.status === 'rate_limited') {
                        setGeminiStatus('rate_limited');
                        console.warn("Gemini Rate Limit hit. Polling paused.");
                    } else setGeminiStatus('error');
                } catch { setGeminiStatus('error'); }
            }
        };

        checkHealth();
        const interval = setInterval(() => {
            if (geminiStatus !== 'connected') checkHealth();
        }, 15000);
        return () => clearInterval(interval);
    }, [geminiStatus]);

    const handleRunWorkflow = (name: string, steps: any[]) => {
        setActiveWorkflow({ name, steps });
        setActiveRun(null); // Clear active run when starting a new one
        setView('run');
    };

    const handleSelectRun = async (run: any) => {
        // Fetch the workflow details for this run
        try {
            const res = await fetch(`${API_URL}/api/workflows/${run.workflow_id}`);
            if (res.ok) {
                const workflow = await res.json();
                setActiveWorkflow({ name: workflow.name, steps: workflow.steps });
                setActiveRun({ input: run.input_data, result: run.output_data });
                setView('run');
            }
        } catch (err) {
            console.error("Failed to fetch workflow for run", err);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30 font-sans flex overflow-hidden">
            {/* Background Gradient Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            {/* Main Navigation Sidebar */}
            <nav className="w-20 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col items-center py-8 gap-8 z-50">
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20 mb-4">
                    W
                </div>

                <div className="flex flex-col gap-4 flex-1">
                    <NavIcon icon={LayoutDashboard} active={view === 'dashboard'} onClick={() => setView('dashboard')} label="Home" />
                    <NavIcon icon={PlusCircle} active={view === 'creator'} onClick={() => setView('creator')} label="Create" />
                    <NavIcon icon={PulseIcon} active={view === 'status'} onClick={() => setView('status')} label="Status" />
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <NavIcon
                            icon={Sidebar}
                            active={showHistory}
                            onClick={() => setShowHistory(!showHistory)}
                            label={showHistory ? "Close Sidebar" : "Open Sidebar"}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${apiOk && dbOk && geminiStatus === 'connected' ? 'bg-green-500' : geminiStatus === 'rate_limited' ? 'bg-yellow-500' : 'bg-red-500'} transition-all shadow-[0_0_8px_rgba(34,197,94,0.3)]`} />
                        <span className="text-[8px] font-bold text-neutral-600">SYS</span>
                    </div>
                </div>
            </nav>

            {/* Context Sidebar (History) */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden border-r border-white/5"
                    >
                        <HistorySidebar
                            onSelectRun={handleSelectRun}
                            userId={userId}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        {view !== 'dashboard' && (
                            <button
                                onClick={() => setView('dashboard')}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors group flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:text-white" />
                                <span className="text-xs font-bold text-neutral-500 group-hover:text-white uppercase tracking-widest transition-colors">Back</span>
                            </button>
                        )}
                        {view !== 'dashboard' && <span className="text-neutral-800">|</span>}
                        <span className="text-sm font-bold text-neutral-500 uppercase tracking-widest">{view}</span>
                        {view === 'run' && activeWorkflow && (
                            <>
                                <span className="text-neutral-700">/</span>
                                <span className="text-sm font-semibold">{activeWorkflow.name}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-all">
                            demo
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <AnimatePresence mode="wait">
                        {view === 'dashboard' && (
                            <motion.div
                                key="dash"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="flex-1 p-12 overflow-y-auto"
                            >
                                <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
                                    <h1 className="text-6xl font-bold mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                                        Welcome to Workflow Builder
                                    </h1>
                                    <p className="text-xl text-neutral-500 mb-12 leading-relaxed max-w-2xl">
                                        Our AI-powered engine is ready. Build a new pipeline or select a previous run from the history to get started.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 w-full">
                                        <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[2.5rem] flex flex-col items-center group hover:bg-white/[0.05] transition-all">
                                            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                                <PlusCircle className="w-6 h-6 text-indigo-400" />
                                            </div>
                                            <h3 className="font-bold text-lg mb-2 text-white/90">Define Steps</h3>
                                            <p className="text-sm text-neutral-500 leading-relaxed">Choose from AI actions like Clean, Summarize, or Extract.</p>
                                        </div>
                                        <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[2.5rem] flex flex-col items-center group hover:bg-white/[0.05] transition-all">
                                            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                                                <PulseIcon className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <h3 className="font-bold text-lg mb-2 text-white/90">Provide Data</h3>
                                            <p className="text-sm text-neutral-500 leading-relaxed">Paste your raw text into the Execution Lab.</p>
                                        </div>
                                        <div className="p-8 bg-white/[0.03] border border-white/5 rounded-[2.5rem] flex flex-col items-center group hover:bg-white/[0.05] transition-all">
                                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                                                <LayoutDashboard className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <h3 className="font-bold text-lg mb-2 text-white/90">Get Insights</h3>
                                            <p className="text-sm text-neutral-500 leading-relaxed">Review the AI-generated results in your dashboard.</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setView('creator')}
                                        className="px-12 py-6 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-lg transition-all hover:shadow-[0_0_50px_-10px_rgba(79,70,229,0.4)] active:scale-95"
                                    >
                                        Start Building
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {view === 'creator' && (
                            <motion.div key="creator" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 overflow-hidden">
                                <WorkflowCreator onRun={handleRunWorkflow} />
                            </motion.div>
                        )}

                        {view === 'run' && activeWorkflow && (
                            <motion.div key={`run-${activeWorkflow.name}-${activeRun?.result || 'new'}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 overflow-hidden">
                                <RunDashboard
                                    key={activeRun ? JSON.stringify(activeRun) : 'new'}
                                    workflowName={activeWorkflow.name}
                                    steps={activeWorkflow.steps}
                                    initialInput={activeRun?.input}
                                    initialResult={activeRun?.result}
                                    userId={userId}
                                />
                            </motion.div>
                        )}

                        {view === 'status' && (
                            <motion.div key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden">
                                <StatusPage apiOk={apiOk} dbOk={dbOk} geminiStatus={geminiStatus} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

function NavIcon({ icon: Icon, active, onClick, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`p-4 rounded-2xl transition-all relative group ${active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-neutral-600 hover:text-neutral-300 hover:bg-white/5'}`}
        >
            <Icon className="w-6 h-6" />
            {!active && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-white text-black text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[100]">
                    {label}
                </div>
            )}
        </button>
    );
}