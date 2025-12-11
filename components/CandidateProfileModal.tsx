
import React from 'react';
import { ApplicationCandidate, Candidate, Application, Job, CandidateStatus } from '../types';
import { X, Mail, Phone, MapPin, Briefcase, GraduationCap, Calendar, Download, ExternalLink, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CandidateProfileModalProps {
  candidate: Candidate;
  applications: Application[]; // History
  jobs: Job[]; // To resolve job titles
  onClose: () => void;
}

const CandidateProfileModal: React.FC<CandidateProfileModalProps> = ({ candidate, applications, jobs, onClose }) => {
  const { t } = useLanguage();

  const getJobTitle = (jobId: string) => jobs.find(j => j.id === jobId)?.title || 'Unknown Job';

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex justify-end backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
           <div className="flex gap-5">
              <img src={candidate.avatarUrl} className="w-20 h-20 rounded-xl border-4 border-white shadow-md" alt={candidate.name} />
              <div>
                 <h2 className="text-2xl font-bold text-slate-800">{candidate.name}</h2>
                 <p className="text-slate-600 font-medium">{candidate.role}</p>
                 <div className="flex gap-2 mt-2">
                    {candidate.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-600">{tag}</span>
                    ))}
                 </div>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
              <X size={24} />
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Mail size={18} className="text-blue-500" />
                    <span className="text-sm text-slate-700">{candidate.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Phone size={18} className="text-blue-500" />
                    <span className="text-sm text-slate-700">{candidate.phone}</span>
                </div>
            </div>

            {/* Resume Preview Actions */}
            <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 border border-slate-200 py-3 rounded-lg hover:bg-slate-50 text-slate-700 font-medium transition-colors">
                    <Download size={18} /> Download Resume
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 py-3 rounded-lg hover:bg-blue-700 text-white font-medium transition-colors">
                    <ExternalLink size={18} /> View Original PDF
                </button>
            </div>

            {/* Work Experience Timeline */}
            <div>
                 <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Clock size={20} className="text-blue-600" />
                    {t.profile.timeline}
                 </h3>
                 <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 pb-4">
                    {(candidate.workExperience || []).length > 0 ? (
                        candidate.workExperience!.map((exp, idx) => (
                            <div key={idx} className="relative pl-8">
                                <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white border-2 border-blue-500 rounded-full"></div>
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-slate-800 text-base">{exp.company}</h4>
                                    <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                        {exp.startDate} - {exp.endDate}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-blue-600 mb-2">{exp.role}</p>
                                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    {exp.description}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="pl-8 text-slate-500 italic">No detailed work history available.</div>
                    )}
                 </div>
            </div>

            {/* Application History */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Briefcase size={20} className="text-blue-600" />
                    {t.profile.history}
                </h3>
                <div className="space-y-4">
                    {applications.map(app => (
                        <div key={app.id} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-white shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800">{getJobTitle(app.jobId)}</h4>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    app.status === CandidateStatus.HIRED ? 'bg-green-100 text-green-700' :
                                    app.status === CandidateStatus.REJECTED ? 'bg-red-100 text-red-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {app.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                <span className="flex items-center gap-1"><Calendar size={12}/> {app.appliedAt}</span>
                                {app.interviewRound > 0 && <span>Round: {app.interviewRound}</span>}
                                {app.score && <span>Score: {app.score}/5</span>}
                            </div>
                            {app.rejectReason && (
                                <div className="bg-red-50 text-red-700 text-sm p-2 rounded mt-2">
                                    <strong>Reason:</strong> {app.rejectReason}
                                </div>
                            )}
                        </div>
                    ))}
                    {applications.length === 0 && (
                        <p className="text-slate-400 italic text-sm">No application history found.</p>
                    )}
                </div>
            </div>

            {/* Education Summary */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <GraduationCap size={16} /> {t.interview.education}
                 </h3>
                 <p className="font-bold text-slate-800">{candidate.education}</p>
                 <p className="text-sm text-slate-500 mt-1">Highest Degree Obtained</p>
            </div>

        </div>
      </div>
    </div>
  );
};

export default CandidateProfileModal;
