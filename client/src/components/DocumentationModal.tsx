import { motion } from 'framer-motion';
import { X, Book, Shield, Zap, Layout } from 'lucide-react';

export default function DocumentationModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-12 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-5xl h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
            >
                <header className="flex items-center justify-between p-8 border-b border-white/10 bg-[#0f0f0f]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                            <Book className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-white">System Documentation</h2>
                            <p className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Aggrosso Neural Orchestrator V1.2.0</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/10 rounded-xl transition-colors group"
                    >
                        <X className="w-6 h-6 text-[#666] group-hover:text-white transition-colors" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                    <div className="max-w-4xl mx-auto space-y-16">

                        {/* Intro Section */}
                        <section>
                            <h3 className="text-4xl font-black mb-6 tracking-tight text-white">Project Overview</h3>
                            <p className="text-lg text-[#aaa] leading-relaxed font-medium">
                                This application connects a rigorous, step-by-step workflow builder to the Google Gemini Flash API.
                                It is designed to ingest raw text data and transform it through a deterministic chain of operations:
                                Cleaning, Summarization, Extraction, and Tagging. It features a persistent history archive and Real-Time
                                interface updates.
                            </p>
                        </section>

                        <div className="w-full h-px bg-white/10" />

                        {/* Architecture Section */}
                        <section className="grid grid-cols-2 gap-12">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <Layout className="w-5 h-5 text-white" />
                                    <h4 className="text-xl font-black uppercase tracking-tight">Core Architecture</h4>
                                </div>
                                <ul className="space-y-4">
                                    <ListItem title="Frontend" desc="React + Vite + Tailwind CSS. Uses Framer Motion for cinematic UI transitions." />
                                    <ListItem title="Backend" desc="FastAPI (Python). Async architecture handling high-concurrency requests." />
                                    <ListItem title="Database" desc="PostgreSQL with SQLAlchemy ORM. Auto-schema migration on startup." />
                                    <ListItem title="AI Engine" desc="Google Gemini 1.5 Flash. Optimized for low-latency text reasoning." />
                                </ul>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <Zap className="w-5 h-5 text-white" />
                                    <h4 className="text-xl font-black uppercase tracking-tight">Key Features</h4>
                                </div>
                                <ul className="space-y-4">
                                    <ListItem title="Workflow Builder" desc="Drag-and-drop logic nodes. Supports sequential processing pipelines." />
                                    <ListItem title="Live Trace" desc="Real-time visualization of intermediate AI outputs (Chain-of-Thought)." />
                                    <ListItem title="Persistent History" desc="User-isolated execution logs stored permanently in Postgres." />
                                    <ListItem title="Templates" desc="Pre-configured patterns for common NLP tasks (Summarization, Extraction)." />
                                </ul>
                            </div>
                        </section>

                        <div className="w-full h-px bg-white/10" />

                        {/* Node Types */}
                        <section>
                            <h3 className="text-2xl font-black mb-8 tracking-tight text-white uppercase">Inference Nodes</h3>
                            <div className="grid grid-cols-2 gap-6">
                                <NodeCard
                                    title="CLEAN"
                                    desc="Normalizes input text, removing formatting artifacts, excessive whitespace, and non-standard characters."
                                />
                                <NodeCard
                                    title="SUMMARIZE"
                                    desc="Condenses the core information into a high-density executive brief. Configurable length."
                                />
                                <NodeCard
                                    title="EXTRACT"
                                    desc="Identifies and pulls specific entities (Names, Dates, Locations) or structured data points."
                                />
                                <NodeCard
                                    title="TAG"
                                    desc="Assigns relevant categorical metadata to the content based on semantic analysis."
                                />
                            </div>
                        </section>

                        <div className="w-full h-px bg-white/10" />

                        {/* Security */}
                        <section>
                            <div className="bg-[#111] border border-white/5 p-8 rounded-2xl flex items-start gap-6">
                                <Shield className="w-8 h-8 text-[#fff]" />
                                <div>
                                    <h4 className="text-xl font-black uppercase tracking-tight mb-2 text-white">Security & Environment</h4>
                                    <p className="text-[#888] text-sm leading-relaxed mb-4">
                                        The application follows strict environment isolation. API keys are managed via env vars.
                                        Database connections use SQLAlchemy pool management. CORS is configured for strictly defined origins.
                                    </p>
                                    <div className="flex gap-3">
                                        <Badge>Dockerized</Badge>
                                        <Badge>Postgres 15</Badge>
                                        <Badge>Strict Types</Badge>
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>

                <footer className="p-6 border-t border-white/10 bg-[#0f0f0f] flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-[#444]">
                    <span>Aggrosso System Architecture</span>
                    <span>Last Updated: 2026-02-14</span>
                </footer>
            </motion.div>
        </div>
    );
}

function ListItem({ title, desc }: { title: string, desc: string }) {
    return (
        <li className="flex flex-col gap-1">
            <span className="text-white font-bold text-sm tracking-wide">{title}</span>
            <span className="text-[#666] text-xs font-medium leading-relaxed">{desc}</span>
        </li>
    );
}

function NodeCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
            <h4 className="text-lg font-black text-white mb-2">{title}</h4>
            <p className="text-[#888] text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="px-3 py-1 bg-white/10 rounded-full text-white text-[9px] font-bold tracking-wider">
            {children}
        </span>
    );
}
