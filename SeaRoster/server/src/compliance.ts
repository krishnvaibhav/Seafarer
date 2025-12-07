// c:\Users\krish\.gemini\antigravity\scratch\Seafarer\SeaRoster\server\src\compliance.ts

/**
 * Compliance Engine for SeaRoster
 * Implements STCW 2010 rules:
 * 1. Min 10 hours rest in any 24h period.
 * 2. The 10 hours may be divided into no more than 2 periods, one of which must be at least 6 hours.
 * 3. Min 77 hours rest in any 7-day period.
 */

// Helper: Parse grid string "RRWW..." into boolean array (true=Rest, false=Work)
const parseGrid = (grid: string): boolean[] => {
    return grid.split('').map(c => c === 'R');
};

export interface Violation {
    rule: string;
    description: string;
    severity: 'WARNING' | 'CRITICAL';
}

export class ComplianceEngine {

    // Check a single day (24h) for 10h rest & periods
    static checkDaily(gridStr: string): Violation[] {
        const violations: Violation[] = [];
        const slots = parseGrid(gridStr); // 48 slots

        // Rule: Total Rest >= 10h (20 slots)
        const totalRestSlots = slots.filter(r => r).length;
        if (totalRestSlots < 20) {
            violations.push({
                rule: 'STCW A-VIII/1 (Daily Rest)',
                description: `Found ${totalRestSlots / 2}h rest. Minimum req: 10h.`,
                severity: 'CRITICAL'
            });
        }

        // Rule: Max 2 periods, one >= 6h (12 slots)
        // This is complex. We identify continuous blocks of rest.
        const restPeriods: number[] = []; // lengths of rest blocks
        let currentBlock = 0;

        for (let i = 0; i < slots.length; i++) {
            if (slots[i]) {
                currentBlock++;
            } else {
                if (currentBlock > 0) restPeriods.push(currentBlock);
                currentBlock = 0;
            }
        }
        if (currentBlock > 0) restPeriods.push(currentBlock);

        // Filter out tiny periods? STCW doesn't explicitly ignore them unless checking against "periods of rest" definition, 
        // usually < 1h doesn't count, but let's stick to simple block counting for now or assume grid is accurate.
        // Actually, STCW says "intervals between consecutive periods of rest shall not exceed 14 hours".
        // The "2 periods" rule specifically applies to the 10h total.

        // Simple check: Is there at least one period >= 6h (12 slots)?
        const hasBigRest = restPeriods.some(p => p >= 12);
        if (!hasBigRest) {
            violations.push({
                rule: 'STCW A-VIII/1 (Rest Periods)',
                description: 'No rest period of at least 6 hours found.',
                severity: 'CRITICAL'
            });
        }

        // Rule: The 10 hours rest need to be in max 2 periods.
        // If we have > 2 periods, we sum the top 2. If they < 10h, potential violation (though somewhat fuzzy in interpretation if user has random short breaks).
        // Strict interpretation: You must be able to find 10h rest within just 2 blocks.
        if (restPeriods.length > 0) {
            const sorted = [...restPeriods].sort((a, b) => b - a);
            const sumTop2 = (sorted[0] || 0) + (sorted[1] || 0);
            if (sumTop2 < 20) {
                violations.push({
                    rule: 'STCW A-VIII/1 (Split Rest)',
                    description: `Cannot find 10h rest in compliant blocks. Top 2 blocks sum to ${sumTop2 / 2}h.`,
                    severity: 'WARNING'
                });
            }
        }

        return violations;
    }

    // Check 7-day trailing
    // prevGrids: array of 6 strings (days -6 to -1) + current day grid
    static checkWeekly(last6Days: string[], currentDay: string): Violation[] {
        const violations: Violation[] = [];
        const allGrids = [...last6Days, currentDay];

        let totalRestSlots = 0;
        allGrids.forEach(g => {
            totalRestSlots += g.split('').filter(c => c === 'R').length;
        });

        // Min 77h = 154 slots
        if (totalRestSlots < 154) {
            violations.push({
                rule: 'STCW A-VIII/1 (Weekly Rest)',
                description: `Found ${totalRestSlots / 2}h rest in last 7 days. Minimum req: 77h.`,
                severity: 'CRITICAL'
            });
        }

        return violations;
    }
}
