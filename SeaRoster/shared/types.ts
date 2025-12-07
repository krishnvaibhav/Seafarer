// Shared Types for SeaRoster

export type Role = 'ADMIN' | 'DEPT_HEAD' | 'CREW';
export type Department = 'DECK' | 'ENGINE' | 'CATERING';

export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    department?: Department; // Null for Admin
}

export interface CrewMember {
    id: string;
    userId?: string; // Optional link to login user
    firstName: string;
    lastName: string;
    rank: string;
    department: Department;
}

// 48 slots (30 min each) for a 24h day.
// Values: 'W' (Work), 'R' (Rest), 'O' (Other/Neutral if needed), etc.
export type DayGrid = string[];

// Represents a single day's record
export interface DailyLog {
    id: string;
    crewId: string;
    date: string; // YYYY-MM-DD
    grid: string; // Serialized string of 48 chars (e.g., "RRRRWWWW...")
    isSignedByCrew: boolean;
    isSignedByMaster: boolean;
    remarks?: string;
    lastBasedOnScheduleId?: string;
    updatedAt: number; // Timestamp for sync
}

export interface ComplianceResult {
    isCompliant: boolean;
    violations: Violation[];
}

export interface Violation {
    rule: 'STCW_24_REST' | 'STCW_7_DAY_REST' | 'STCW_REST_PERIODS' | 'MLC_MAX_WORK';
    description: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    date: string;
}

export interface SyncPacket {
    logs: DailyLog[];
    lastSyncTimestamp: number;
}
