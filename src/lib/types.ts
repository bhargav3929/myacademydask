
import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  organizationId: string;
  role: "owner" | "coach";
  assignedStadiums: string[]; 
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
}

export interface Organization {
  id: string;
  organizationName: string;
  ownerId: string;
  createdAt: Timestamp;
}

export interface CoachDetails {
    name: string;
    email: string;
    username: string;
    phone: string;
}

export interface Stadium {
  id: string;
  name: string;
  location: string;
  organizationId: string;
  assignedCoachId: string;
  coachDetails: CoachDetails;
  status: "active" | "inactive";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: {
    operatingDays: string[];
    defaultSchedule: string;
  }
}

export interface Student {
  id: string;
  name: string;
  age: number;
  parentContact: string;
  parentEmail: string;
  stadiumId: string;
  coachId: string;
  organizationId: string;
  admissionDate: Timestamp;
  status: 'active' | 'trial' | 'inactive';
  addedBy: string; // coach's UID
  // Legacy fields for compatibility
  fullName: string; 
  joinDate: Timestamp;
  createdAt: Timestamp;
}

export interface Attendance {
  id?: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: "present" | "absent";
  markedByCoachId: string;
  stadiumId: string;
  organizationId: string;
  timestamp: Timestamp;
}

export interface Schedule {
    id?: string;
    stadiumId: string;
    weekStartDate: string; // YYYY-MM-DD
    schedule: {
        [day: string]: "active" | "holiday";
    }
    createdByCoachId: string;
    createdAt: Timestamp;
}
