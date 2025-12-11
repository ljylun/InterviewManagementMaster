
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  FunnelChart, Funnel, LabelList
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

const JobStats: React.FC = () => {
  const { t } = useLanguage();

  const funnelData = [
    { value: 100, name: t.kanban.new, fill: '#8884d8' },
    { value: 60, name: t.kanban.screened, fill: '#83a6ed' },
    { value: 30, name: t.kanban.interviewing, fill: '#8dd1e1' },
    { value: 10, name: t.kanban.offer, fill: '#82ca9d' },
    { value: 8, name: t.kanban.hired, fill: '#a4de6c' },
  ];

  const barData = [
    { name: 'Mon', interviews: 4 },
    { name: 'Tue', interviews: 7 },
    { name: 'Wed', interviews: 5 },
    { name: 'Thu', interviews: 9 },
    { name: 'Fri', interviews: 6 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.dashboard.funnel}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip />
              <Funnel
                dataKey="value"
                data={funnelData}
                isAnimationActive
              >
                <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">{t.dashboard.weekly_interviews}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f1f5f9' }}
              />
              <Bar dataKey="interviews" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default JobStats;
