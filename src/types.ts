/**
 * Shared Type Definitions for the Secure Electronic Voting System
 */

export enum UserRole {
  ADMIN = 'admin',
  VOTER = 'voter',
  OFFICER = 'officer'
}

export type Department = 
  | 'Computer Science' 
  | 'Information Technology' 
  | 'Electrical Engineering' 
  | 'Business Administration'
  | 'Mechanical Engineering';

export interface User {
  id: string;
  studentId: string;
  name: string;
  email: string;
  passwordHash: string; // Plain password verification for simple demo checks
  role: UserRole;
  department: Department;
  votedStatus: { [electionId: string]: boolean }; // Track if voted in specific elections
  otpVerified?: boolean;
  registeredDate: string;
}

export interface Election {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
}

export interface Position {
  id: string;
  electionId: string;
  positionName: string;
}

export interface Candidate {
  id: string;
  positionId: string;
  electionId: string;
  name: string;
  photoUrl: string; // Safe placeholder SVG or mock pictures
  department: Department;
  manifesto: string;
  approved: boolean;
}

export interface Vote {
  id: string;
  voterId: string; // Real verification checks this, but hashed in the public Ledger
  candidateId: string;
  positionId: string;
  electionId: string;
  timestamp: string;
}

export interface Block {
  index: number;
  timestamp: string;
  previousHash: string;
  hash: string;
  electionId: string;
  positionId: string;
  candidateId: string;
  nonce: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  dateTime: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'danger';
}

export interface ElectionStat {
  totalVoters: number;
  votedCount: number;
  turnoutPercentage: number;
  departmentStats: { [key in Department]?: number };
}
