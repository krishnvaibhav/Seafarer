// c:\Users\krish\.gemini\antigravity\scratch\Seafarer\SeaRoster\client\src\App.tsx

// c:\Users\krish\.gemini\antigravity\scratch\Seafarer\SeaRoster\client\src\App.tsx

// import React from 'react'; // Not needed in Vite/React 18+
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CrewLog from './pages/CrewLog';
import Layout from './components/Layout';

import Reports from './pages/Reports';

function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/files" element={<Dashboard />} />
                    <Route path="/crew/:id/log" element={<CrewLog />} />
                    <Route path="/reports" element={<Reports />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}

export default App;
