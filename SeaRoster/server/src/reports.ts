// c:\Users\krish\.gemini\antigravity\scratch\Seafarer\SeaRoster\server\src\reports.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const generateMonthlyReport = async (month: string, department?: string) => {
    // month format YYYY-MM
    // This is a mock specialized aggregation
    // In real app, we'd do complex SQL or in-memory aggregation of logs

    const logs = await prisma.dailyLog.findMany({
        where: {
            date: { startsWith: month },
            crewMember: department ? { department } : undefined
        },
        include: {
            crewMember: true
        }
    });

    const reportData = logs.map(log => {
        // Calculate non-compliance
        // This relies on the client/shared engine usually, but for reporting we might re-run it
        // For now, return raw stats
        const workHours = log.grid.split('').filter(c => c === 'W').length / 2;
        return {
            crewName: `${log.crewMember.lastName}, ${log.crewMember.firstName}`,
            date: log.date,
            workHours,
            restHours: 24 - workHours
        };
    });

    return reportData;
};
