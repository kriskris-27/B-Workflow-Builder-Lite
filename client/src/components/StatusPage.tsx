import { Activity, ShieldCheck, Database, Zap, RefreshCw } from 'lucide-react';
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.06] transition-all group"
        >
            <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-neutral-400 group-hover:text-white" />
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isOperational ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    isRateLimited ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        isDegraded ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isOperational ? 'bg-green-500 animate-pulse' :
                        isRateLimited ? 'bg-yellow-500 animate-pulse' :
                            isDegraded ? 'bg-red-500' :
                                'bg-blue-500'
                        }`} />
                    {isOperational ? 'Operational' : isRateLimited ? 'Rate Limited' : isDegraded ? 'Degraded' : 'Checking'}
                </div>
            </div>
            <h3 className="text-xl font-bold mb-2">{name}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
        </motion.div>
    );
};

export default function StatusPage({ apiOk, dbOk, geminiStatus }: { apiOk: boolean | null, dbOk: boolean | null, geminiStatus: 'connected' | 'error' | 'rate_limited' | 'checking' }) {
    return (
        <div className="flex-1 p-12 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">System Status</h1>
                        <p className="text-neutral-500">Real-time monitoring of our core infrastructure.</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition-all active:scale-95"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatusItem
                        name="Backend API"
                        ok={apiOk}
                        icon={Activity}
                        desc="FastAPI server handling workflow orchestration."
                    />
                    <StatusItem
                        name="Database"
                        ok={dbOk}
                        icon={Database}
                        desc="Neon PostgreSQL storing workflows and results."
                    />
                    <StatusItem
                        name="AI Service"
                        ok={geminiStatus}
                        icon={Zap}
                        desc={geminiStatus === 'rate_limited' ? "Google Gemini rate limit exceeded. Please wait a few seconds." : "Google Gemini model powering the data processing."}
                    />
                </div>

                <div className="mt-12 p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8">
                        <ShieldCheck className="w-32 h-32 text-indigo-500/10 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Uptime Report</h2>
                    <p className="text-neutral-400 max-w-xl leading-relaxed">
                        We maintain a 99.9% uptime target for all services. If you encounter any persistent failures, please check your network connection or API quota limits in the .env configuration.
                    </p>
                </div>
            </div>
        </div>
    );
}
