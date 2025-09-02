
import { Timestamp } from "firebase/firestore";

export interface StadiumOwner {
    id: string;
    ownerName: string;
    authUid: string;
    credentials: {
        username: string;
    };
    status: "active" | "inactive" | "suspended";
    createdAt: Timestamp;
    createdBy: string; // super_admin_uid
    lastLoginAt?: Timestamp;
}

export interface SuperAdminUser {
    id: string;
    uid: string;
    email: string;
    fullName: string;
    role: "super_admin";
    permissions: string[];
    createdAt: Timestamp;
    lastLoginAt?: Timestamp;
}

export interface DailyStats {
    id?: string; // YYYY-MM-DD
    totalStadiumOwners: number;
    activeStadiumOwners: number;
    totalStadiums: number;
    totalCoaches: number;
    totalStudents: number;
    attendanceRecordsTaken: number;
}

export interface OwnerUsage {
    id?: string; // owner_id
    stadiumsCreated: number;
    coachesCreated: number;
    studentsEnrolled: number;
    attendanceRate: number;
    lastActivity: Timestamp;
}
