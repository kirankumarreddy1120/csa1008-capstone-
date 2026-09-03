import React from 'react';
import { Users, CheckCircle2, Clock, Activity } from 'lucide-react';

const TeamWorkload = ({ teams = [] }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-black tracking-wider text-slate-900 uppercase flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            Field Team Operations & Workload Status
          </h3>
          <p className="text-xs text-slate-500">Live operational capacity, active task loads, and average response times</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((t) => {
          const isBusy = t.availability === 'Busy';
          const maxCapacity = 10;
          const activePercent = Math.min(100, ((t.active_tasks || 1) / maxCapacity) * 100);

          return (
            <div
              key={t.id}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-extrabold text-xs text-slate-900 leading-tight">{t.team_name}</h4>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                    isBusy ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {t.availability?.toUpperCase()}
                  </span>
                </div>
                <p className="text-[10px] text-purple-700 font-bold">{t.team_type}</p>
              </div>

              {/* Workload Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-500">Active Task Load:</span>
                  <span className="font-mono text-slate-800">{t.active_tasks || 1} / {maxCapacity} Tasks</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      activePercent > 70 ? 'bg-rose-500' : (activePercent > 40 ? 'bg-amber-500' : 'bg-sky-500')
                    }`}
                    style={{ width: `${activePercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Response Time & Completed Today */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Completed Today</span>
                  <span className="font-extrabold text-slate-800 font-mono">{t.completed_today || 4} Tasks</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Avg Response</span>
                  <span className="font-extrabold text-sky-700 font-mono">{t.avg_response_min || 38} min</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamWorkload;
