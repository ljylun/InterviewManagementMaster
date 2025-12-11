
export enum CandidateStatus {
  NEW = 'New',
  SCREENED = 'Screened',
  INTERVIEWING = 'Interviewing',
  OFFER = 'Offer',
  HIRED = 'Hired',
  REJECTED = 'Rejected',
  TALENT_POOL = 'Talent Pool'
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: CandidateStatus;
  interviewRound: number;
  score?: number;
  rejectReason?: string;
  appliedAt: string;
  updatedAt: string;
  reviews?: InterviewReview[];
}

export interface WorkExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: string; // Current/Last Role
  experience: number;
  education: string;
  tags: string[];
  resumeUrl?: string;
  resumeText?: string;
  workExperience?: WorkExperience[];
  // History is derived from Applications
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: 'Hiring' | 'Paused' | 'Closed' | 'Draft';
  recruiter: string;
  hiringManager: string;
  targetCount: number;
  hiredCount: number;
}

export interface InterviewReview {
  id: string;
  interviewerName: string;
  score: number;
  decision: 'Pass' | 'Reject' | 'Hold';
  comment: string;
  date: string;
}

// A combined type for Kanban display (Application + Candidate Info)
export interface ApplicationCandidate extends Candidate {
  applicationId: string;
  status: CandidateStatus;
  interviewRound: number;
  interviewScore?: number;
  rejectReason?: string;
  jobId?: string; // For context
}

export type KanbanColumn = {
  id: CandidateStatus;
  title: string;
  color: string;
};
