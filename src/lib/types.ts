
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

export interface Stadium {
  id: string;
  name: string;
  location: string;
  organizationId: string;
  assignedCoachId?: string;
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
