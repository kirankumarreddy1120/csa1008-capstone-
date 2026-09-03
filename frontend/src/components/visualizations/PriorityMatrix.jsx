import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { ShieldAlert, Crosshair } from 'lucide-react';

const PriorityMatrix = ({ incidents = [], onSelectIncident = () => {} }) => {
  // Transform incidents into scatter data points with simulated impact & urgency derived from priority score & severity
  const data = incidents.map((inc) => {
    let impact = Math.min(95, Math.max(15, inc.priority_score * 0.95 + (inc.resource_type === 'WATER' ? 5 : 0)));
    let urgency = inc.severity === 'Critical' ? 90 : (inc.severity === 'High' ? 75 : (inc.severity === 'Medium' ? 45 : 20));

    return {
      id: inc.id,
      code: inc.code || inc.incident_code,
      title: inc.title || inc.incident_type,
      location: inc.location,
      severity: inc.severity,
      priority: inc.priority_score,
      resource_type: inc.resource_type,
      impact: Math.round(impact),
      urgency: Math.round(urgency),
      z: inc.priority_score
    };
  });

  const getColor = (sev) => {
    switch (sev) {
      case 'Critical': return '#e11d48';
      case 'High': return '#f97316';
      case 'Medium': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-xl text-xs space-y-1 z-50">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
            <span className="font-mono font-bold text-sky-400">{item.code}</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-slate-800 text-slate-300">
              {item.resource_type}
            </span>
          </div>
          <p className="font-extrabold text-sm text-slate-100">{item.title}</p>
          <p className="text-slate-400">{item.location}</p>
          <div className="pt-1 flex items-center justify-between gap-4 font-mono font-bold">
            <span className="text-rose-400">Score: {item.priority}/100</span>
            <span className="text-slate-300">Impact: {item.impact}% | Urgency: {item.urgency}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-black tracking-wider text-slate-900 uppercase flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-rose-500" />
            Civic Priority Matrix (Impact vs Urgency)
          </h3>
          <p className="text-xs text-slate-500">
            2D strategic quadrant positioning — incidents in the upper-right quadrant require immediate municipal dispatch
          </p>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-bold">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Critical</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Low</span>
        </div>
      </div>

      <div className="h-72 w-full relative">
        {/* Quadrant Watermark Labels */}
        <div className="absolute top-2 right-4 text-[10px] font-black uppercase text-rose-500/20 pointer-events-none">
          Quadrant I: Immediate Action
        </div>
        <div className="absolute bottom-6 left-12 text-[10px] font-black uppercase text-slate-400/30 pointer-events-none">
          Quadrant IV: Routine Monitoring
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              type="number"
              dataKey="impact"
              name="Impact"
              domain={[0, 100]}
              stroke="#94a3b8"
              fontSize={10}
              label={{ value: 'Municipal Impact Factor →', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#64748b' }}
            />
            <YAxis
              type="number"
              dataKey="urgency"
              name="Urgency"
              domain={[0, 100]}
              stroke="#94a3b8"
              fontSize={10}
              label={{ value: 'Urgency & Risk Severity →', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}
            />
            <ZAxis type="number" dataKey="z" range={[80, 220]} />
            <Tooltip content={<CustomTooltip />} />
            <Scatter name="Incidents" data={data} onClick={(e) => onSelectIncident(e)}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.severity)} className="cursor-pointer hover:opacity-80 transition-opacity" />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriorityMatrix;
