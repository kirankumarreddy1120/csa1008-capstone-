import React from 'react';
import { Trash2, CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const WasteCollectionProgress = ({ completionRate = 82.0, completedCount = 82, pendingCount = 12, missedCount = 6, dailyTrends = [] }) => {
  const trends = dailyTrends.length > 0 ? dailyTrends : [
    { day: "MON", rate: 91 },
    { day: "TUE", rate: 88 },
    { day: "WED", rate: 82 },
    { day: "THU", rate: 94 },
    { day: "FRI", rate: 89 }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-black tracking-wider text-slate-900 uppercase flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-emerald-600" />
            Today's Waste Collection Progress & Trends
          </h3>
          <p className="text-xs text-slate-500">Route completion monitoring across 10 municipal collection wards</p>
        </div>

        <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black rounded-full">
          {completionRate}% Operational Rate
        </span>
      </div>

      {/* Progress Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Completion Gauge / Overview */}
        <div className="bg-emerald-950 text-white p-5 rounded-2xl border border-emerald-800 flex flex-col justify-between space-y-3 shadow-md">
          <div>
            <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Overall Route Progress</p>
            <h4 className="text-3xl font-black font-mono text-emerald-300">{completionRate}%</h4>
          </div>

          <div className="w-full bg-emerald-900 h-2.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full transition-all" style={{ width: `${completionRate}%` }}></div>
          </div>
          <p className="text-[10px] text-emerald-300/80">Goal: &gt; 90% Daily Completion</p>
        </div>

        {/* Completed */}
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Completed Wards</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-2xl font-black font-mono text-emerald-900">{completedCount} Routes</h4>
            <p className="text-[10px] text-emerald-700 font-semibold">Cleared On Schedule</p>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider">In Progress / Pending</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div>
            <h4 className="text-2xl font-black font-mono text-sky-900">{pendingCount} Routes</h4>
            <p className="text-[10px] text-sky-700 font-semibold">Trucks En Route</p>
          </div>
        </div>

        {/* Missed */}
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Missed Routes</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <h4 className="text-2xl font-black font-mono text-rose-900">{missedCount} Routes</h4>
            <p className="text-[10px] text-rose-700 font-semibold">Flagged for Re-route</p>
          </div>
        </div>
      </div>

      {/* 5-Day Weekly Trendline */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">5-Day Ward Collection Completion History (%)</span>
          <span className="text-[10px] font-mono text-emerald-700 font-bold">Average: 88.8%</span>
        </div>

        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
              <Tooltip />
              <Bar dataKey="rate" name="Completion %" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WasteCollectionProgress;
