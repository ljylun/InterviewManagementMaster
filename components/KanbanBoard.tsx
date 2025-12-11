
import React, { useState, useEffect } from 'react';
import { ApplicationCandidate, CandidateStatus, KanbanColumn } from '../types';
import { KANBAN_COLUMNS } from '../constants';
import { MoreHorizontal, MessageSquare, Phone, Calendar, Clock, Trash2, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface KanbanBoardProps {
  candidates: ApplicationCandidate[];
  onStatusChange: (id: string, newStatus: CandidateStatus) => void;
  onSelectCandidate: (candidate: ApplicationCandidate) => void;
  onInterviewStart: (candidate: ApplicationCandidate) => void;
  onDeleteCandidate: (id: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ candidates, onStatusChange, onSelectCandidate, onInterviewStart, onDeleteCandidate }) => {
  const { t } = useLanguage();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    setActiveMenuId(null); // Close menu on drag
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: CandidateStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) onStatusChange(id, status);
    setDraggedId(null);
  };

  const getColumnTitle = (id: string) => {
    const key = id.toLowerCase().replace(' ', '_') as keyof typeof t.kanban;
    const statusMap: Record<string, string> = {
      'New': 'new',
      'Screened': 'screened',
      'Interviewing': 'interviewing',
      'Offer': 'offer',
      'Hired': 'hired',
      'Rejected': 'rejected',
      'Talent Pool': 'talent_pool'
    };
    return t.kanban[statusMap[id] as keyof typeof t.kanban] || id;
  };

  return (
    <div className="flex h-full gap-6 items-start min-w-[1600px] pb-4">
      {KANBAN_COLUMNS.map((column) => {
        const columnCandidates = candidates.filter(c => c.status === column.id);
        
        return (
          <div 
            key={column.id}
            className="w-80 flex-shrink-0 flex flex-col h-full max-h-full"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-700 text-sm tracking-wide">{getColumnTitle(column.id)}</h3>
                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                  {columnCandidates.length}
                </span>
              </div>
              <div className={`w-2 h-2 rounded-full ${column.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
            </div>

            {/* Drop Zone / List */}
            <div className={`flex-1 bg-slate-100/50 rounded-xl p-2 border border-slate-200/50 overflow-y-auto space-y-3 transition-colors ${draggedId ? 'bg-slate-100' : ''}`}>
              {columnCandidates.map((candidate) => {
                const isMenuOpen = activeMenuId === candidate.applicationId || activeMenuId === candidate.id;
                // Use applicationId for dragging if available (Job Context), otherwise candidate ID (Pool Context)
                const dragId = candidate.applicationId || candidate.id;
                
                return (
                  <div
                    key={dragId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, dragId)}
                    onClick={() => onSelectCandidate(candidate)}
                    className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 cursor-grab active:cursor-grabbing transition-all group relative"
                  >
                    <div className="flex justify-between items-start mb-2 relative">
                      <h4 className="font-semibold text-slate-800">{candidate.name}</h4>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : dragId);
                        }}
                        className={`text-slate-400 hover:text-slate-600 transition-opacity p-1 rounded hover:bg-slate-100 ${isMenuOpen ? 'opacity-100 bg-slate-100 text-slate-600' : 'opacity-0 group-hover:opacity-100'}`}
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-xl border border-slate-100 z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          <button
                              onClick={(e) => { e.stopPropagation(); onSelectCandidate(candidate); setActiveMenuId(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                              <Eye size={14}/> {t.actions.view}
                          </button>
                          <button
                              onClick={(e) => { e.stopPropagation(); onDeleteCandidate(dragId); setActiveMenuId(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                              <Trash2 size={14}/> {t.actions.delete}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-500 mb-3">{candidate.role}</p>
                    
                    {/* Status Indicators */}
                    {candidate.status === CandidateStatus.INTERVIEWING && (
                      <div className="mb-3 flex items-center gap-1.5">
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock size={10} /> {t.interview.round_label} {candidate.interviewRound || 1}
                        </span>
                      </div>
                    )}

                    {candidate.status === CandidateStatus.REJECTED && candidate.rejectReason && (
                      <div className="mb-3">
                        <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded block truncate" title={candidate.rejectReason}>
                          {candidate.rejectReason}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {candidate.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                          <img src={candidate.avatarUrl} alt={candidate.name} className="w-6 h-6 rounded-full" />
                          <span className="text-xs text-slate-400">{candidate.experience}y exp</span>
                      </div>
                      
                      {/* Interview Button for relevant columns */}
                      {column.id === CandidateStatus.INTERVIEWING && candidate.applicationId && (
                          <button 
                              onClick={(e) => { e.stopPropagation(); onInterviewStart(candidate); }}
                              className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition-colors shadow-sm"
                              title="Start Interview"
                          >
                              <MessageSquare size={14} />
                          </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {columnCandidates.length === 0 && (
                 <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs font-medium bg-slate-50/50">
                    {t.kanban.drag_drop}
                 </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
