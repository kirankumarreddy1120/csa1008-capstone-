import React from 'react';
import { Gauge, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceArea, ReferenceLine } from 'recharts';

const PressureTimeline = ({ history = [], zoneName = 'Zone Telemetry' }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-black tracking-wider text-slate-900 uppercase flex items-center gap-2">
            <Gauge className="w-4 h-4 text-sky-600" />
            Hydraulic Head & Pressure Safety Timeline
          </h3>
          <p className="text-xs text-slate-500">Live pressure curves against municipal safety boundaries (2.0 bar - 6.0 bar) for {zoneName}</p>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-bold">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Normal (2.0 - 6.0 bar)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Low (&lt; 2.0 bar)</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Surge (&gt; 6.0 bar)</span>
        </div>
      </div>

      {/* Safety Boundary Banner Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-3">
          <TrendingDown className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <span className="text-[9px] font-bold uppercase text-amber-800">Low Limit</span>
            <p className="font-extrabold text-amber-900 text-sm font-mono">&lt; 2.0 bar</p>
            <p className="text-[10px] text-amber-700">Triggers Under-Pressure</p>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <span className="text-[9px] font-bold uppercase text-emerald-800">Normal Band</span>
            <p className="font-extrabold text-emerald-900 text-sm font-mono">2.0 – 6.0 bar</p>
            <p className="text-[10px] text-emerald-700">Safe Operating Range</p>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-rose-600 flex-shrink-0" />
          <div>
            <span className="text-[9px] font-bold uppercase text-rose-800">Surge Limit</span>
            <p className="font-extrabold text-rose-900 text-sm font-mono">&gt; 6.0 bar</p>
            <p className="text-[10px] text-rose-700">Triggers Burst Alert</p>
          </div>
        </div>
      </div>

      {/* Pressure Chart */}
      <div className="h-64">
        {history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs">
            No pressure history recorded for this zone.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={10} />
              <YAxis domain={[0, 9]} stroke="#94a3b8" fontSize={10} label={{ value: 'bar', angle: -90, position: 'insideLeft', fontSize: 10 }} />
              <Tooltip />
              
              {/* Highlight Safe Zone (2.0 to 6.0) */}
              <ReferenceArea y1={2.0} y2={6.0} fill="#10b981" fillOpacity={0.08} />
              <ReferenceLine y={2.0} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Min 2.0', position: 'insideBottomLeft', fill: '#f59e0b', fontSize: 9 }} />
              <ReferenceLine y={6.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Max 6.0', position: 'insideTopLeft', fill: '#ef4444', fontSize: 9 }} />

              <Line type="monotone" dataKey="pressure" name="Hydraulic Pressure (bar)" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PressureTimeline;
