// c:\Users\krish\.gemini\antigravity\scratch\Seafarer\SeaRoster\client\src\pages\Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// types
interface Crew {
    id: string;
    firstName: string;
    lastName: string;
    rank: string;
    department: string;
}

const Dashboard = () => {
    const [crewList, setCrewList] = useState<Crew[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCrew, setNewCrew] = useState({ firstName: '', lastName: '', rank: '', department: 'DECK' });

    // Load Crew
    useEffect(() => {
        fetchCrew();
    }, []);

    const fetchCrew = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/crew');
            setCrewList(res.data);
        } catch (e) {
            console.error("Failed to fetch crew", e);
        }
    };

    const handleAddCrew = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3001/api/crew', newCrew);
            setShowAddForm(false);
            setNewCrew({ firstName: '', lastName: '', rank: '', department: 'DECK' });
            fetchCrew();
        } catch (e) {
            alert('Failed to add crew member');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Ship Dashboard</h1>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                    {showAddForm ? 'Cancel' : '+ Add Crew Member'}
                </button>
            </div>

            {/* Add Crew Form */}
            {showAddForm && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200 mb-8 max-w-2xl">
                    <h2 className="text-lg font-bold mb-4">New Crew Member</h2>
                    <form onSubmit={handleAddCrew} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            placeholder="First Name"
                            className="border p-2 rounded"
                            value={newCrew.firstName}
                            onChange={e => setNewCrew({ ...newCrew, firstName: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Last Name"
                            className="border p-2 rounded"
                            value={newCrew.lastName}
                            onChange={e => setNewCrew({ ...newCrew, lastName: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Rank (e.g. Master, AB)"
                            className="border p-2 rounded"
                            value={newCrew.rank}
                            onChange={e => setNewCrew({ ...newCrew, rank: e.target.value })}
                            required
                        />
                        <select
                            className="border p-2 rounded"
                            value={newCrew.department}
                            onChange={e => setNewCrew({ ...newCrew, department: e.target.value })}
                        >
                            <option value="DECK">DECK</option>
                            <option value="ENGINE">ENGINE</option>
                            <option value="CATERING">CATERING</option>
                        </select>
                        <div className="md:col-span-2">
                            <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700">Save Crew Member</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Department Sections */}
            {['DECK', 'ENGINE', 'CATERING'].map(dept => (
                <div key={dept} className="mb-8">
                    <h2 className="text-lg font-semibold mb-3 border-b border-slate-200 pb-1">{dept} Department</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {crewList.filter(c => c.department === dept).map(crew => (
                            <Link key={crew.id} to={`/crew/${crew.id}/log`}>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center group">
                                    <div>
                                        <h3 className="font-bold text-slate-700 group-hover:text-blue-600">{crew.lastName}, {crew.firstName}</h3>
                                        <p className="text-sm text-slate-500">{crew.rank}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 inline-block" title="Compliant"></div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {crewList.filter(c => c.department === dept).length === 0 && (
                            <p className="text-slate-400 text-sm italic">No crew in this department.</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Dashboard;
