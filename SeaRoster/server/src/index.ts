// c:\Users\krish\.gemini\antigravity\scratch\Seafarer\SeaRoster\server\src\index.ts

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { ComplianceEngine } from './compliance';

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// --- Mock Auth Middleware (Replace with real JWT later) ---
const mockAuth = async (req: any, res: any, next: any) => {
    // In a real app, verify token and attach user
    // For demo, we assume a header 'x-user-id'
    const userId = req.headers['x-user-id'];
    if (userId) {
        req.user = { id: userId, role: 'ADMIN' }; // Mock
    }
    next();
};

app.use(mockAuth);

// --- Routes ---

// 1. Get Crew List
app.get('/api/crew', async (req, res) => {
    const crew = await prisma.crewMember.findMany();
    res.json(crew);
});

// 1.5 Create Crew Member
app.post('/api/crew', async (req, res) => {
    try {
        const { firstName, lastName, rank, department } = req.body;
        const newCrew = await prisma.crewMember.create({
            data: {
                firstName,
                lastName,
                rank,
                department
            }
        });
        res.json(newCrew);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to create crew member' });
    }
});

// 2. Get Logs for Crew (Range)
app.get('/api/logs', async (req, res) => {
    const { crewId, startDate, endDate } = req.query;
    if (!crewId) return res.status(400).json({ error: 'Missing crewId' });

    const logs = await prisma.dailyLog.findMany({
        where: {
            crewId: String(crewId),
            date: {
                gte: String(startDate),
                lte: String(endDate)
            }
        }
    });
    res.json(logs);
});

// 3. Save Log (Upsert) - Core Offline Sync Endpoint
app.post('/api/logs', async (req, res) => {
    const { crewId, date, grid, isSignedByCrew } = req.body;

    // Validate Compliance immediately to return feedback
    const violations = ComplianceEngine.checkDaily(grid);

    try {
        const log = await prisma.dailyLog.upsert({
            where: {
                crewId_date: { crewId, date }
            },
            update: { grid, isSignedByCrew, updatedAt: new Date() },
            create: { crewId, date, grid, isSignedByCrew }
        });
        res.json({ log, violations });
    } catch (e: any) {
        if (e.code === 'P2003') {
            return res.status(400).json({ error: 'Crew member not found. Please refresh the page to get the latest data.' });
        }
        console.error(e);
        res.status(500).json({ error: 'Failed to save log' });
    }
});

// 4. Reporting/Stats
// 4. Reporting/Stats
app.get('/api/reports/compliance', async (req, res) => {
    const { month } = req.query; // e.g. "2025-12"

    if (!month) return res.status(400).json({ error: 'Month required (YYYY-MM)' });

    const startDate = `${month}-01`;
    const endDate = `${month}-31`; // Simple approx

    try {
        const crewList = await prisma.crewMember.findMany();

        // In a Production app, use raw SQL or specialized aggregation for performance.
        // Here we iterate for detailed stats (inefficient but fine for MVP < 100 crew).
        const report = await Promise.all(crewList.map(async (crew) => {
            console.log(`Generating report for ${crew.firstName} (ID: ${crew.id}). Range: ${startDate} to ${endDate}`);
            const logs = await prisma.dailyLog.findMany({
                where: {
                    crewId: crew.id,
                    date: { gte: startDate, lte: endDate }
                }
            });
            console.log(`Found ${logs.length} logs for ${crew.firstName}`);

            // Calculate aggregate stats
            let totalWork = 0;
            let totalRest = 0;
            let violations = 0;

            logs.forEach(log => {
                const work = log.grid.split('').filter(c => c === 'W').length * 0.5;
                const rest = 24 - work;
                totalWork += work;
                totalRest += rest;

                // Re-check compliance
                const dailyRest = log.grid.split('').filter(c => c === 'R').length * 0.5;
                if (dailyRest < 10) violations++;
            });

            return {
                id: crew.id,
                name: `${crew.lastName}, ${crew.firstName}`,
                dept: crew.department,
                workHours: totalWork,
                restHours: totalRest,
                violations,
                logCount: logs.length
            };
        }));

        res.json(report);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// --- Serve Static Frontend (Production) ---
// Note: Frontend is deployed separately (e.g. Vercel)
app.get('/', (req, res) => {
    res.send('SeaRoster Backend is Live! 🚀');
});

// Start
app.listen(PORT, '0.0.0.0', () => {
    console.log(`SeaRoster Backend running on port ${PORT}`);
    console.log(`Demo URL: http://localhost:${PORT}`);
});
