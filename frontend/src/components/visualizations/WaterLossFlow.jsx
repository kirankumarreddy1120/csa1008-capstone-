import React from 'react';
import { Droplets, ArrowRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const WaterLossFlow = ({ supplied = 100000, consumed = 78000, loss = 22000, lossPct = 22.0, trends = [] }) => {
  const isHighRisk = lossPct > 20.0;
  const isCritical = lossPct > 30.0;

  // Sample timeline trend if empty
  const trendData = trends.length > 0 ? trends : [
    { time: "00:00", lossPct: 8.2 },
    { time: "04:00", lossPct: 9.5 },
    { time: "08:00", lossPct: 14.1 },
    { time: "12:00", lossPct: 22.4 },
    { time: "16:00", lossPct: 24.8 },
    { time: "20:00", lossPct: 21.0 },
    { time: "23:59", lossPct: 19.5 }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-black tracking-wider text-slate-900 uppercase flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-600" />
            Water Loss Flow & Balance Visualization
          </h3>
          <p className="text-xs text-slate-500">Hydro-telemetry breakdown from municipal input to consumed vs unmetered loss</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${
            isCritical ? 'bg-rose-100 text-rose-800 border-rose-300' :
            isHighRisk ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
          }`}>
            {isCritical ? 'CRITICAL LOSS DETECTED' : (isHighRisk ? 'HIGH RISK LOSS DETECTED' : 'NORMAL BALANCE')}
          </span>
        </div>
      </div>

      {/* Sankey / Flow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
        {/* Source: Supplied */}
        <div className="md:col-span-2 bg-sky-900 text-white p-4 rounded-2xl border border-sky-800 text-center space-y-1 shadow-md">
          <p className="text-[10px] font-bold text-sky-300 uppercase tracking-wider">Water Supplied</p>
          <h4 className="text-2xl font-black font-mono">{supplied.toLocaleString()} m³</h4>
          <p className="text-[10px] text-sky-200">100% Inflow Telemetry</p>
        </div>

        {/* Arrow Flow */}
        <div className="md:col-span-1 hidden md:flex flex-col items-center justify-center text-sky-600 font-bold">
          <span className="text-xs">➔ Pipeline ➔</span>
        </div>

        {/* Distribution Output Split */}
        <div className="md:col-span-4 grid grid-cols-2 gap-3">
          {/* Legitimate Consumption */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Authorized Consumption</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="text-xl font-black font-mono text-emerald-900">{consumed.toLocaleString()} m³</h4>
            <p className="text-[10px] text-emerald-700 font-bold">{((consumed / supplied) * 100).toFixed(1)}% Revenue Billed</p>
          </div>

          {/* Unmetered Loss */}
          <div className={`p-4 rounded-2xl border space-y-1 ${
            isHighRisk ? 'bg-rose-50 border-rose-300' : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Estimated Water Loss</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
            <h4 className="text-xl font-black font-mono text-rose-900">{loss.toLocaleString()} m³</h4>
            <p className="text-[10px] font-extrabold text-rose-700 font-mono">{lossPct}% Overall Leakage</p>
          </div>
        </div>
      </div>

      {/* Loss Trend Over Time vs Risk Threshold (20%) */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700">Water Loss % Timeline Trend vs Risk Threshold (20%)</span>
          <span className="text-[10px] font-mono text-rose-600 font-bold">-- Safe Limit: 20% --</span>
        </div>

        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
              <YAxis domain={[0, 40]} stroke="#94a3b8" fontSize={10} label={{ value: '% Loss', angle: -90, position: 'insideLeft', fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="lossPct" name="Loss Percentage (%)" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#lossGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WaterLossFlow;
