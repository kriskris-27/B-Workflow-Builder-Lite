import { useState } from 'react';
import { Trash2, Plus, Play, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
    type: "clean" | "summarize" | "extract" | "tag";
    config: Record<string, any>;
}

export default function WorkflowCreator({ onRun }: { onRun: (name: string, steps: Step[]) => void }) {
    const [name, setName] = useState('UNNAMED_WORKFLOW');
    const [steps, setSteps] = useState<Step[]>([{ type: 'clean', config: {} }]);

    const stepTypes = [
        { type: 'clean', label: 'CLEAN', desc: 'Normalize text input' },
        { type: 'summarize', label: 'SUMMARIZE', desc: 'Create a concise brief' },
        { type: 'extract', label: 'EXTRACT', desc: 'Pull key entities' },
        { type: 'tag', label: 'TAG', desc: 'Categorize content' }
    ] as const;

    const templates = [
        { name: 'INSIGHT_EXTRACTOR', steps: [{ type: 'clean' }, { type: 'extract' }, { type: 'tag' }] },
        { name: 'BRIEF_GENERATOR', steps: [{ type: 'clean' }, { type: 'summarize' }] },
        { name: 'FULL_PIPELINE', steps: [{ type: 'clean' }, { type: 'summarize' }, { type: 'extract' }, { type: 'tag' }] }
    ] as const;

    const applyTemplate = (t: typeof templates[number]) => {
        setName(t.name);
        setSteps(t.steps.map(s => ({ ...s, config: {} })) as Step[]);
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    return (
        <section className="h-full flex flex-col p-10 overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
            <header className="flex items-center justify-between mb-10 shrink-0">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-0.5 bg-white/20" />
                        <span className="text-[10px] font-black tracking-[0.4em] text-[#444] uppercase">Logic_Environment</span>
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter">INITIALIZE_LOGIC</h2>
                </div>
                <button
                    onClick={() => onRun(name, steps)}
                    className="tactile-button group h-16 px-10 text-base"
                >
                    DEPLOY_RUNNER
                    <Play className="w-5 h-5 fill-current" />
                </button>
            </header>

            <div className="grid grid-cols-[1.1fr,1.0fr] gap-12">
                <main className="flex flex-col gap-6">
                    <div className="p-10 bg-[#0c0c0c] border border-white/5 rounded-[2rem] shadow-soft">
                        <label className="label-caps mb-4 block !text-[#444] text-[10px]">Manifest_Identifier</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-transparent border-none text-5xl font-black outline-none placeholder:text-[#111] tracking-tighter uppercase focus:text-white transition-colors"
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <label className="label-caps !text-[#444] text-[12px]">Instruction_Chain</label>
                            <span className="text-[11px] font-black text-[#222] uppercase tracking-[0.3em]">{steps.length} / 4 NODES_ACTIVE</span>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {steps.map((step, idx) => (
                                <motion.div
                                    key={idx}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="group p-8 bg-[#0c0c0c] border border-white/5 rounded-[2rem] flex items-center justify-between hover:border-white/10 hover:bg-[#111] transition-all active:scale-[0.99]"
                                >
                                    <div className="flex items-center gap-10">
                                        <span className="text-6xl font-black text-[#1a1a1a] group-hover:text-white transition-all duration-700 tabular-nums">0{idx + 1}</span>
                                        <div>
                                            <h4 className="text-2xl font-black uppercase tracking-tight group-hover:text-white transition-colors mb-1">{step.type.toUpperCase()}</h4>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                                                <p className="text-[#444] text-[10px] font-black uppercase tracking-widest">Active_Segment</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeStep(idx)}
                                        className="p-5 hover:bg-red-500/10 rounded-3xl text-[#222] hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-6 h-6" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {steps.length === 0 && (
                            <div className="py-32 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-[#1a1a1a]">
                                <Info className="w-16 h-16 mb-6 opacity-20" />
                                <span className="text-sm font-black uppercase tracking-[0.5em]">System_Awaiting_Nodes</span>
                            </div>
                        )}
                    </div>
                </main>


                <aside className="bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] p-10 flex flex-col gap-10 shadow-tactile">
                    <header>
                        <h3 className="label-caps mb-4 text-[12px] !text-white tracking-[0.3em]">Ready_Templates</h3>
                        <div className="flex flex-wrap gap-2">
                            {templates.map((t) => (
                                <button
                                    key={t.name}
                                    onClick={() => applyTemplate(t)}
                                    className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/10 transition-all active:scale-95 text-[#666] hover:text-white"
                                >
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </header>

                    <div className="h-px bg-white/5 w-full" />

                    <header>
                        <h3 className="label-caps mb-3 text-[12px] !text-white">Node_Palette</h3>
                        <p className="text-base text-[#444] font-medium leading-relaxed max-w-sm">Select inference modules to orchestrate your workflow.</p>
                    </header>

                    <div className="grid grid-cols-2 gap-6 flex-1">
                        {stepTypes.map((st) => {
                            const isActive = steps.some(s => s.type === st.type);
                            return (
                                <button
                                    key={st.type}
                                    onClick={() => steps.length < 4 && !isActive && setSteps([...steps, { type: st.type as any, config: {} }])}
                                    className={`p-8 border border-white/5 rounded-[2rem] text-left transition-all group flex flex-col justify-between
                                        ${isActive
                                            ? 'bg-white/[0.02] opacity-40 cursor-not-allowed grayscale'
                                            : 'bg-[#080808] hover:bg-white/5 hover:border-white/10 hover:shadow-[0_0_40px_rgba(255,255,255,0.02)] active:scale-[0.98]'
                                        }`}
                                    disabled={steps.length >= 4 || isActive}
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <span className="text-[10px] font-black text-[#555] group-hover:text-white transition-colors uppercase tracking-[0.2em]">{st.type}</span>
                                        <div className={`w-8 h-8 rounded-full border border-white/5 flex items-center justify-center transition-all ${isActive ? 'bg-white/10' : 'group-hover:bg-white group-hover:text-black'}`}>
                                            {isActive ? <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> : <Plus className="w-4 h-4" />}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h5 className="font-black text-2xl group-hover:text-white transition-colors uppercase tracking-tight ">{st.label}</h5>
                                            {isActive && <span className="text-[8px] font-black text-white/40 uppercase tracking-widest bg-white/10 px-2 py-1 rounded-md">Active</span>}
                                        </div>
                                        <p className="text-[10px] text-[#888] group-hover:text-[#aaa] font-medium leading-tight">{st.desc}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-auto pt-10 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-6 text-[11px] font-black text-[#666] uppercase tracking-widest">
                            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#666]" /> V.2.4</span>
                            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#666]" /> SLA_READY</span>
                        </div>
                        <Info className="w-5 h-5 text-[#444]" />
                    </div>
                </aside>
            </div>
        </section>
    );
}
