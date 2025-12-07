// c:\Users\krish\.gemini\antigravity\scratch\Seafarer\SeaRoster\client\src\lib\store.ts
import { create } from 'zustand';
import { saveLogLocal, getLogLocal, dbPromise } from './db';
import axios from 'axios';
import { API_URL } from '../config';

// types
interface RosterState {
    isOnline: boolean;
    setOnline: (status: boolean) => void;
    syncPending: boolean;
    processSyncQueue: () => Promise<void>;
}

export const useRosterStore = create<RosterState>((set, get) => ({
    isOnline: navigator.onLine,
    syncPending: false,

    setOnline: (status) => {
        set({ isOnline: status });
        if (status) {
            get().processSyncQueue();
        }
    },

    processSyncQueue: async () => {
        const db = await dbPromise;
        const queue = await db.getAll('syncQueue');

        if (queue.length === 0) return;

        set({ syncPending: true });

        // Process strictly in order
        for (const item of queue) {
            try {
                await axios({
                    method: item.method,
                    url: `${API_URL}${item.url}`, // Hardcoded for dev
                    data: item.body
                });
                // On success, remove from queue
                await db.delete('syncQueue', item.timestamp);
            } catch (e: any) {
                console.error("Sync failed for item", item, e);

                // If it's a 4xx error (e.g. Invalid Data/Foreign Key), discard it to unblock queue
                if (e.response && e.response.status >= 400 && e.response.status < 500) {
                    console.warn("Discarding invalid sync item:", item);
                    await db.delete('syncQueue', item.timestamp);
                } else {
                    // 5xx or Network error: Stop processing and retry later
                    break;
                }
            }
        }

        // Check if remaining
        const remaining = await db.getAll('syncQueue');
        set({ syncPending: remaining.length > 0 });
    }
}));

// Listen to window events
window.addEventListener('online', () => useRosterStore.getState().setOnline(true));
window.addEventListener('offline', () => useRosterStore.getState().setOnline(false));
