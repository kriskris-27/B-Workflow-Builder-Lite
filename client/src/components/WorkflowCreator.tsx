import { useState, useEffect } from 'react';
import { Plus, Trash2, Sparkles, LayoutPanelLeft, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
    type: "clean" | "summarize" | "extract" | "tag";
    config: Record<string, any>;
}

interface Template {
    id: string;
    name: string;
    steps: Step[];
}

export default function WorkflowCreator({ onRun }: { onRun: (name: string, steps: Step[]) => void }) {
    const [name, setName] = useState('My New Workflow');
    const [steps, setSteps] = useState<Step[]>([{ type: 'clean', config: {} }]);
    const [templates, setTemplates] = useState<Template[]>([]);

    const stepTypes = [
        { type: 'clean', label: '🧹 Clean', desc: 'Normalize text input' },
        { type: 'summarize', label: '📝 Summarize', desc: 'Create a concise brief' },
        { type: 'extract', label: '🔍 Extract', desc: 'Pull key entities' },
        { type: 'tag', label: '🏷️ Tag', desc: 'Categorize content' }
    ];

    useEffect(() => {
        fetch('http://localhost:8000/api/templates')
            .then(res => res.json())
            .then(setTemplates);
    }, []);

    const addStep = () => {
        if (steps.length < 4) {
            setSteps([...steps, { type: 'summarize', config: {} }]);
        }
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const updateStep = (index: number, type: Step['type']) => {
        const newSteps = [...steps];
        newSteps[index].type = type;
        setSteps(newSteps);
    };

    const applyTemplate = (template: Template) => {
        setName(template.name);
        setSteps(template.steps);
    };

    return (
        <div className="flex-1 p-12 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-4xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-2 -ml-2 w-full transition-all"
                        />
                        <p className="text-neutral-500 mt-2">Design your multi-step AI processing pipeline.</p>
                    </div>
                    <button
                        onClick={() => onRun(name, steps)}
                        className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <PlayCircle className="w-5 h-5" />
                        Build & Run
                    </button>
                </div>

                {/* Templates */}
                <div className="mb-12">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Quick Templates
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {templates.map(t => (
                            <button
                                key={t.id}
                                onClick={() => applyTemplate(t)}
                                className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all text-left group"
                            >
                                <h3 className="font-bold text-sm mb-1 group-hover:text-indigo-400 transition-colors">{t.name}</h3>
                                <p className="text-[10px] text-neutral-500 uppercase">{t.steps.length} Steps</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Builder */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6 flex items-center gap-2">
                        <LayoutPanelLeft className="w-4 h-4" /> Workflow Steps
                    </h2>
                    <AnimatePresence mode="popLayout">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="relative group p-6 bg-white/[0.03] border border-white/5 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/[0.05] transition-all"
                            >
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-bold text-neutral-500 border border-white/5">
                                    {index + 1}
                                </div>

                                <div className="grid grid-cols-4 gap-2 flex-1">
                                    {stepTypes.map(st => (
                                        <button
                                            key={st.type}
                                            onClick={() => updateStep(index, st.type as Step['type'])}
                                            className={`p-3 rounded-2xl text-xs font-bold transition-all ${step.type === st.type
                                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                                    : 'bg-white/5 text-neutral-500 hover:text-neutral-300'
                                                }`}
                                        >
                                            {st.label}
                                        </button>
                                    ))}
                                </div>

                                {steps.length > 1 && (
                                    <button
                                        onClick={() => removeStep(index)}
                                        className="p-3 text-neutral-700 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {steps.length < 4 && (
                        <button
                            onClick={addStep}
                            className="w-full py-8 border-2 border-dashed border-white/5 rounded-[2.5rem] hover:border-white/20 hover:bg-white/5 text-neutral-600 hover:text-neutral-400 transition-all font-bold flex items-center justify-center gap-2 group"
                        >
                            <Plus className="group-hover:rotate-90 transition-transform" />
                            Add Pipeline Step
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
