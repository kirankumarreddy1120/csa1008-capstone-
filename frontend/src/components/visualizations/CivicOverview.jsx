import React from 'react';
import { Droplets, Trash2, AlertOctagon, CheckSquare, Users, ArrowDown, Activity } from 'lucide-react';

const CivicOverview = ({ flowData = {} }) => {
  const {
    water_zones_count = 10,
    water_high_risk_count = 3,
    waste_areas_count = 10,
    waste_active_issues_count = 4,
    active_incidents_count = 7,
    active_tasks_count = 5,
    active_teams_count = 3,
    overall_loss_pct = 18.5,
    collection_completion_rate = 92.0
  } = flowData;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6">
        {/* Title & Live Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-2xl text-white shadow-lg shadow-sky-500/20">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-wide text-white uppercase">Civic Resource Status & Operational Flow</h2>
              <p className="text-xs text-slate-400">Live municipal telemetry converging into unified civic incidents and team dispatches</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-full border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-mono font-bold text-emerald-400 text-[11px] uppercase tracking-wider">Telemetry Ingestion Active</span>
          </div>
        </div>

        {/* Connected Node Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* LEFT: WATER SOURCE */}
          <div className="lg:col-span-3 bg-gradient-to-b from-sky-950/60 to-slate-950/80 p-5 rounded-2xl border border-sky-800/40 shadow-lg space-y-4 hover:border-sky-500/60 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-600 rounded-xl text-white shadow-md shadow-sky-600/30">
                  <Droplets className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black tracking-wider text-sky-400 uppercase">Water Domain</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-900/60 text-sky-200 border border-sky-700/50">
                {water_zones_count} Zones
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-sky-900/40">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">High Risk Zones:</span>
                <span className="font-extrabold text-rose-400 font-mono text-sm">{water_high_risk_count} Zones</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Avg Water Loss:</span>
                <span className="font-extrabold text-amber-300 font-mono">{overall_loss_pct}%</span>
              </div>
            </div>
          </div>

          {/* CONNECTOR ARROW 1 */}
          <div className="lg:col-span-1 hidden lg:flex flex-col items-center justify-center">
            <span className="text-xs font-mono font-bold text-sky-400 animate-pulse">────►</span>
          </div>

          {/* CENTER: CONVERGED CIVIC INCIDENTS & TASKS */}
          <div className="lg:col-span-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-600 text-white font-black text-[9px] uppercase px-3 py-0.5 rounded-full shadow-md">
              Unified Incident Hub
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-rose-950/40 border border-rose-900/40 p-3 rounded-xl text-center space-y-1">
                <p className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">Active Incidents</p>
                <h4 className="text-2xl font-black text-white font-mono">{active_incidents_count}</h4>
                <p className="text-[10px] text-rose-400 font-semibold">Prioritized</p>
              </div>

              <div className="bg-sky-950/40 border border-sky-900/40 p-3 rounded-xl text-center space-y-1">
                <p className="text-[10px] font-bold text-sky-300 uppercase tracking-wider">Active Tasks</p>
                <h4 className="text-2xl font-black text-white font-mono">{active_tasks_count}</h4>
                <p className="text-[10px] text-sky-400 font-semibold">Dispatched</p>
              </div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-slate-300 font-semibold">Field Teams Active:</span>
              </div>
              <span className="font-extrabold text-purple-300 font-mono text-sm">{active_teams_count} Teams</span>
            </div>
          </div>

          {/* CONNECTOR ARROW 2 */}
          <div className="lg:col-span-1 hidden lg:flex flex-col items-center justify-center">
            <span className="text-xs font-mono font-bold text-emerald-400 animate-pulse">◄────</span>
          </div>

          {/* RIGHT: WASTE SOURCE */}
          <div className="lg:col-span-3 bg-gradient-to-b from-emerald-950/60 to-slate-950/80 p-5 rounded-2xl border border-emerald-800/40 shadow-lg space-y-4 hover:border-emerald-500/60 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-600/30">
                  <Trash2 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-black tracking-wider text-emerald-400 uppercase">Waste Domain</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/60 text-emerald-200 border border-emerald-700/50">
                {waste_areas_count} Wards
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-emerald-900/40">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Waste Issues:</span>
                <span className="font-extrabold text-amber-400 font-mono text-sm">{waste_active_issues_count} Reports</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Route Completion:</span>
                <span className="font-extrabold text-emerald-300 font-mono">{collection_completion_rate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivicOverview;
