import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'owner' | 'coach';
  organizationId?: string;
  assignedStadiums?: string[];
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
  organizationId: string;
  ownerId?: string;
  address?: string;
  location?: string;
  status: 'active' | 'inactive';
  assignedCoachId?: string;
  coachDetails?: CoachDetails;
  coachName?: string;
  coachEmail?: string;
  coachPhone?: string;
  batches?: Batch[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  dateAdded?: Timestamp;
}

export interface Batch {
  id: string;
  name: string;
  timing?: string;
}

export interface Student {
  id: string;
  fullName?: string;
  age?: number;
  batch?: string;
  status: 'active' | 'trial' | 'inactive';
  [key: string]: any; 
}

export interface Attendance {
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent';
  batch: string;
  markedByCoachId: string;
  organizationId: string;
  stadiumId: string;
  timestamp: Timestamp;
}

export interface AttendanceSubmission {
  studentId: string;
  status: 'present' | 'absent';
  date: string;
  batch: string;
  markedByCoachId: string;
  submittedByCoachId: string;
  organizationId: string;
  stadiumId: string;
  timestamp: Timestamp;
}

export interface Report {
  id: string;
  type: 'attendance' | 'finance' | 'custom';
  generatedOn: Timestamp;
  // ... other report fields
}

export interface Organization {
  id: string;
  name: string;
  ownerId: string;
  // ... other organization fields
}

export interface Coach {
  id: string;
  name: string;
  fullName: string;
  email: string;
  username: string;
  phone: string;
  organizationId: string;
  assignedStadiums?: string[];
  role: 'coach';
}

export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  role: 'super-admin' | 'owner' | 'coach';
  organizationId?: string;
  assignedStadiums?: string[];
}

// StudentBatches is now just a string representing the batch name/ID
export type StudentBatches = string;
