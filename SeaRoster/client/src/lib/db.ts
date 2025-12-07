// c:\Users\krish\.gemini\antigravity\scratch\Seafarer\SeaRoster\client\src\lib\db.ts
import { openDB, DBSchema } from 'idb';

interface SeaRosterDB extends DBSchema {
    logs: {
        key: string; // Composite key: crewId_date
        value: {
            crewId: string;
            date: string;
            grid: string;
            updatedAt: number;
            synced: boolean;
            key: string;
        };
    };
    syncQueue: {
        key: number;
        value: {
            url: string;
            method: string;
            body: any;
            timestamp: number;
        };
    };
}

export const dbPromise = openDB<SeaRosterDB>('searoster-db', 1, {
    upgrade(db) {
        db.createObjectStore('logs', { keyPath: 'key' });
        db.createObjectStore('syncQueue', { keyPath: 'timestamp' });
    },
});

export const saveLogLocal = async (crewId: string, date: string, grid: string) => {
    const db = await dbPromise;
    const key = `${crewId}_${date}`;
    await db.put('logs', {
        crewId,
        date,
        grid,
        updatedAt: Date.now(),
        synced: false,
        key
    });

    // Add to sync queue
    await db.put('syncQueue', {
        url: '/api/logs',
        method: 'POST',
        body: { crewId, date, grid, isSignedByCrew: false },
        timestamp: Date.now(),
    });
};

export const getLogLocal = async (crewId: string, date: string) => {
    const db = await dbPromise;
    return db.get('logs', `${crewId}_${date}`);
};
