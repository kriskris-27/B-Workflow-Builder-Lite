import { useState } from 'react';
import { Sparkles, Terminal, CheckCircle2, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Step {
    type: string;
    config: any;
}

export default function RunDashboard({
    workflowName,
    steps,
    initialInput = '',
    initialResult = null
}: {
    workflowName: string,
    steps: Step[],
    initialInput?: string,
    initialResult?: string | null
}) {
    const [input, setInput] = useState(initialInput);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(initialResult);
    const [currentStepIndex, setCurrentStepIndex] = useState(initialResult ? steps.length : -1);
    const [stepResults, setStepResults] = useState<string[]>(initialResult ? [initialResult] : []); // Simple placeholder for view mode

    const handleRun = async () => {
        if (!input.trim() || loading) return;

        setLoading(true);
        setResult(null);
        setStepResults([]);
        setCurrentStepIndex(0);

        try {
            // 1. Ensure the workflow is saved so we have an ID
            const workflowRes = await fetch(`${API_URL}/api/workflows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: workflowName, steps })
            });
            const dbWorkflow = await workflowRes.json();
            const workflowId = dbWorkflow.id;

            let currentInput = input;
            const newResults: string[] = [];

            // 2. Execute steps sequentially
            for (let i = 0; i < steps.length; i++) {
                setCurrentStepIndex(i);
                const step = steps[i];

                const res = await fetch(`${API_URL}/api/workflows/run-step`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        step_type: step.type,
                        input_data: currentInput,
                        config: step.config || {}
                    })
                });

                if (!res.ok) throw new Error(`Step ${i + 1} failed`);

                const data = await res.json();
                currentInput = data.result;
                newResults.push(data.result);
                setStepResults([...newResults]);
            }

            setResult(currentInput);
            setCurrentStepIndex(steps.length);

            // 3. Record the final result in history
            await fetch(`${API_URL}/api/recent-runs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflow_id: workflowId,
                    input_data: input,
                    output_data: currentInput
                })
            });

        } catch (err: any) {
            console.error(err);
            setResult(`Error: ${err.message || "Failed to execute workflow."}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 p-12 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-4 flex items-center gap-4">
                        <span className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                            <Sparkles className="w-8 h-8 text-indigo-400" />
                        </span>
                        Execution Lab
                    </h1>
                    <p className="text-neutral-500">Run <span className="text-white font-medium">{workflowName}</span> against your raw data.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
                    {/* Input Side */}
                    <div className="flex flex-col gap-4">
                        <div className="flex-1 p-8 bg-white/[0.03] border border-white/5 rounded-[2.5rem] flex flex-col">
                            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-2">
                                <Terminal className="w-4 h-4" /> Input Data
                            </label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Paste your text here..."
                                className="flex-1 bg-transparent border-none outline-none resize-none text-neutral-300 placeholder:text-neutral-800 leading-relaxed font-mono"
                            />
                        </div>
                        <button
                            onClick={handleRun}
                            disabled={loading || !input.trim()}
                            className="w-full py-6 bg-white text-black rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 transition-all hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group shadow-2xl shadow-indigo-500/10"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Processing Pipeline...
                                </>
                            ) : (
                                <>
                                    <Play className="w-6 h-6 fill-current" />
                                    Trigger Workflow
                                </>
                            )}
                        </button>
                    </div>

                    {/* Result Side */}
                    <div className="flex flex-col gap-4 overflow-hidden">
                        <div className="flex-1 p-8 bg-black/40 border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden">
                            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-6 flex items-center gap-2 px-1">
                                <CheckCircle2 className="w-4 h-4" /> Results Pipeline
                            </label>

                            <div className="flex-1 overflow-y-auto space-y-6 px-1 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {!loading && !result ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="h-full flex flex-col items-center justify-center text-center opacity-20 filter grayscale"
                                        >
                                            <ZapIcon className="w-16 h-16 mb-4 text-neutral-500" />
                                            <p className="text-sm font-medium">Wait for execution...</p>
                                        </motion.div>
                                    ) : (
                                        <>
                                            {steps.map((step, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{
                                                        opacity: i <= currentStepIndex ? 1 : 0.3,
                                                        x: 0,
                                                    }}
                                                    className={`p-4 rounded-2xl border transition-all ${i < currentStepIndex
                                                        ? 'bg-green-500/5 border-green-500/20'
                                                        : i === currentStepIndex
                                                            ? 'bg-indigo-500/10 border-indigo-500/30'
                                                            : 'bg-white/5 border-white/5'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Step {i + 1}</span>
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${i < currentStepIndex ? 'text-green-400' :
                                                            i === currentStepIndex ? 'text-indigo-400 animate-pulse' : 'text-neutral-700'
                                                            }`}>
                                                            {i < currentStepIndex ? 'Complete' : i === currentStepIndex ? 'Thinking...' : 'Pending'}
                                                        </span>
                                                    </div>
                                                    <h4 className="font-bold capitalize mb-2">{step.type}</h4>

                                                    {stepResults[i] && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            className="mt-2 pt-2 border-t border-white/5"
                                                        >
                                                            <div className="text-[11px] text-neutral-400 font-mono line-clamp-3 italic leading-relaxed">
                                                                "{stepResults[i].substring(0, 120)}..."
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            ))}

                                            {result && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-8 p-6 bg-green-500/10 border border-green-500/20 rounded-3xl"
                                                >
                                                    <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-4">Final Output</h4>
                                                    <pre className="text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed font-mono italic">
                                                        {result}
                                                    </pre>
                                                </motion.div>
                                            )}
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const ZapIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
);
