
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Save, ThumbsUp, ThumbsDown, AlertCircle, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import { Candidate } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface InterviewSessionProps {
  candidate: Candidate;
  onClose: () => void;
  onSubmit: (score: number, decision: 'Pass' | 'Reject' | 'Hold') => void;
}

const InterviewSession: React.FC<InterviewSessionProps> = ({ candidate, onClose, onSubmit }) => {
  const { t } = useLanguage();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [splitRatio, setSplitRatio] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  
  // Scorecard State
  const [score, setScore] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [decision, setDecision] = useState<'Pass' | 'Reject' | 'Hold' | null>(null);
  const [feedback, setFeedback] = useState<{ category: string; rating: 'S'|'A'|'B'|'C'|'D' }[]>([
    { category: 'Technical Capability', rating: 'B' },
    { category: 'Communication', rating: 'B' },
    { category: 'Logical Thinking', rating: 'B' },
    { category: 'Culture Fit', rating: 'B' },
  ]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Resize Handlers
  const handleMouseDown = () => setIsResizing(true);
  const handleMouseUp = () => setIsResizing(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isResizing) {
      const newRatio = (e.clientX / window.innerWidth) * 100;
      if (newRatio > 20 && newRatio < 80) setSplitRatio(newRatio);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-100 z-50 flex flex-col"
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      {/* Header */}
      <header className="bg-slate-900 text-white h-16 flex items-center justify-between px-6 shadow-md flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">{t.interview.back}</span>
          </button>
          <div className="h-6 w-px bg-slate-700"></div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{candidate.name}</h1>
            <p className="text-xs text-slate-400">{t.interview.round_2} • {candidate.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
             <Clock size={16} className="text-blue-400" />
             <span className="font-mono font-medium text-sm text-blue-50">{formatTime(elapsedTime)}</span>
           </div>
           <button 
             onClick={() => decision && onSubmit(score, decision)}
             disabled={!decision}
             className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/50"
           >
             {t.interview.submit_eval}
           </button>
        </div>
      </header>

      {/* Split Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Resume Viewer */}
        <div className="bg-slate-700 relative flex flex-col" style={{ width: `${splitRatio}%` }}>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur text-white px-4 py-1.5 rounded-full text-xs font-medium z-10 flex gap-4 shadow-xl border border-slate-700">
             <button className="hover:text-blue-400 transition-colors"><ZoomIn size={14}/></button>
             <span>{t.interview.page} 1 / 2</span>
             <button className="hover:text-blue-400 transition-colors"><ZoomOut size={14}/></button>
          </div>
          
          <div className="flex-1 overflow-auto flex items-center justify-center p-8">
             {/* Mock PDF Viewer */}
             <div className="bg-white shadow-2xl w-full max-w-[800px] min-h-[1000px] p-16 text-slate-800 origin-top">
                <div className="border-b border-slate-200 pb-8 mb-8">
                    <h1 className="text-4xl font-bold mb-2 text-slate-900">{candidate.name}</h1>
                    <p className="text-slate-500 text-lg">{candidate.email} | {candidate.phone}</p>
                </div>
                <div className="space-y-8">
                    <section>
                        <h2 className="text-lg font-bold uppercase tracking-wider text-blue-800 border-b-2 border-blue-800 pb-1 mb-4">{t.interview.summary}</h2>
                        <p className="text-base leading-relaxed text-slate-700">
                            Experienced professional with {candidate.experience} years in the field. 
                            Proven track record of delivering high-quality solutions. 
                            Expert in {candidate.tags.join(', ')}.
                        </p>
                    </section>
                    <section>
                        <h2 className="text-lg font-bold uppercase tracking-wider text-blue-800 border-b-2 border-blue-800 pb-1 mb-4">{t.interview.experience}</h2>
                        <div className="mb-6">
                            <div className="flex justify-between mb-2">
                                <h3 className="font-bold text-lg">Senior Engineer</h3>
                                <span className="text-sm text-slate-500 font-medium">2020 - Present</span>
                            </div>
                            <p className="text-md text-slate-700 font-medium">Tech Corp Inc.</p>
                            <ul className="list-disc list-inside text-sm text-slate-600 mt-3 space-y-2">
                                <li>Led a team of 5 developers.</li>
                                <li>Improved system performance by 40%.</li>
                                <li>Architected the new payment gateway integration.</li>
                            </ul>
                        </div>
                    </section>
                    <section>
                        <h2 className="text-lg font-bold uppercase tracking-wider text-blue-800 border-b-2 border-blue-800 pb-1 mb-4">{t.interview.education}</h2>
                        <div className="flex justify-between">
                            <h3 className="font-bold text-lg">{candidate.education}</h3>
                            <span className="text-sm text-slate-500 font-medium">2016</span>
                        </div>
                    </section>
                </div>
             </div>
          </div>
        </div>

        {/* Resizer Handle */}
        <div 
          className="w-1.5 bg-slate-200 hover:bg-blue-500 cursor-col-resize z-20 transition-colors flex items-center justify-center relative"
          onMouseDown={handleMouseDown}
        >
          <div className="h-8 w-1 bg-slate-400 rounded-full" />
        </div>

        {/* Right: Scorecard */}
        <div className="bg-white flex flex-col overflow-hidden" style={{ width: `${100 - splitRatio}%` }}>
           <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              <div className="max-w-2xl mx-auto space-y-8">
                
                {/* Dimensions */}
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t.interview.competency}</h3>
                    <div className="space-y-3">
                        {feedback.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                <span className="font-semibold text-slate-700">{item.category}</span>
                                <div className="flex gap-1.5">
                                    {['S', 'A', 'B', 'C', 'D'].map((grade) => (
                                        <button
                                            key={grade}
                                            onClick={() => {
                                                const newFeedback = [...feedback];
                                                newFeedback[idx].rating = grade as any;
                                                setFeedback(newFeedback);
                                            }}
                                            className={`w-9 h-9 rounded-lg text-sm font-bold transition-all border ${
                                                item.rating === grade 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-110' 
                                                : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {grade}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.interview.notes}</h3>
                         <span className="text-xs text-green-600 font-medium flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-full">
                           <Save size={12}/> {t.interview.auto_saving}
                         </span>
                    </div>
                    <textarea 
                        className="w-full h-64 p-5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 leading-relaxed resize-none shadow-sm bg-white"
                        placeholder={t.interview.notes_placeholder}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="flex gap-2 mt-3">
                        <button className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded font-medium shadow-sm">Bold</button>
                        <button className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded font-medium shadow-sm">Bullet List</button>
                        <button className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded font-medium shadow-sm">Code Block</button>
                    </div>
                </div>
              </div>
           </div>

           {/* Sticky Footer Decision */}
           <div className="border-t border-slate-200 p-6 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
               <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-6">
                             <h3 className="font-bold text-slate-800 text-lg">{t.interview.final_decision}:</h3>
                             <div className="flex bg-slate-100 p-1.5 rounded-xl">
                                 <button 
                                    onClick={() => setDecision('Pass')}
                                    className={`px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${decision === 'Pass' ? 'bg-green-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                 >
                                    <ThumbsUp size={16} /> {t.interview.pass}
                                 </button>
                                 <button 
                                    onClick={() => setDecision('Hold')}
                                    className={`px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${decision === 'Hold' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                 >
                                    <AlertCircle size={16} /> {t.interview.hold}
                                 </button>
                                 <button 
                                    onClick={() => setDecision('Reject')}
                                    className={`px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all ${decision === 'Reject' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                 >
                                    <ThumbsDown size={16} /> {t.interview.reject}
                                 </button>
                             </div>
                         </div>
                         <div className="text-right">
                             <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">{t.interview.overall_score}</label>
                             <input 
                                type="number" 
                                min="1" max="5" step="0.1"
                                value={score || ''}
                                onChange={(e) => setScore(Number(e.target.value))}
                                className="w-24 p-2 text-right border border-slate-200 bg-slate-50 rounded-lg font-bold text-2xl text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all"
                                placeholder="0.0"
                             />
                         </div>
                    </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
