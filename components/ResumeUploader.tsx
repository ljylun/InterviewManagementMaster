import React, { useState, useCallback } from 'react';
import { Upload, X, Check, FileText, Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { parseResumeWithGemini, ParsedResume } from '../services/geminiService';
import { Candidate, WorkExperience } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ResumeUploaderProps {
  onClose: () => void;
  onSave: (candidateData: Partial<Candidate>, file: File | null) => void;
  jobId?: string;
  jobTitle?: string;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onClose, onSave, jobId, jobTitle }) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Verification Form State
  const [formData, setFormData] = useState<Partial<ParsedResume>>({});

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsParsing(true);
    setError(null);
    setFormData({});

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
            const result = await parseResumeWithGemini(base64String, selectedFile.type);
            setParsedData(result);
            setFormData(result);
        } catch (err) {
            setError("Failed to parse resume automatically. Please enter details manually.");
            setFormData({ name: '', email: '', phone: '' });
        } finally {
            setIsParsing(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setError("Error reading file.");
      setIsParsing(false);
    }
  };

  const handleConfirm = () => {
    setError(null);
    if (!formData.name || !formData.name.trim()) {
        setError(t.upload.validation_error);
        return;
    }
    if (!formData.email || !formData.email.trim()) {
        setError(t.upload.validation_error);
        return;
    }

    // Map the simple ParsedResume structure to the robust Candidate WorkExperience
    const workExperience: WorkExperience[] = formData.work_experience?.map(w => ({
      company: w.company,
      role: w.role,
      startDate: w.start_date,
      endDate: w.end_date,
      description: w.description
    })) || [];

    const newCandidateData: Partial<Candidate> = {
      name: formData.name,
      role: formData.skills?.[0] || 'Applicant',
      email: formData.email,
      phone: formData.phone || '',
      experience: formData.experience_years || 0,
      education: formData.education || '',
      tags: formData.skills || [],
      workExperience: workExperience
    };
    onSave(newCandidateData, file);
  };

  const updateWorkExp = (index: number, field: keyof NonNullable<ParsedResume['work_experience']>[number], value: string) => {
    const newWork = [...(formData.work_experience || [])];
    newWork[index] = { ...newWork[index], [field]: value };
    setFormData({ ...formData, work_experience: newWork });
  };

  const deleteWorkExp = (index: number) => {
     const newWork = [...(formData.work_experience || [])];
     newWork.splice(index, 1);
     setFormData({ ...formData, work_experience: newWork });
  };

  const addWorkExp = () => {
     const newWork = [...(formData.work_experience || [])];
     newWork.unshift({ company: '', role: '', start_date: '', end_date: '', description: '' });
     setFormData({ ...formData, work_experience: newWork });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
          <div>
             <h2 className="text-xl font-bold text-slate-800">{t.upload.import_title}</h2>
             {jobTitle && <p className="text-sm text-blue-600 font-medium mt-1">Target Job: {jobTitle}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-16 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                isDragging ? 'border-blue-500 bg-blue-50 scale-102' : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="bg-blue-50 p-5 rounded-full mb-6">
                <Upload className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">{t.upload.drag_drop_title}</h3>
              <p className="text-slate-500 mb-8">{t.upload.drag_drop_desc}</p>
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
              <label
                htmlFor="resume-upload"
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors shadow-lg shadow-blue-600/20"
              >
                {t.upload.select_file}
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Status */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="bg-white p-2 rounded shadow-sm">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium text-slate-800 truncate">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button 
                  onClick={() => { setFile(null); setParsedData(null); setFormData({}); setError(null); }}
                  className="text-slate-400 hover:text-red-500 p-2"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Parsing Loader */}
              {isParsing && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
                  <p className="text-lg text-slate-700 font-medium mb-2">{t.upload.parsing}</p>
                  <p className="text-sm text-slate-500">{t.upload.parsing_desc}</p>
                </div>
              )}

              {/* Error */}
              {error && !isParsing && (
                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 animate-in fade-in">
                  <AlertCircle size={20} />
                  <p>{error}</p>
                </div>
              )}

              {/* Verification Form */}
              {!isParsing && (file) && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                  {/* Basic Info */}
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-800">{t.upload.verify}</h3>
                        {parsedData && (
                        <span className="text-xs font-medium px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1.5">
                            <Check size={12} strokeWidth={3} /> {t.upload.ai_parsed}
                        </span>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.upload.labels.name}</label>
                        <input 
                            type="text" 
                            value={formData.name || ''} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className={`w-full p-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all ${(!formData.name && error) ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                        />
                        </div>
                        <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.upload.labels.email}</label>
                        <input 
                            type="email" 
                            value={formData.email || ''} 
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className={`w-full p-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all ${(!formData.email && error) ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                        />
                        </div>
                    </div>
                  </div>

                  {/* Work Experience */}
                  <div>
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">{t.upload.labels.work_exp}</h3>
                        <button onClick={addWorkExp} className="text-xs flex items-center gap-1 text-blue-600 font-medium hover:bg-blue-50 px-2 py-1 rounded">
                             <Plus size={14}/> Add
                        </button>
                     </div>
                     
                     <div className="space-y-4">
                        {(formData.work_experience || []).map((work, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-lg relative group hover:border-blue-200 transition-colors">
                                <button 
                                    onClick={() => deleteWorkExp(idx)}
                                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={16}/>
                                </button>
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 uppercase">{t.upload.work.company}</label>
                                        <input 
                                            value={work.company}
                                            onChange={(e) => updateWorkExp(idx, 'company', e.target.value)}
                                            className="w-full text-sm font-semibold bg-transparent border-b border-transparent focus:border-blue-500 outline-none placeholder-slate-400"
                                            placeholder="Company Name"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 uppercase">{t.upload.work.role}</label>
                                        <input 
                                            value={work.role}
                                            onChange={(e) => updateWorkExp(idx, 'role', e.target.value)}
                                            className="w-full text-sm bg-transparent border-b border-transparent focus:border-blue-500 outline-none placeholder-slate-400"
                                            placeholder="Job Title"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-slate-500 uppercase">{t.upload.work.dates}</label>
                                        <div className="flex gap-2 items-center">
                                            <input 
                                                value={work.start_date}
                                                onChange={(e) => updateWorkExp(idx, 'start_date', e.target.value)}
                                                className="w-24 text-xs bg-white border border-slate-200 rounded p-1 text-slate-600 text-center"
                                                placeholder="YYYY-MM"
                                            />
                                            <span className="text-slate-400">-</span>
                                            <input 
                                                value={work.end_date}
                                                onChange={(e) => updateWorkExp(idx, 'end_date', e.target.value)}
                                                className="w-24 text-xs bg-white border border-slate-200 rounded p-1 text-slate-600 text-center"
                                                placeholder="Present"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(formData.work_experience || []).length === 0 && (
                            <div className="text-center p-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                                No work experience detected. Click Add to insert manually.
                            </div>
                        )}
                     </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">
            {t.upload.cancel}
          </button>
          <button 
            disabled={!file || isParsing}
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isParsing ? t.upload.processing : t.upload.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeUploader;