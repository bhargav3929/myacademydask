
import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  organizationId: string;
  role: "owner" | "coach";
  assignedStadiums?: string[];
  createdAt: Timestamp;
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
    phone?: string;
}

export interface Stadium {
  id: string;
  name: string;
  location: string;
  organizationId: string;
  assignedCoachId?: string;
  coachDetails?: CoachDetails;
  createdAt: Timestamp;
}

export interface Student {
  id: string;
  fullName: string;
  joinDate: Timestamp;
  stadiumId: string;
  organizationId: string;
  createdAt: Timestamp;
}

export interface Attendance {
  id?: string; // Optional because it's auto-generated on write
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
        monday: "active" | "holiday";
        tuesday: "active" | "holiday";
        wednesday: "active" | "holiday";
        thursday: "active" | "holiday";
        friday: "active" | "holiday";
        saturday: "active" | "holiday";
        sunday: "active" | "holiday";
    }
    createdByCoachId: string;
    createdAt: Timestamp;
}
