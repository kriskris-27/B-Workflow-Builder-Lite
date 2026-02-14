import { useState, useEffect } from 'react'

export default function App() {
    const [apiOk, setApiOk] = useState<boolean | null>(null)
    const [dbOk, setDbOk] = useState<boolean | null>(null)

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const apiRes = await fetch('http://localhost:8000/health')
                setApiOk(apiRes.ok)
            } catch {
                setApiOk(false)
            }

            try {
                const dbRes = await fetch('http://localhost:8000/health/db')
                setDbOk(dbRes.ok)
            } catch {
                setDbOk(false)
            }
        }

        checkHealth()
        const interval = setInterval(checkHealth, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30 font-sans">
            {/* Background Gradient Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <nav className="border-b border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20">
                                W
                            </div>
                            <span className="font-semibold tracking-tight text-lg">Workflow Builder</span>
                        </div>

                        {/* Status Indicators */}
                        <div className="flex items-center gap-4 pl-6 border-l border-white/10">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${apiOk ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'} transition-all duration-500`} />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">API</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${dbOk ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'} transition-all duration-500`} />
                                <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">DB</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer">
                            Docs
                        </button>
                        <button className="px-6 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-neutral-200 transition-all active:scale-95 shadow-lg shadow-white/5 cursor-pointer">
                            Launch App
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-24 relative">
                <div className="max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-400 mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        v1.0 Now Live
                    </div>
                    <h1 className="text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent leading-[1.1]">
                        Intelligent Data<br />Workflows Made Simple.
                    </h1>
                    <p className="text-xl text-neutral-400 mb-12 leading-relaxed max-w-2xl">
                        Clean, summarize, extract, and tag your data with a visual workflow engine powered by AI. Seamlessly integrated with Neon PostgreSQL.
                    </p>
                    <div className="flex items-center gap-6">
                        <button className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-lg transition-all hover:shadow-[0_0_50px_-10px_rgba(79,70,229,0.6)] active:scale-[0.98] cursor-pointer">
                            Plan your first Workflow
                        </button>
                        <button className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] cursor-pointer">
                            Explore Demos
                        </button>
                    </div>
                </div>

                {/* Features Preview */}
                <div className="mt-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { name: 'Clean', desc: 'Sanitize and normalize raw data inputs.' },
                        { name: 'Summarize', desc: 'Condense long content into key insights.' },
                        { name: 'Extract', desc: 'Pull structured data from unstructured text.' },
                        { name: 'Tag', desc: 'Automatically categorize using custom logic.' }
                    ].map((step) => (
                        <div key={step.name} className="group p-8 bg-white/[0.03] border border-white/[0.05] rounded-[2.5rem] hover:bg-white/10 hover:border-white/20 transition-all duration-500 cursor-pointer overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <span className="text-neutral-400 group-hover:text-white transition-colors">✨</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 relative z-10">{step.name}</h3>
                            <p className="text-neutral-500 text-sm relative z-10 leading-relaxed group-hover:text-neutral-300 transition-colors">
                                {step.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}