import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    ArrowLeft,
    PlusCircle,
    Activity,
    History,
    Settings,
    Shield
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

import HistorySidebar from './components/HistorySidebar';
import StatusPage from './components/StatusPage';
import WorkflowCreator from './components/WorkflowCreator';
import RunDashboard from './components/RunDashboard';
import DocumentationModal from './components/DocumentationModal';

export default function App() {
    const [view, setView] = useState<'dashboard' | 'creator' | 'run' | 'status'>('dashboard');
    const [showHistory, setShowHistory] = useState(true);
    const [userId, setUserId] = useState<string>('');
    const [apiOk, setApiOk] = useState<boolean | null>(null);
    const [dbOk, setDbOk] = useState<boolean | null>(null);
    const [geminiStatus, setGeminiStatus] = useState<'connected' | 'error' | 'rate_limited' | 'checking'>('checking');
    const [showDocs, setShowDocs] = useState(false);

    // Selected workflow for RunDashboard
    const [activeWorkflow, setActiveWorkflow] = useState<{ name: string, steps: any[] } | null>(null);
    const [activeRun, setActiveRun] = useState<{ input: string, result: string | null } | null>(null);
    const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

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
        <div className="h-screen w-screen bg-[#050505] text-white selection:bg-white/20 font-sans flex overflow-hidden">
            {/* Semantic Header/Nav */}
            <nav className="w-24 border-r border-white/5 bg-[#000] flex flex-col items-center py-10 gap-10 z-50">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-black text-2xl mb-8 shadow-soft">
                    A
                </div>

                <div className="flex flex-col gap-8 flex-1">
                    <NavIcon icon={LayoutDashboard} active={view === 'dashboard'} onClick={() => setView('dashboard')} label="HOME" />
                    <NavIcon icon={PlusCircle} active={view === 'creator'} onClick={() => setView('creator')} label="CREATE" />
                    <NavIcon icon={Activity} active={view === 'status'} onClick={() => setView('status')} label="HEALTH" />

                    <div className="mt-8 pt-8 border-t border-white/5">
                        <NavIcon
                            icon={History}
                            active={showHistory}
                            onClick={() => setShowHistory(!showHistory)}
                            label="HISTORY"
                        />
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <NavIcon icon={Settings} active={false} onClick={() => { }} label="CONFIG" />
                    <div className="py-4 flex flex-col items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${apiOk && dbOk && geminiStatus === 'connected' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-500'} transition-all`} />
                        <span className="text-[8px] font-black tracking-widest text-[#808080] uppercase">Link</span>
                    </div>
                </div>
            </nav>

            {/* Content Segment */}
            <AnimatePresence>
                {showHistory && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 360, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden border-r border-white/5 bg-[#080808]"
                    >
                        <HistorySidebar
                            onSelectRun={handleSelectRun}
                            userId={userId}
                            refreshKey={historyRefreshKey}
                        />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Segment */}
            <main className="flex-1 relative z-10 flex flex-col overflow-hidden bg-[#050505]">
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-12 bg-[#000]/40 backdrop-blur-xl">
                    <div className="flex items-center gap-8">
                        {view !== 'dashboard' && (
                            <button
                                onClick={() => setView('dashboard')}
                                className="group flex items-center gap-3 py-2.5 px-4 bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all rounded-xl active:scale-95"
                            >
                                <ArrowLeft className="w-4 h-4 text-[#808080] group-hover:text-white" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#808080] group-hover:text-white">RETREAT_EXIT</span>
                            </button>
                        )}
                        <div className="flex items-center gap-6">
                            <h2 className="text-2xl font-black uppercase tracking-tighter opacity-80">{view}</h2>
                            {view === 'run' && activeWorkflow && (
                                <div className="flex items-center gap-4">
                                    <div className="w-1 h-4 bg-white/10" />
                                    <span className="text-white/20 font-black text-xs uppercase tracking-[0.3em]">{activeWorkflow.name}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => setShowDocs(true)}
                            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-all px-4 py-2 rounded-full border border-white/5 group"
                        >
                            <Shield className="w-3 h-3 text-[#666] group-hover:text-white transition-colors" />
                            <span className="text-[10px] font-black tracking-widest text-[#666] group-hover:text-white transition-colors">DOCS</span>
                        </button>
                    </div>
                </header>

                <section className="flex-1 overflow-hidden flex flex-col min-h-0">
                    <AnimatePresence mode="wait">
                        {view === 'dashboard' && (
                            <motion.div
                                key="dash"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                transition={{ duration: 0.5 }}
                                className="h-full p-24 overflow-y-auto custom-scrollbar min-h-0"
                            >
                                <div className="max-w-6xl mx-auto">
                                    <header className="mb-32">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <h1 className="text-9xl font-black leading-[0.85] mb-12 tracking-tighter">
                                                BUILD<br />WITHOUT<br />FRICTION.
                                            </h1>
                                            <p className="text-2xl text-[#888] max-w-2xl font-medium tracking-tight leading-relaxed">
                                                The core AI orchestrator for modern pipelines. Strict, fast, and deterministic execution.
                                            </p>
                                        </motion.div>
                                    </header>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
                                        <FeatureCard
                                            icon={LayoutDashboard}
                                            title="STRUCTURE"
                                            desc="Map your AI logic into discrete, reusable steps. Total control over inference flows."
                                        />
                                        <FeatureCard
                                            icon={Activity}
                                            title="INPUT"
                                            desc="Feed high-throughput raw data. Gemini Flash processes with extreme low-latency."
                                        />
                                        <FeatureCard
                                            icon={Shield}
                                            title="INSIGHT"
                                            desc="Distribute refined intelligence across your architecture. Clean, tagged, summarized."
                                        />
                                    </div>

                                    <footer className="flex flex-col items-center">
                                        <button
                                            onClick={() => setView('creator')}
                                            className="tactile-button group"
                                        >
                                            INITIALIZE WORKFLOW
                                            <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
                                        </button>
                                        <p className="mt-8 text-[10px] font-black text-[#222] uppercase tracking-[0.3em]">System standby // Ready for deployment</p>
                                    </footer>
                                </div>
                            </motion.div>
                        )}

                        {view === 'creator' && (
                            <motion.div key="creator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden">
                                <WorkflowCreator onRun={handleRunWorkflow} />
                            </motion.div>
                        )}

                        {view === 'run' && activeWorkflow && (
                            <motion.section
                                key={`run-${activeWorkflow.name}`}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex-1 overflow-hidden"
                            >
                                <RunDashboard
                                    key={activeRun ? JSON.stringify(activeRun) : 'new'}
                                    workflowName={activeWorkflow.name}
                                    steps={activeWorkflow.steps}
                                    initialInput={activeRun?.input}
                                    initialResult={activeRun?.result}
                                    userId={userId}
                                    onRunComplete={() => setHistoryRefreshKey(prev => prev + 1)}
                                />
                            </motion.section>
                        )}

                        {view === 'status' && (
                            <motion.div key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 overflow-hidden">
                                <StatusPage apiOk={apiOk} dbOk={dbOk} geminiStatus={geminiStatus} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                <AnimatePresence>
                    {showDocs && <DocumentationModal onClose={() => setShowDocs(false)} />}
                </AnimatePresence>
            </main>
        </div>
    );
}

function NavIcon({ icon: Icon, active, onClick, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-3 p-4 transition-all group relative ${active ? 'text-white' : 'text-[#222] hover:text-[#555]'}`}
        >
            {active && (
                <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-8 bg-white rounded-full translate-x-[-1.5rem]"
                />
            )}
            <div className={`p-3.5 rounded-2xl transition-all duration-500 ${active ? 'bg-white/10 ring-1 ring-white/10 rotate-0' : 'group-hover:bg-white/5 group-hover:rotate-6'}`}>
                <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
            </div>
            <span className="text-[9px] font-black tracking-[0.2em] uppercase opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-500">{label}</span>
        </button>
    );
}

function FeatureCard({ icon: Icon, title, desc }: any) {
    return (
        <div className="huamish-card p-12 group">
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-white group-hover:text-black transition-all duration-500 ease-out">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-3xl font-black mb-6 tracking-tight">{title}</h3>
            <p className="text-[#666] leading-relaxed text-lg font-medium group-hover:text-[#aaa] transition-colors">{desc}</p>
        </div>
    );
}