import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Modal from '../components/Modal';
import CivicOverview from '../components/visualizations/CivicOverview';
import IncidentPipeline from '../components/visualizations/IncidentPipeline';
import PriorityMatrix from '../components/visualizations/PriorityMatrix';
import TeamWorkload from '../components/visualizations/TeamWorkload';
import IncidentTimeline from '../components/visualizations/IncidentTimeline';
import IncidentMiniMap from '../components/visualizations/IncidentMiniMap';
import { dashboardAPI } from '../services/api';
import { getSeverityBadgeClass } from '../utils/formatters';
import { 
  AlertOctagon, ShieldAlert, ArrowRight, RefreshCw, 
  MapPin, Users, Wrench, Eye, CheckCircle2 
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStageFilter, setActiveStageFilter] = useState('');
  const [selectedIncidentModal, setSelectedIncidentModal] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getSummary();
      if (res.success) setData(res.data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const flow = data?.flow || {};
  const pipelineStages = data?.pipeline_stages || {};
  const teamsWorkload = data?.teams_workload || [];
  const rawIncidents = data?.high_priority_feed || [];

  // Filter incidents based on active pipeline stage if clicked
  const filteredIncidents = activeStageFilter
    ? rawIncidents.filter(inc => {
        if (activeStageFilter === 'DETECTED') return inc.status === 'Open' || inc.status === 'Detect';
        if (activeStageFilter === 'ASSIGNED') return inc.status === 'Assigned' || inc.assigned_team !== 'Unassigned';
        if (activeStageFilter === 'IN_PROGRESS') return inc.status === 'In Progress';
        if (activeStageFilter === 'PRIORITIZED') return inc.priority_score >= 60;
        return true;
      })
    : rawIncidents;

  return (
    <div className="flex-1 bg-slate-100 min-h-screen">
      <Header title="Municipal Resource Command Center" />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* TOP REFRESH BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Municipal Operational Command</h1>
            <p className="text-xs text-slate-500 font-medium">Real-time resource lifecycle monitoring: Detect ➔ Analyze ➔ Prioritize ➔ Assign ➔ Respond ➔ Resolve</p>
          </div>

          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
        </div>

        {/* 1. SECTION 1: CIVIC OPERATIONS OVERVIEW DIAGRAM */}
        <CivicOverview flowData={flow} />

        {/* 2. CIVIC RESPONSE PIPELINE (7 STAGES) */}
        <IncidentPipeline
          pipelineStages={pipelineStages}
          activeStage={activeStageFilter}
          onSelectStage={setActiveStageFilter}
        />

        {/* 3. ACTIVE CIVIC INCIDENTS (RICH VISUAL CARDS) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black tracking-wider text-slate-900 uppercase flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Active Civic Incidents & Emergency Queue
              </h3>
              <p className="text-xs text-slate-500">Visual operational incident cards displaying impact, severity, priority score, and dispatched crews</p>
            </div>

            <button
              onClick={() => navigate('/incidents')}
              className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1"
            >
              All Incident Logs <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIncidents.length === 0 ? (
              <div className="col-span-3 bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="font-extrabold text-sm text-slate-800">All Civic Operations Normal</h4>
                <p className="text-xs text-slate-400">No active incidents matching the selected filter stage.</p>
              </div>
            ) : (
              filteredIncidents.map((inc) => {
                const isCritical = inc.severity === 'Critical';
                const isHigh = inc.severity === 'High';

                return (
                  <div
                    key={inc.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 hover:shadow-md transition-all select-none"
                  >
                    <div className="space-y-3">
                      {/* Card Header: Severity & Domain */}
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getSeverityBadgeClass(inc.severity)}`}>
                          {isCritical ? '🔴 CRITICAL' : (isHigh ? '🟠 HIGH' : '🟡 MEDIUM')}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          inc.resource_type === 'WATER' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {inc.resource_type}
                        </span>
                      </div>

                      {/* Title & Location */}
                      <div>
                        <h4 className="font-black text-sm text-slate-900 leading-snug">{inc.title}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {inc.location}
                        </p>
                      </div>

                      {/* Operational Impact Breakdown */}
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-semibold">Impact Metric:</span>
                          <span className="font-extrabold text-slate-900 font-mono">{inc.impact_metric}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-semibold">Affected Population:</span>
                          <span className="font-extrabold text-slate-900 font-mono">{inc.affected_population?.toLocaleString()} Citizens</span>
                        </div>
                      </div>

                      {/* Priority Score Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Priority Rating:</span>
                          <span className="font-mono font-black text-rose-600">{inc.priority_score.toFixed(1)} / 100</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              inc.priority_score >= 75 ? 'bg-rose-600' : (inc.priority_score >= 50 ? 'bg-orange-500' : 'bg-amber-500')
                            }`}
                            style={{ width: `${inc.priority_score}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Responding Team Status */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Users className="w-3.5 h-3.5 text-purple-600" />
                          <span className="truncate max-w-[140px]">{inc.assigned_team}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-800">
                          {inc.status}
                        </span>
                      </div>
                    </div>

                    {/* View Button */}
                    <button
                      onClick={() => setSelectedIncidentModal(inc)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      View Operational Lifecycle
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 4. CIVIC PRIORITY MATRIX (IMPACT VS URGENCY) */}
        <PriorityMatrix incidents={rawIncidents} onSelectIncident={setSelectedIncidentModal} />

        {/* 5. FIELD TEAM WORKLOAD VISUALIZATION */}
        <TeamWorkload teams={teamsWorkload} />
      </main>

      {/* INCIDENT DETAILS & TIMELINE MODAL */}
      <Modal
        isOpen={!!selectedIncidentModal}
        onClose={() => setSelectedIncidentModal(null)}
        title={`Incident Lifecycle: ${selectedIncidentModal?.code || 'INC-001'}`}
      >
        {selectedIncidentModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border text-xs">
              <div>
                <span className="font-extrabold text-sm text-slate-900">{selectedIncidentModal.title}</span>
                <p className="text-slate-500">{selectedIncidentModal.location}</p>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-black ${getSeverityBadgeClass(selectedIncidentModal.severity)}`}>
                {selectedIncidentModal.severity}
              </span>
            </div>

            {/* Lifecycle Timeline */}
            <IncidentTimeline incident={selectedIncidentModal} />

            {/* Proximity Mini Map & Contractor Assign */}
            <IncidentMiniMap
              incident={selectedIncidentModal}
              onAssignService={(srv) => {
                alert(`Contractor ${srv.service_name} dispatched for ${selectedIncidentModal.title}!`);
                setSelectedIncidentModal(null);
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
