import React from 'react';
import { AlertCircle, Search, ShieldAlert, UserCheck, Play, ShieldCheck, CheckCircle2 } from 'lucide-react';

const IncidentPipeline = ({ pipelineStages = {}, activeStage = '', onSelectStage = () => {} }) => {
  const stages = [
    { key: "DETECTED", label: "Detected", icon: AlertCircle, count: pipelineStages.DETECTED || 8, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    { key: "ANALYZED", label: "Analyzed", icon: Search, count: pipelineStages.ANALYZED || 6, color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/30" },
    { key: "PRIORITIZED", label: "Prioritized", icon: ShieldAlert, count: pipelineStages.PRIORITIZED || 5, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/30" },
    { key: "ASSIGNED", label: "Assigned", icon: UserCheck, count: pipelineStages.ASSIGNED || 4, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/30" },
    { key: "IN_PROGRESS", label: "In Progress", icon: Play, count: pipelineStages.IN_PROGRESS || 3, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
    { key: "VERIFICATION", label: "Verification", icon: ShieldCheck, count: pipelineStages.VERIFICATION || 2, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/30" },
    { key: "RESOLVED", label: "Resolved", icon: CheckCircle2, count: pipelineStages.RESOLVED || 18, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-black tracking-wider text-slate-900 uppercase">
            Civic Response Pipeline
          </h3>
          <p className="text-xs text-slate-500">
            Interactive incident lifecycle state progression — click any stage to filter active municipal operations
          </p>
        </div>

        {activeStage && (
          <button
            onClick={() => onSelectStage('')}
            className="text-[11px] font-bold text-sky-600 hover:underline bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200"
          >
            Clear Stage Filter ({activeStage})
          </button>
        )}
      </div>

      {/* Horizontal Pipeline Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {stages.map((st, idx) => {
          const Icon = st.icon;
          const isSelected = activeStage === st.key;

          return (
            <div
              key={st.key}
              onClick={() => onSelectStage(isSelected ? '' : st.key)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none relative ${
                isSelected
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg ring-2 ring-sky-500 scale-[1.03]'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-slate-800 text-white' : `${st.bg} ${st.color}`}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-base font-black font-mono ${isSelected ? 'text-sky-300' : 'text-slate-900'}`}>
                  {st.count}
                </span>
              </div>

              <div>
                <p className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                  Stage 0{idx + 1}
                </p>
                <h4 className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {st.label}
                </h4>
              </div>

              {/* Progress Line Connector */}
              {idx < stages.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300 font-bold text-xs pointer-events-none">
                  ➔
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IncidentPipeline;
