import { useState, useEffect } from 'react';
import { Clock, ChevronRight, ListPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Workflow {
    id: number;
    name: string;
    created_at: string;
    steps: any[];
}

interface RecentRun {
    id: number;
    workflow_id: number;
    input_data: any;
    output_data: any;
    created_at: string;
}

export default function HistorySidebar({ onSelectWorkflow }: { onSelectWorkflow: (w: Workflow) => void }) {
    const [history, setHistory] = useState<Workflow[]>([]);
    const [recentRuns, setRecentRuns] = useState<RecentRun[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/workflows');
            if (res.ok) {
                const data = await res.json();
                setHistory(data.slice(0, 5));
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentRuns = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/recent-runs');
            if (res.ok) {
                const data = await res.json();
                setRecentRuns(data.slice(0, 5));
            }
        } catch (err) {
            console.error("Failed to fetch recent runs", err);
        }
    };

    const clearRecentRuns = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/recent-runs', {
                method: 'DELETE',
            });
            if (res.ok) {
                setRecentRuns([]); // Clear the state for recent runs
                setHistory([]); // Clear the history state to reflect changes
                alert('Recent runs cleared successfully');
            } else {
                alert('Failed to clear recent runs');
            }
        } catch (err) {
            console.error('Error clearing recent runs:', err);
            alert('An error occurred while clearing recent runs');
        }
    };

    useEffect(() => {
        fetchHistory();
        fetchRecentRuns();
        const interval = setInterval(() => {
            fetchHistory();
            fetchRecentRuns();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-80 bg-black/40 backdrop-blur-3xl flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <h2 className="font-bold text-sm uppercase tracking-widest text-neutral-400">Recent Runs</h2>
                </div>
                <button
                    onClick={fetchHistory}
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
                        <div className="text-center py-12 px-4">
                            <p className="text-neutral-600 text-sm">No recent workflows found.</p>
                        </div>
                    ) : (
                        recentRuns.map((r) => (
                            <motion.div
                                key={r.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                whileHover={{ x: 4 }}
                                className="w-full group p-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl flex items-center justify-between hover:bg-white/10 hover:border-white/20 transition-all text-left"
                            >
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-sm truncate text-white/90 group-hover:text-white transition-colors">
                                        {`Run for workflow ${r.workflow_id}`}
                                    </h3>
                                    <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-tight">
                                        {new Date(r.created_at).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-neutral-400 mt-2 truncate">
                                        {typeof r.output_data === 'string' ? r.output_data : JSON.stringify(r.output_data)}
                                    </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-neutral-700 group-hover:text-indigo-400 transition-colors" />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="p-6 bg-gradient-to-t from-indigo-500/5 to-transparent border-t border-white/5">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-xs text-indigo-300 leading-relaxed font-medium">
                        Pro Tip: You can reuse any past workflow to save time.
                    </p>
                </div>
                <button
                    onClick={clearRecentRuns}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    Clear Recent Runs
                </button>
            </div>
        </div>
    );
}
