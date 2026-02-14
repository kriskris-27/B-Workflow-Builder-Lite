import { useState, useEffect } from 'react';
import { Clock, Trash2, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface RecentRun {
    id: number;
    workflow_id: number;
    workflow_name?: string;
    input_data: any;
    output_data: any;
    created_at: string;
}

export default function HistorySidebar({ onSelectRun, userId, refreshKey }: {
    onSelectRun: (run: RecentRun) => void,
    userId: string,
    refreshKey?: number
}) {
    const [recentRuns, setRecentRuns] = useState<RecentRun[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRecentRuns = async () => {
        try {
            const res = await fetch(`${API_URL}/api/recent-runs?user_id=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setRecentRuns(data);
            }
        } catch (err) {
            console.error("Failed to fetch recent runs", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        setLoading(true);
        fetchRecentRuns();
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
    }, [refreshKey]);

    return (
        <nav className="h-full flex flex-col p-10 gap-10 overflow-hidden">
            <header className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-4 bg-white" />
                    <h3 className="text-xs font-black tracking-[0.3em] text-[#444] uppercase">Archive</h3>
                </div>
                <button
                    onClick={clearRecentRuns}
                    className="group flex items-center gap-2 text-[10px] font-black text-[#444] hover:text-red-500 transition-colors uppercase tracking-[0.2em]"
                >
                    <Trash2 className="w-3 h-3 translate-y-[-1px]" />
                    Flush
                </button>
            </header>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {loading && recentRuns.length === 0 ? (
                    <div className="py-20 flex flex-col items-center gap-4 text-[#222]">
                        <Clock className="w-8 h-8 animate-spin" strokeWidth={1} />
                        <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Scanning_Nodes...</span>
                    </div>
                ) : recentRuns.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="text-[#1a1a1a] font-black text-8xl mb-8 tracking-tighter">0%</div>
                        <p className="text-[#333] text-[10px] font-black uppercase tracking-[0.2em]">Null history segment</p>
                    </div>
                ) : (
                    recentRuns.map((run) => (
                        <div
                            key={run.id}
                            onClick={() => onSelectRun(run)}
                            className="group p-8 bg-[#0c0c0c] border border-white/5 rounded-2xl cursor-pointer hover:border-white/10 hover:bg-[#111] transition-all relative overflow-hidden active:scale-[0.98]"
                        >
                            <div className="relative z-10">
                                <header className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-[#555] group-hover:text-white transition-colors tracking-[0.2em] uppercase">
                                        {run.workflow_name || 'UNDEFINED_NODE'}
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#222] group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                </header>
                                <p className="text-[12px] text-[#444] group-hover:text-[#888] line-clamp-2 mb-4 font-mono leading-relaxed">
                                    {typeof run.input_data === 'string' ? run.input_data : JSON.stringify(run.input_data)}
                                </p>
                                <footer className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-[#222] group-hover:text-[#444] transition-colors tabular-nums">
                                        {new Date(run.created_at).toLocaleTimeString()}
                                    </span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/5 group-hover:bg-white transition-colors" />
                                </footer>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </nav>
    );
}
