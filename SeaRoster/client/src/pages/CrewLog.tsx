// c:\Users\krish\.gemini\antigravity\scratch\Seafarer\SeaRoster\client\src\pages\CrewLog.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import WorkRestGrid from '../components/WorkRestGrid';
import { DEFAULT_GRID } from '../mockData';
import { API_URL } from '../config';
import { useRosterStore } from '../lib/store';
import { getLogLocal, saveLogLocal } from '../lib/db';

const CrewLog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isOnline, syncPending, processSyncQueue } = useRosterStore();

    // State
    const [crew, setCrew] = useState<any>(null);
    const [grid, setGrid] = useState(DEFAULT_GRID);
    const [status, setStatus] = useState<'Compliant' | 'Violation'>('Compliant');
    const [loading, setLoading] = useState(true);

    // Date
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Fetch Crew Details
    useEffect(() => {
        if (!id) return;

        // Fetch from API
        fetch(`${API_URL}/api/crew`)
            .then(r => r.json())
            .then(list => {
                const c = list.find((x: any) => x.id === id);
                if (c) {
                    setCrew(c);
                } else {
                    console.warn("Crew not found in API list");
                }
            })
            .catch(e => console.error("Failed to fetch crew", e));
    }, [id]);

    // Load Log Data when ID/Date changes
    useEffect(() => {
        if (!id) return;
        const load = async () => {
            setLoading(true);
            try {
                // Try local first
                const local = await getLogLocal(id, date);
                if (local) {
                    setGrid(local.grid);
                } else {
                    setGrid(DEFAULT_GRID);
                    // Optional: Try fetch from API if online
                    if (navigator.onLine) {
                        try {
                            const res = await fetch(`${API_URL}/api/logs?crewId=${id}&startDate=${date}&endDate=${date}`);
                            const remoteLogs = await res.json();
                            if (remoteLogs && remoteLogs.length > 0) {
                                setGrid(remoteLogs[0].grid);
                                await saveLogLocal(id, date, remoteLogs[0].grid);
                            }
                        } catch (e) { console.error(e); }
                    }
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, date]);

    // Simulate compliance check
    useEffect(() => {
        const restCount = grid.split('').filter(c => c === 'R').length;
        if (restCount < 20) { // < 10h
            setStatus('Violation');
        } else {
            setStatus('Compliant');
        }
    }, [grid]);

    const handleSave = async () => {
        if (!id) return;
        await saveLogLocal(id, date, grid);
        processSyncQueue();
        alert("Saved! (Synced if online, queued if offline)");
    };

    if (!crew && !loading) return (
        <div className="p-8 text-center text-slate-500">
            Crew not found. <Link to="/" className="text-blue-600 hover:underline">Return to Dashboard</Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-800 mb-4">&larr; Back to Dashboard</button>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        {crew ? (
                            <>
                                <h1 className="text-2xl font-bold text-slate-900">{crew.lastName}, {crew.firstName}</h1>
                                <p className="text-slate-500">{crew.rank} - {crew.department}</p>
                            </>
                        ) : (
                            <div className="h-8 w-48 bg-slate-200 animate-pulse rounded"></div>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className={`px-4 py-2 rounded-lg text-sm font-bold border ${status === 'Compliant' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {status === 'Violation' ? '⚠ Non-Compliant' : '✓ Compliant'}
                        </div>
                        <div className="text-xs text-slate-500">
                            Status: {isOnline ? '🟢 Online' : '🔴 Offline'} | {syncPending ? '⏳ Syncing...' : '✓ Synced'}
                        </div>
                    </div>
                </div>

                {/* Date Controls */}
                <div className="flex items-center justify-between mb-4 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <button
                        onClick={() => {
                            const d = new Date(date);
                            d.setDate(d.getDate() - 1);
                            setDate(d.toISOString().split('T')[0]);
                        }}
                        className="p-2 hover:bg-slate-200 rounded text-slate-600 font-bold"
                    >
                        &larr; Prev
                    </button>

                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="bg-transparent font-semibold text-slate-800 text-lg border-b border-slate-300 focus:border-blue-500 outline-none text-center"
                    />

                    <button
                        onClick={() => {
                            const d = new Date(date);
                            d.setDate(d.getDate() + 1);
                            setDate(d.toISOString().split('T')[0]);
                        }}
                        className="p-2 hover:bg-slate-200 rounded text-slate-600 font-bold"
                    >
                        Next &rarr;
                    </button>
                </div>

                <div className="mb-8">
                    <WorkRestGrid grid={grid} onChange={setGrid} />
                </div>

                {/* Violation Details Box */}
                {status === 'Violation' && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Compliance Violation Detected</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Total rest is less than 10 hours (STCW A-VIII/1).</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

export default CrewLog;
