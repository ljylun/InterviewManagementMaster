
import { Candidate, CandidateStatus, Job, Application } from './types';

export const MOCK_JOBS: Job[] = [
  { 
    id: 'j1', 
    title: 'Senior Frontend Engineer', 
    department: 'Engineering', 
    location: 'Remote', 
    type: 'Full-time', 
    status: 'Hiring',
    recruiter: 'Sarah Connor',
    hiringManager: 'John Doe',
    targetCount: 2,
    hiredCount: 0
  },
  { 
    id: 'j2', 
    title: 'Product Manager', 
    department: 'Product', 
    location: 'New York', 
    type: 'Full-time', 
    status: 'Hiring',
    recruiter: 'Sarah Connor',
    hiringManager: 'Jane Smith',
    targetCount: 1,
    hiredCount: 0
  },
  { 
    id: 'j3', 
    title: 'UX Designer', 
    department: 'Design', 
    location: 'San Francisco', 
    type: 'Contract', 
    status: 'Paused',
    recruiter: 'Mike Ross',
    hiringManager: 'Rachel Zane',
    targetCount: 1,
    hiredCount: 1
  }
];

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    name: 'Alice Johnson',
    role: 'Senior Frontend Engineer',
    email: 'alice@example.com',
    phone: '+1 555-0101',
    experience: 6,
    education: 'BS CS, MIT',
    tags: ['React', 'TypeScript', 'Redux'],
    avatarUrl: 'https://picsum.photos/200/200?random=1',
    resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    workExperience: [
      {
        company: 'TechFlow Solutions',
        role: 'Senior Frontend Engineer',
        startDate: '2021-03',
        endDate: 'Present',
        description: 'Leading a team of 4 devs, migrated monolith to micro-frontends.'
      },
      {
        company: 'WebWorks Inc.',
        role: 'Frontend Developer',
        startDate: '2018-06',
        endDate: '2021-02',
        description: 'Developed e-commerce platform using React and Node.js.'
      }
    ]
  },
  {
    id: 'c2',
    name: 'Bob Smith',
    role: 'Product Manager',
    email: 'bob@example.com',
    phone: '+1 555-0102',
    experience: 4,
    education: 'MBA, Harvard',
    tags: ['Agile', 'Jira', 'Strategy'],
    avatarUrl: 'https://picsum.photos/200/200?random=2',
    workExperience: [
        {
          company: 'Innovate Corp',
          role: 'Product Owner',
          startDate: '2019-01',
          endDate: 'Present',
          description: 'Managed product roadmap for SaaS billing system.'
        }
    ]
  },
  {
    id: 'c3',
    name: 'Charlie Davis',
    role: 'Full Stack Dev',
    email: 'charlie@example.com',
    phone: '+1 555-0103',
    experience: 8,
    education: 'MS CS, Stanford',
    tags: ['Vue', 'AWS', 'Leadership'],
    avatarUrl: 'https://picsum.photos/200/200?random=3'
  },
  {
    id: 'c4',
    name: 'Diana Prince',
    role: 'UX Designer',
    email: 'diana@example.com',
    phone: '+1 555-0104',
    experience: 5,
    education: 'BA Design, RISD',
    tags: ['Figma', 'User Research'],
    avatarUrl: 'https://picsum.photos/200/200?random=4'
  }
];

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'a1',
    jobId: 'j1',
    candidateId: 'c1',
    status: CandidateStatus.INTERVIEWING,
    interviewRound: 2,
    appliedAt: '2023-10-15',
    updatedAt: '2023-10-20'
  },
  {
    id: 'a2',
    jobId: 'j2',
    candidateId: 'c2',
    status: CandidateStatus.NEW,
    interviewRound: 0,
    appliedAt: '2023-10-20',
    updatedAt: '2023-10-20'
  },
  {
    id: 'a3',
    jobId: 'j1',
    candidateId: 'c3',
    status: CandidateStatus.OFFER,
    interviewRound: 3,
    score: 4.8,
    appliedAt: '2023-10-10',
    updatedAt: '2023-10-25'
  },
  {
    id: 'a4',
    jobId: 'j3',
    candidateId: 'c4',
    status: CandidateStatus.SCREENED,
    interviewRound: 0,
    appliedAt: '2023-10-18',
    updatedAt: '2023-10-19'
  }
];

export const KANBAN_COLUMNS = [
  { id: CandidateStatus.NEW, title: 'New', color: 'bg-blue-100 text-blue-800' },
  { id: CandidateStatus.SCREENED, title: 'Screened', color: 'bg-purple-100 text-purple-800' },
  { id: CandidateStatus.INTERVIEWING, title: 'Interviewing', color: 'bg-yellow-100 text-yellow-800' },
  { id: CandidateStatus.OFFER, title: 'Offer Pending', color: 'bg-orange-100 text-orange-800' },
  { id: CandidateStatus.HIRED, title: 'Hired', color: 'bg-green-100 text-green-800' },
  { id: CandidateStatus.REJECTED, title: 'Rejected', color: 'bg-red-100 text-red-800' },
  { id: CandidateStatus.TALENT_POOL, title: 'Talent Pool', color: 'bg-gray-100 text-gray-800' }
];
