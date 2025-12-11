
import React from 'react';
import { Job, ApplicationCandidate, CandidateStatus, Candidate } from '../types';
import KanbanBoard from './KanbanBoard';
import { ArrowLeft, Users, Briefcase, Plus, UserPlus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface JobDetailProps {
  job: Job;
  applications: ApplicationCandidate[];
  onBack: () => void;
  onAddCandidate: () => void;
  onStatusChange: (id: string, newStatus: CandidateStatus) => void;
  onSelectCandidate: (candidate: ApplicationCandidate) => void;
  onInterviewStart: (candidate: ApplicationCandidate) => void;
  onDeleteCandidate: (id: string) => void;
}

const JobDetail: React.FC<JobDetailProps> = ({ 
  job, 
  applications, 
  onBack, 
  onAddCandidate, 
  onStatusChange, 
  onSelectCandidate,
  onInterviewStart,
  onDeleteCandidate
}) => {
  const { t } = useLanguage();

  const totalCandidates = applications.length;
  const activeCandidates = applications.filter(a => 
    a.status !== CandidateStatus.REJECTED && a.status !== CandidateStatus.HIRED
  ).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Job Header */}
      <div className="bg-white border-b border-slate-200 p-6 flex-shrink-0">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                {job.title}
                <span className={`text-xs px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                  job.status === 'Hiring' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {job.status}
                </span>
              </h1>
              <div className="flex items-center gap-4 text-slate-500 text-sm mt-1">
                <span className="flex items-center gap-1"><Briefcase size={14}/> {job.department}</span>
                <span>•</span>
                <span>{job.location}</span>
                <span>•</span>
                <span>{job.type}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onAddCandidate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-600/20 font-medium transition-all"
          >
            <UserPlus size={18} /> {t.app.add_candidate}
          </button>
        </div>

        {/* Stats & Team */}
        <div className="flex items-center gap-8 text-sm">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500">{t.job.recruiter}:</span>
              <span className="font-semibold text-slate-700">{job.recruiter}</span>
           </div>
           <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500">{t.job.hiring_manager}:</span>
              <span className="font-semibold text-slate-700">{job.hiringManager}</span>
           </div>
           <div className="h-4 w-px bg-slate-300"></div>
           <div className="flex gap-6">
              <div>
                 <span className="block text-xs text-slate-500 uppercase">{t.job.target}</span>
                 <span className="font-bold text-slate-800">{job.targetCount}</span>
              </div>
              <div>
                 <span className="block text-xs text-slate-500 uppercase">{t.job.hired}</span>
                 <span className={`font-bold ${job.hiredCount >= job.targetCount ? 'text-green-600' : 'text-blue-600'}`}>
                    {job.hiredCount}
                 </span>
              </div>
              <div>
                 <span className="block text-xs text-slate-500 uppercase">{t.job.pipeline}</span>
                 <span className="font-bold text-slate-800">{activeCandidates}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-slate-50">
        <KanbanBoard 
          candidates={applications} // Passing applications disguised as extended candidates
          onStatusChange={onStatusChange}
          onSelectCandidate={onSelectCandidate}
          onInterviewStart={onInterviewStart}
          onDeleteCandidate={onDeleteCandidate}
        />
      </div>
    </div>
  );
};

export default JobDetail;
