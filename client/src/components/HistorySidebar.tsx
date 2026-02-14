import { useState, useEffect } from 'react';
import { Clock, ListPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


interface RecentRun {
    id: number;
    workflow_id: number;
    workflow_name?: string;
    input_data: any;
    output_data: any;
    created_at: string;
}

export default function HistorySidebar({ onSelectRun, userId }: {
    onSelectRun: (run: RecentRun) => void,
    userId: string
}) {
    const [recentRuns, setRecentRuns] = useState<RecentRun[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        // No longer showing static history, but keeping the refresh logic for runs
        fetchRecentRuns();
    };

    const fetchRecentRuns = async () => {
        try {
            const res = await fetch(`${API_URL}/api/recent-runs?user_id=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setRecentRuns(data); // Backend now limits to 10
            }
        } catch (err) {
            console.error("Failed to fetch recent runs", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setLoading(true); // Set loading to true before fetching
        fetchRecentRuns(); // Only need to fetch recent runs now
    };

    const clearRecentRuns = async () => {
        if (!confirm("Are you sure you want to clear your execution history?")) return;
        try {
            const res = await fetch(`${API_URL}/api/recent-runs?user_id=${userId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setRecentRuns([]);
                handleRefresh();
            }
        } catch (err) {
            console.error('Error clearing recent runs:', err);
        }
    };

    useEffect(() => {
        handleRefresh();
        const interval = setInterval(handleRefresh, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-80 bg-black/40 backdrop-blur-3xl flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <h2 className="font-bold text-sm uppercase tracking-widest text-neutral-400">Run History</h2>
                </div>
                <button
                    onClick={handleRefresh}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    title="Refresh history"
                >
                    <motion.div whileTap={{ rotate: 180 }}>
                        <ListPlus className="w-4 h-4 text-neutral-500" />
                    </motion.div>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : recentRuns.length === 0 ? (
                        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                            <p className="text-xs text-indigo-300 leading-relaxed font-medium">
                                Click any run to view the full input and generated output.
                            </p>
                        </div>
                    ) : (
                        recentRuns.map((r) => (
                            <motion.div
                                key={r.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                whileHover={{ x: 4 }}
                                onClick={() => onSelectRun(r)}
                                className="w-full group p-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex flex-col hover:bg-white/10 hover:border-white/20 transition-all text-left cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-xs truncate text-white/90 group-hover:text-white transition-colors">
                                        {r.workflow_name || `Run #${r.id}`}
                                    </h3>
                                    <span className="text-[9px] text-neutral-600 font-bold uppercase tabular-nums">
                                        {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="p-2 bg-black/20 rounded-lg border border-white/5">
                                    <p className="text-[11px] text-neutral-400 line-clamp-2 italic font-mono">
                                        {typeof r.output_data === 'string' ? r.output_data : JSON.stringify(r.output_data)}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="p-6 border-t border-white/5 mt-auto">
                <button
                    onClick={clearRecentRuns}
                    className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                >
                    Clear History
                </button>
            </div>
        </div>
    );
}
