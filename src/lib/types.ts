import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'owner' | 'coach';
  organizationId?: string;
  assignedStadiums?: string[];
}

export interface Stadium {
  id: string;
  name: string;
  organizationId: string;
  ownerId: string;
  address: string;
  status: 'active' | 'inactive';
}

export interface Student {
  id: string;
  fullName?: string;
  age?: number;
  batch?: string;
  status?: 'active' | 'trial' | 'inactive';
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
