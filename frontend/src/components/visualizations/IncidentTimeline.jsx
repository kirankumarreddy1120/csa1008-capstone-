import React from 'react';
import { AlertCircle, Search, ShieldAlert, UserCheck, Play, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';

const IncidentTimeline = ({ incident = null }) => {
  if (!incident) return null;

  const steps = [
    { time: "10:32", title: "Issue Detected", desc: "Automated telemetry ingestion / citizen report logged.", status: "completed", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50" },
    { time: "10:34", title: "Risk Analyzed", desc: `Scikit-Learn ML classified risk as ${incident.severity}.`, status: "completed", icon: Search, color: "text-sky-500", bg: "bg-sky-50" },
    { time: "10:35", title: `Priority Score = ${incident.priority_score?.toFixed(1) || 85.0}/100`, desc: `Calculated priority score based on population impact and severity.`, status: "completed", icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50" },
    { time: "10:37", title: "Team Dispatched", desc: `Dispatched ${incident.assigned_team || incident.assigned_team_name || 'Pipeline Repair Team'}.`, status: "completed", icon: UserCheck, color: "text-purple-500", bg: "bg-purple-50" },
    { time: "10:52", title: "Field Team Accepted", desc: "Response crew acknowledged dispatch and engaged GPS routing.", status: incident.status !== 'Open' ? 'completed' : 'current', icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50" },
    { time: "11:20", title: "On-Site Action In Progress", desc: "Field mitigation and physical pipe/waste repair underway.", status: incident.status === 'In Progress' || incident.status === 'Resolved' || incident.status === 'Closed' ? 'completed' : 'pending', icon: Play, color: "text-blue-500", bg: "bg-blue-50" },
    { time: "11:48", title: "Telemetry Verification", desc: "Verifying normal pressure / cleared bin volume post-repair.", status: incident.status === 'Resolved' || incident.status === 'Closed' ? 'completed' : 'pending', icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
    { time: "12:05", title: "Incident Resolved & Closed", desc: "Audit logged and operations restored to normal.", status: incident.status === 'Closed' ? 'completed' : 'pending', icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100" }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="border-b border-slate-100 pb-2">
        <h4 className="text-xs font-black tracking-wider uppercase text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-600" />
          Incident Lifecycle Chronology Timeline
        </h4>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div key={idx} className="relative flex items-start gap-3 pl-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                st.status === 'completed' ? `${st.bg} ${st.color} ring-2 ring-white` : 'bg-slate-100 text-slate-400'
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-slate-900">{st.title}</h5>
                  <span className="font-mono text-[10px] text-slate-400 font-bold">{st.time}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{st.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IncidentTimeline;
