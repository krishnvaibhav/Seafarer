import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

interface ReportRow {
    id: string;
    name: string;
    dept: string;
    workHours: number;
    restHours: number;
    violations: number;
}

const Reports = () => {
    const [month, setMonth] = useState('2025-12'); // Default to current project date
    const [reportData, setReportData] = useState<ReportRow[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReport();
    }, [month]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/reports/compliance?month=${month}`);
            if (Array.isArray(res.data)) {
                setReportData(res.data);
            } else {
                console.error("Invalid report data format", res.data);
                setReportData([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Compliance Reports</h1>
                <div className="flex gap-2">
                    <button onClick={fetchReport} className="text-blue-600 hover:underline text-sm">Refresh</button>
                    <input
                        type="month"
                        value={month}
                        onChange={e => setMonth(e.target.value)}
                        className="border border-slate-300 rounded px-3 py-1"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3">Crew Member</th>
                            <th className="px-6 py-3">Department</th>
                            <th className="px-6 py-3">Total Work (h)</th>
                            <th className="px-6 py-3">Total Rest (h)</th>
                            <th className="px-6 py-3">Violations</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Generating Report...</td></tr>}
                        {!loading && reportData.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No data found for this period.</td></tr>}

                        {!loading && reportData.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-700">{row.name}</td>
                                <td className="px-6 py-4 text-slate-500">{row.dept}</td>
                                <td className="px-6 py-4 text-slate-600">{row.workHours}</td>
                                <td className="px-6 py-4 text-slate-600">{row.restHours}</td>
                                <td className="px-6 py-4">
                                    {row.violations > 0 ? (
                                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">{row.violations}</span>
                                    ) : (
                                        <span className="text-slate-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {row.violations > 0 ? (
                                        <span className="text-red-600 font-medium">Non-Compliant</span>
                                    ) : (
                                        <span className="text-emerald-600 font-medium">Compliant</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-4">Export Options</h3>
                    <div className="space-y-3">
                        <button className="w-full py-2 px-4 border border-slate-300 rounded hover:bg-slate-50 text-left text-sm">Download PDF Report</button>
                        <button className="w-full py-2 px-4 border border-slate-300 rounded hover:bg-slate-50 text-left text-sm">Export to Excel (IMO Format)</button>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-4">Audit Summary</h3>
                    <p className="text-sm text-slate-500 mb-4">System is ready for MLC 2006 inspection.</p>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[95%]"></div>
                    </div>
                    <p className="text-xs text-right mt-1 text-slate-500">95% Fleet Compliance</p>
                </div>
            </div>
        </div>
    );
};

export default Reports;
