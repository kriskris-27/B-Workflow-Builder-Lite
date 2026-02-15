import { useState } from 'react';
import { Play, Loader2, CheckCircle2, AlertCircle, Terminal, Layers } from 'lucide-react';
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
    initialResult = null,
    userId,
    onRunComplete
}: {
    workflowName: string,
    steps: Step[],
    initialInput?: string,
    initialResult?: string | null,
    userId: string,
    onRunComplete?: () => void
}) {
    const [input, setInput] = useState(initialInput);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(initialResult);
    const [currentStepIndex, setCurrentStepIndex] = useState(initialResult ? steps.length : -1);
    const [stepResults, setStepResults] = useState<string[]>(initialResult ? [initialResult] : []);
    const [error, setError] = useState<string | null>(null);

    const handleRun = async () => {
        setError(null);
        if (!input.trim()) {
            setError("Input data cannot be empty.");
            return;
        }

        if (loading) return;

        setLoading(true);
        setResult(null);
        setStepResults([]);
        setCurrentStepIndex(0);

        try {
            const workflowRes = await fetch(`${API_URL}/api/workflows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: workflowName, steps })
            });

            if (!workflowRes.ok) throw new Error("Failed to initialize workflow on server.");
            const dbWorkflow = await workflowRes.json();
            const workflowId = dbWorkflow.id;

            let currentInput = input;
            const newResults: string[] = [];

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

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.detail || `Step ${i + 1} (${step.type}) failed`);
                }

                const data = await res.json();

                // Check for rate limit in step result
                if (data.result && data.result.startsWith("RATE_LIMIT_HIT")) {
                    setError("RATE_LIMIT_HIT");
                    setLoading(false);
                    return; // Stop execution
                }

                currentInput = data.result;
                newResults.push(data.result);
                setStepResults([...newResults]);
            }

            setResult(currentInput);
            setCurrentStepIndex(steps.length);

            await fetch(`${API_URL}/api/recent-runs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workflow_id: workflowId,
                    user_id: userId,
                    input_data: input,
                    output_data: currentInput
                })
            });

            if (onRunComplete) onRunComplete();

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to execute workflow.");
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="h-full flex flex-col p-16 overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
            <header className="flex items-center justify-between mb-16 shrink-0">
                <div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-1 bg-white" />
                        <span className="text-xs font-black tracking-[0.4em] text-[#666] uppercase">Execution_Lab</span>
                    </div>
                    <h2 className="text-6xl font-black tracking-tighter uppercase">{workflowName}_IO</h2>
                </div>
                <div className="flex items-center gap-10">
                    <AnimatePresence>
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5"
                            >
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Node_{currentStepIndex + 1}_Active</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <button
                        onClick={handleRun}
                        disabled={loading}
                        className="tactile-button group disabled:opacity-20"
                    >
                        {loading ? 'EXECUTING_CHAIN' : 'INITIALIZE_RUN'}
                        <Play className={`w-4 h-4 fill-current ${loading ? 'animate-pulse' : ''}`} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-[1fr,1.4fr] gap-12">
                {/* Input Column */}
                <article className="flex flex-col gap-8">
                    <header className="flex items-center gap-3 px-4">
                        <Terminal className="w-4 h-4 text-[#808080]" />
                        <span className="label-caps !text-[#808080]">Data_Inflow</span>
                    </header>
                    <div className="huamish-card p-12 flex flex-col hover:border-white/20 transition-all bg-[#080808] min-h-[600px]">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="AWAITING_INPUT_STREAM..."
                            disabled={loading}
                            className="w-full bg-transparent border-none outline-none resize-none text-xl font-medium text-[#aaa] placeholder:text-[#111] leading-relaxed min-h-[400px]"
                        />
                        {error === "RATE_LIMIT_HIT" ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-8 p-8 bg-yellow-500/10 border border-yellow-500/20 rounded-[2rem] flex flex-col items-center text-center gap-4"
                            >
                                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center animate-pulse">
                                    <AlertCircle className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black text-yellow-500 uppercase tracking-tight mb-2">Neural Core Cooling Down</h4>
                                    <p className="text-[#888] text-sm font-medium leading-relaxed max-w-xs mx-auto">
                                        Whoa there, speedster! The free tier AI needs a quick breather.
                                        Please wait <span className="text-white font-bold">60 seconds</span> before initializing the next run.
                                    </p>
                                </div>
                            </motion.div>
                        ) : error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <span className="text-[11px] font-black uppercase tracking-[0.1em] text-red-500 leading-tight">Error_Detected: {error}</span>
                            </motion.div>
                        )}
                    </div>
                </article>

                {/* Output Column */}
                <article className="flex flex-col gap-8">
                    <header className="flex items-center gap-3 px-4">
                        <Layers className="w-4 h-4 text-[#808080]" />
                        <span className="label-caps !text-[#808080]">Inference_Outflow</span>
                    </header>
                    <div className="huamish-card p-12 flex flex-col bg-[#000] relative group min-h-[600px]">
                        {!result && !loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-1000">
                                <h1 className="text-[180px] font-black tracking-tighter leading-none text-center">IDLE</h1>
                                <span className="label-caps">System standby</span>
                            </div>
                        )}

                        <div className="relative z-10">
                            <AnimatePresence mode="popLayout">
                                {(loading || stepResults.length > 0) && (
                                    <div className="space-y-6 mb-12">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-1 h-3 bg-[#222]" />
                                            <span className="text-[10px] font-black text-[#222] uppercase tracking-[0.4em]">Inference_Trace</span>
                                        </div>
                                        {steps.map((step, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-8 rounded-[2rem] border-l-4 transition-all duration-700 ${i === currentStepIndex
                                                    ? 'border-white bg-white/5 scale-[1.01]'
                                                    : i < stepResults.length
                                                        ? 'border-[#222] bg-white/[0.01]'
                                                        : 'border-[#111] opacity-20'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-[#888] tabular-nums">0{i + 1}</span>
                                                        <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${i === currentStepIndex ? 'text-white' : 'text-[#888]'}`}>
                                                            {step.type}
                                                        </span>
                                                    </div>
                                                    {i === currentStepIndex ? (
                                                        <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                                                    ) : i < stepResults.length ? (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500/50" />
                                                    ) : null}
                                                </div>

                                                {i === currentStepIndex && (
                                                    <div className="h-0.5 bg-white/5 w-full rounded-full overflow-hidden mb-4">
                                                        <motion.div
                                                            className="h-full bg-white"
                                                            animate={{ x: ["-100%", "300%"] }}
                                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                            style={{ width: "30%" }}
                                                        />
                                                    </div>
                                                )}

                                                {stepResults[i] && (
                                                    <div className="mt-4 p-6 bg-black/40 border border-white/5 rounded-2xl font-mono text-[11px] leading-relaxed text-[#aaa] whitespace-pre-wrap">
                                                        {stepResults[i]}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {result && !loading && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col"
                                    >
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-1.5 h-6 bg-white" />
                                            <span className="label-caps !text-white !tracking-[0.4em]">MANIFEST_RESULT</span>
                                        </div>
                                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 font-mono text-2xl leading-relaxed text-[#eee] whitespace-pre-wrap selection:bg-white selection:text-black">
                                            {result}
                                        </div>
                                        <footer className="mt-6 flex items-center justify-between border-t border-white/5 pt-6">
                                            <span className="text-[10px] font-black text-[#666] uppercase tracking-[0.5em]">Inference complete</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(result);
                                                    alert("Result copied to clipboard.");
                                                }}
                                                className="text-[10px] font-black text-white/40 hover:text-white transition-colors uppercase tracking-[0.2em] bg-white/5 hover:bg-white/10 px-6 py-2 rounded-xl border border-white/5"
                                            >
                                                Copy_Result
                                            </button>
                                        </footer>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </article>
            </div>
        </section>
    );
}
