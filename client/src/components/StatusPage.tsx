import { ShieldCheck, Database, RefreshCw, Server, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatusItemProps {
    name: string;
    ok: boolean | null | 'connected' | 'error' | 'rate_limited' | 'checking';
    icon: any;
    desc: string;
}

const StatusItem = ({ name, ok, icon: Icon, desc }: StatusItemProps) => {
    const isOperational = ok === true || ok === 'connected';
    const isRateLimited = ok === 'rate_limited';
    const isDegraded = ok === false || ok === 'error';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="huamish-card p-10 group"
        >
            <div className="flex items-start justify-between mb-8">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                    <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] ${isOperational ? 'bg-white/5 text-white border border-white/10' :
                    isRateLimited ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/10' :
                        isDegraded ? 'bg-red-500/10 text-red-500 border border-red-500/10' :
                            'bg-blue-500/10 text-blue-500 border border-blue-500/10'
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isOperational ? 'bg-white animate-pulse' :
                        isRateLimited ? 'bg-yellow-500 animate-pulse' :
                            isDegraded ? 'bg-red-500' :
                                'bg-blue-500'
                        }`} />
                    {isOperational ? 'Operational' : isRateLimited ? 'Rate Limited' : isDegraded ? 'Degraded' : 'Checking'}
                </div>
            </div>
            <h3 className="text-2xl font-black mb-3 tracking-tight">{name}</h3>
            <p className="text-sm text-[#666] group-hover:text-[#aaa] transition-colors leading-relaxed font-medium">{desc}</p>
        </motion.div>
    );
};

export default function StatusPage({ apiOk, dbOk, geminiStatus }: {
    apiOk: boolean | null,
    dbOk: boolean | null,
    geminiStatus: 'connected' | 'error' | 'rate_limited' | 'checking'
}) {
    return (
        <div className="h-full p-24 overflow-y-auto custom-scrollbar min-h-0">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-24">
                    <div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-1 bg-white" />
                            <span className="text-xs font-black tracking-[0.4em] text-[#808080] uppercase">Infrastructure</span>
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter">System_Status</h1>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="group flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
                    >
                        <RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-700" />
                        Refresh_Link
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <StatusItem
                        name="FastAPI_Base"
                        ok={apiOk}
                        icon={Server}
                        desc="Core orchestration layer handling request routing and security."
                    />
                    <StatusItem
                        name="Neon_POSTGRES"
                        ok={dbOk}
                        icon={Database}
                        desc="Distributed SQL engine for persistent state management."
                    />
                    <StatusItem
                        name="Gemini_2.0_Pro"
                        ok={geminiStatus}
                        icon={Cpu}
                        desc={geminiStatus === 'rate_limited' ? "High-capacity inference temporarily throttled." : "Large language model powering decision nodes."}
                    />
                </div>

                <div className="p-12 bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                        <ShieldCheck className="w-64 h-64 text-white" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-3xl font-black mb-6 tracking-tight">Reliability_Protocol</h2>
                        <p className="text-lg text-[#666] leading-relaxed font-medium group-hover:text-[#888] transition-colors">
                            We operate on a zero-trust, high-availability architecture. Every node is monitored for latency and drift. For enterprise SLA support, please consult your deployment documentation.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
