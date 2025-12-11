
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import JobStats from './components/JobStats';
import KanbanBoard from './components/KanbanBoard';
import JobDetail from './components/JobDetail';
import ResumeUploader from './components/ResumeUploader';
import InterviewSession from './components/InterviewSession';
import CandidateProfileModal from './components/CandidateProfileModal';
import { MOCK_CANDIDATES, MOCK_JOBS, MOCK_APPLICATIONS } from './constants';
import { Candidate, CandidateStatus, Job, Application, ApplicationCandidate } from './types';
import { Plus, Search, Bell, Filter, Globe } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

const App: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const [activePage, setActivePage] = useState('candidates');
  
  // Core Data State
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);

  // UI State
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeInterviewCandidate, setActiveInterviewCandidate] = useState<ApplicationCandidate | null>(null);
  const [viewingCandidateId, setViewingCandidateId] = useState<string | null>(null);

  // --- Derived State ---
  
  // Get active job object
  const activeJob = useMemo(() => jobs.find(j => j.id === activeJobId), [jobs, activeJobId]);

  // Combine Application + Candidate data for Kanban
  const kanbanItems: ApplicationCandidate[] = useMemo(() => {
    if (activeJobId) {
        // Job View: Show only applications for this job
        return applications
            .filter(app => app.jobId === activeJobId)
            .map(app => {
                const candidate = candidates.find(c => c.id === app.candidateId);
                if (!candidate) return null;
                return {
                    ...candidate,
                    applicationId: app.id,
                    status: app.status,
                    interviewRound: app.interviewRound,
                    interviewScore: app.score,
                    rejectReason: app.rejectReason,
                    jobId: app.jobId
                };
            })
            .filter((item): item is ApplicationCandidate => item !== null)
            .filter(item => 
                 item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 item.role.toLowerCase().includes(searchQuery.toLowerCase())
            );
    } else if (activePage === 'candidates') {
        // Talent Pool View: Show all candidates, treat them as "in pool" if no status override
        return candidates
            .filter(c => 
                 c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                 c.role.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(c => ({
                ...c,
                applicationId: '', // No application context in pool
                status: CandidateStatus.TALENT_POOL, 
                interviewRound: 0
            }));
    }
    return [];
  }, [candidates, applications, activeJobId, activePage, searchQuery]);

  // --- Handlers ---

  const handleStatusChange = (id: string, newStatus: CandidateStatus) => {
    if (activeJobId) {
        // We are moving an Application Card
        setApplications(prev => prev.map(app => {
            if (app.id === id) {
                 const updates: Partial<Application> = { status: newStatus };
                 if (newStatus === CandidateStatus.HIRED) {
                     // Logic: Update Job Hired Count could go here
                 }
                 return { ...app, ...updates };
            }
            return app;
        }));
    } else {
        // In Talent Pool, dragging usually doesn't make sense unless we have specific pool columns
        console.log("Status change in pool not fully supported yet");
    }
  };

  const handleAddCandidate = (candidateData: Partial<Candidate>, file: File | null) => {
    // 1. Check if candidate exists (Simple dedupe by email)
    let candidateId = candidates.find(c => c.email === candidateData.email)?.id;
    let isNewCandidate = false;

    if (!candidateId) {
        candidateId = `c${Date.now()}`;
        const newCandidate: Candidate = {
            id: candidateId,
            name: candidateData.name!,
            email: candidateData.email!,
            role: candidateData.role || 'Applicant',
            phone: candidateData.phone || '',
            experience: candidateData.experience || 0,
            education: candidateData.education || '',
            tags: candidateData.tags || [],
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(candidateData.name!)}&background=random`,
            resumeUrl: file ? URL.createObjectURL(file) : undefined
        };
        setCandidates(prev => [newCandidate, ...prev]);
        isNewCandidate = true;
    } else {
        // Candidate Exists
        if (activeJobId) {
            // Check if they already have an application for this job
            const existingApp = applications.find(a => a.jobId === activeJobId && a.candidateId === candidateId);
            if (existingApp) {
                alert("Candidate already in this pipeline.");
                setShowImportModal(false);
                return;
            }
            // Check if they are active in ANY other job (Requirement: Warning)
            const otherActiveApp = applications.find(a => a.candidateId === candidateId && a.status !== CandidateStatus.REJECTED && a.status !== CandidateStatus.HIRED);
            if (otherActiveApp && !window.confirm(t.app.duplicate_warn)) {
                return;
            }
        }
    }

    // 2. If in Job Context, create Application
    if (activeJobId) {
        const newApp: Application = {
            id: `a${Date.now()}`,
            jobId: activeJobId,
            candidateId: candidateId,
            status: CandidateStatus.NEW,
            interviewRound: 0,
            appliedAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        setApplications(prev => [...prev, newApp]);
    }

    setShowImportModal(false);
  };

  const handleDelete = (id: string) => {
      if (!window.confirm(t.app.confirm_delete)) return;

      if (activeJobId) {
          // Withdraw Application
          setApplications(prev => prev.filter(a => a.id !== id));
      } else {
          // Delete Candidate and all applications
          setCandidates(prev => prev.filter(c => c.id !== id));
          setApplications(prev => prev.filter(a => a.candidateId !== id));
      }
  };

  const handleInterviewSubmit = (score: number, decision: 'Pass' | 'Reject' | 'Hold') => {
    if (activeInterviewCandidate && activeInterviewCandidate.applicationId) {
        setApplications(prev => prev.map(app => {
            if (app.id === activeInterviewCandidate.applicationId) {
                let newStatus = app.status;
                let newRound = app.interviewRound || 1;
                let rejectReason = undefined;

                if (decision === 'Pass') {
                    if (newRound < 2) {
                        newRound += 1; 
                        // Status remains Interviewing, just round bumps
                    } else {
                        newStatus = CandidateStatus.OFFER;
                    }
                } else if (decision === 'Reject') {
                    newStatus = CandidateStatus.REJECTED;
                    rejectReason = "Technical fit issue"; 
                } else if (decision === 'Hold') {
                    newStatus = CandidateStatus.TALENT_POOL; // Soft reject to pool
                    rejectReason = "Good candidate, wrong timing";
                }

                return {
                    ...app,
                    status: newStatus,
                    interviewRound: newRound,
                    score: score,
                    rejectReason
                };
            }
            return app;
        }));
        setActiveInterviewCandidate(null);
    }
  };

  // Helper for Profile Modal
  const candidateForModal = useMemo(() => candidates.find(c => c.id === viewingCandidateId), [candidates, viewingCandidateId]);
  const historyForModal = useMemo(() => applications.filter(a => a.candidateId === viewingCandidateId), [applications, viewingCandidateId]);

  const getPageTitle = (page: string) => {
    const map: Record<string, string> = {
      'dashboard': t.sidebar.dashboard,
      'jobs': t.sidebar.jobs,
      'candidates': t.sidebar.candidates,
      'reports': t.sidebar.reports,
      'settings': t.sidebar.settings
    };
    return map[page] || page;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activePage={activePage} onNavigate={(p) => { setActivePage(p); setActiveJobId(null); }} />

      <main className="flex-1 ml-64 overflow-hidden h-screen flex flex-col">
        
        {/* Only show main header if NOT in Job Detail view (Job Detail has its own header) */}
        {!activeJobId && (
            <header className="flex justify-between items-center p-8 pb-4 flex-shrink-0">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">{getPageTitle(activePage)}</h1>
                <p className="text-slate-500 text-sm">{t.dashboard.welcome}</p>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder={t.app.search_placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                />
                </div>
                
                <button 
                onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg flex items-center gap-2 border border-transparent hover:border-slate-200 transition-colors"
                title="Switch Language"
                >
                <Globe size={20} />
                <span className="text-sm font-medium uppercase">{language}</span>
                </button>

                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 shadow-sm">
                {t.app.hr_badge}
                </div>
            </div>
            </header>
        )}

        <div className="flex-1 overflow-hidden flex flex-col p-8 pt-0">
          {activeJobId && activeJob ? (
             <JobDetail 
                job={activeJob}
                applications={kanbanItems}
                onBack={() => setActiveJobId(null)}
                onAddCandidate={() => setShowImportModal(true)}
                onStatusChange={handleStatusChange}
                onSelectCandidate={(c) => setViewingCandidateId(c.id)}
                onInterviewStart={setActiveInterviewCandidate}
                onDeleteCandidate={handleDelete}
             />
          ) : (
            <>
                {activePage === 'dashboard' && (
                    <div className="overflow-y-auto pr-2 pb-10 mt-6">
                        <JobStats />
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.dashboard.recent_candidates}</h3>
                        {/* Simplified list for dashboard */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                    <th className="p-4 text-sm font-medium text-slate-500">{t.dashboard.table.name}</th>
                                    <th className="p-4 text-sm font-medium text-slate-500">{t.dashboard.table.role}</th>
                                    <th className="p-4 text-sm font-medium text-slate-500">{t.dashboard.table.status}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {candidates.slice(0, 5).map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-800">{c.name}</td>
                                        <td className="p-4 text-slate-600">{c.role}</td>
                                        <td className="p-4"><span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-medium">Active</span></td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activePage === 'candidates' && (
                    <div className="flex flex-col h-full mt-6">
                         <div className="flex justify-between items-center mb-6 flex-shrink-0">
                            <h2 className="font-bold text-lg text-slate-700">{t.kanban.talent_pool}</h2>
                            <button 
                                onClick={() => setShowImportModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 font-medium"
                            >
                                <Plus size={18} /> {t.app.add_candidate}
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                           <KanbanBoard 
                                candidates={kanbanItems}
                                onStatusChange={() => {}} // Read only in pool usually
                                onSelectCandidate={(c) => setViewingCandidateId(c.id)}
                                onInterviewStart={() => {}}
                                onDeleteCandidate={handleDelete}
                           />
                        </div>
                    </div>
                )}

                {activePage === 'jobs' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10 mt-6">
                        {jobs.map(job => (
                            <div 
                                key={job.id} 
                                onClick={() => setActiveJobId(job.id)}
                                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-blue-300"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                        <p className="text-slate-500 text-sm mt-1">{job.department} • {job.location}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${job.status === 'Hiring' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {job.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500 uppercase">{t.job.pipeline}</span>
                                        <span className="font-bold text-slate-900 text-lg">
                                            {applications.filter(a => a.jobId === job.id && a.status !== CandidateStatus.REJECTED).length}
                                        </span>
                                    </div>
                                    <button className="text-blue-600 text-sm font-medium hover:underline">View Pipeline</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {showImportModal && (
        <ResumeUploader 
           onClose={() => setShowImportModal(false)}
           onSave={handleAddCandidate}
           jobId={activeJobId || undefined}
           jobTitle={activeJob?.title}
        />
      )}

      {activeInterviewCandidate && (
        <InterviewSession 
           candidate={activeInterviewCandidate} // Passes ApplicationCandidate
           onClose={() => setActiveInterviewCandidate(null)}
           onSubmit={handleInterviewSubmit}
        />
      )}

      {viewingCandidateId && candidateForModal && (
          <CandidateProfileModal 
             candidate={candidateForModal}
             applications={historyForModal}
             jobs={jobs}
             onClose={() => setViewingCandidateId(null)}
          />
      )}
    </div>
  );
};

export default App;
