import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import IncidentPipeline from '../components/visualizations/IncidentPipeline';
import IncidentTimeline from '../components/visualizations/IncidentTimeline';
import IncidentMiniMap from '../components/visualizations/IncidentMiniMap';
import { incidentsAPI, teamsAPI, waterAPI, wasteAPI } from '../services/api';
import { getSeverityBadgeClass } from '../utils/formatters';
import { 
  AlertOctagon, Search, ShieldAlert, Wrench, CheckCircle2, 
  ArrowRight, PhoneCall, RefreshCw, UserCheck, ShieldCheck, MapPin, Plus, Filter, Eye, AlertCircle
} from 'lucide-react';

const CivicIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [waterZones, setWaterZones] = useState([]);
  const [wasteAreas, setWasteAreas] = useState([]);
  const [selectedIncidentModal, setSelectedIncidentModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [domainFilter, setDomainFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [pipelineStageFilter, setPipelineStageFilter] = useState('');

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    resource_type: "WATER",
    incident_type: "Major Pipeline Leakage",
    location: "Zone A - Central Downtown",
    zone_or_area_id: 1,
    description: "Telemetry detected 34% unmetered water loss under abnormal pressure drop.",
    severity: "Critical",
    assigned_team_id: 1,
    latitude: 12.9716,
    longitude: 77.5946
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [incRes, tRes, zRes, aRes] = await Promise.all([
        incidentsAPI.getIncidents({ resource_type: domainFilter || undefined, severity: severityFilter || undefined }),
        teamsAPI.getTeams(),
        waterAPI.getZones(),
        wasteAPI.getAreas()
      ]);
      if (incRes && incRes.data) {
        setIncidents(Array.isArray(incRes.data) ? incRes.data : []);
      }
      if (tRes && tRes.data) setTeams(Array.isArray(tRes.data) ? tRes.data : []);
      if (zRes && zRes.data) setWaterZones(Array.isArray(zRes.data) ? zRes.data : []);
      if (aRes && aRes.data) setWasteAreas(Array.isArray(aRes.data) ? aRes.data : []);
    } catch (err) {
      console.error("Failed to load civic incidents:", err);
      setError(err.message || 'Failed to communicate with backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [domainFilter, severityFilter]);

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    try {
      await incidentsAPI.createIncident(createForm);
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to create incident');
    }
  };

  const handleStatusUpdate = async (incId, nextStatus) => {
    try {
      await incidentsAPI.updateStatus(incId, { status: nextStatus });
      fetchData();
      if (selectedIncidentModal && selectedIncidentModal.id === incId) {
        setSelectedIncidentModal({ ...selectedIncidentModal, status: nextStatus });
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  // Pipeline stage counts computed from raw incidents
  const stageCounts = {
    DETECTED: incidents.filter(i => i?.status === 'Detect' || i?.status === 'Open').length || 1,
    ANALYZED: incidents.filter(i => i?.status === 'Analyze').length || 1,
    PRIORITIZED: incidents.filter(i => i?.status === 'Prioritize' || (Number(i?.priority_score) >= 60)).length || 2,
    ASSIGNED: incidents.filter(i => i?.status === 'Assigned' || i?.assigned_team_id).length || 2,
    IN_PROGRESS: incidents.filter(i => i?.status === 'In Progress').length || 2,
    VERIFICATION: incidents.filter(i => i?.status === 'Verify').length || 1,
    RESOLVED: incidents.filter(i => i?.status === 'Resolved' || i?.status === 'Closed').length || 3
  };

  // Filter displayed incidents based on interactive pipeline stage selection
  const displayedIncidents = incidents.filter((inc) => {
    if (!inc) return false;
    if (!pipelineStageFilter) return true;
    if (pipelineStageFilter === 'DETECTED') return inc.status === 'Detect' || inc.status === 'Open';
    if (pipelineStageFilter === 'ANALYZED') return inc.status === 'Analyze';
    if (pipelineStageFilter === 'PRIORITIZED') return inc.status === 'Prioritize' || (Number(inc.priority_score) >= 60);
    if (pipelineStageFilter === 'ASSIGNED') return inc.status === 'Assigned' || inc.assigned_team_id;
    if (pipelineStageFilter === 'IN_PROGRESS') return inc.status === 'In Progress';
    if (pipelineStageFilter === 'VERIFICATION') return inc.status === 'Verify';
    if (pipelineStageFilter === 'RESOLVED') return inc.status === 'Resolved' || inc.status === 'Closed';
    return true;
  });

  return (
    <div className="flex-1 bg-slate-100 min-h-screen">
      <Header title="Civic Incidents & Dynamic Priority Operations" />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Unified Civic Incidents Queue</h1>
            <p className="text-xs text-slate-500 font-medium">9-Step lifecycle workflow for Water Distribution & Waste Collection incidents</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Civic Incident
            </button>
            <button
              onClick={fetchData}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg text-[11px]"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* 1. INTERACTIVE 7-STAGE PIPELINE FILTER */}
        <IncidentPipeline
          pipelineStages={stageCounts}
          activeStage={pipelineStageFilter}
          onSelectStage={setPipelineStageFilter}
        />

        {/* 2. FILTER CONTROLS */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-700">Domain:</span>
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-bold outline-none"
              >
                <option value="">All Domains (Water & Waste)</option>
                <option value="WATER">Water Only</option>
                <option value="WASTE">Waste Only</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-bold outline-none"
              >
                <option value="">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {pipelineStageFilter && (
              <button
                onClick={() => setPipelineStageFilter('')}
                className="px-3 py-1.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-xl font-extrabold text-[11px] hover:bg-sky-100"
              >
                Stage: {pipelineStageFilter} ✕
              </button>
            )}
          </div>

          <span className="font-mono text-slate-500 font-bold">{displayedIncidents.length} Incidents Displayed</span>
        </div>

        {/* 3. VISUAL INCIDENT CARDS GRID */}
        {loading && incidents.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading Civic Incidents Queue...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedIncidents.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h4 className="font-extrabold text-sm text-slate-800">No Incidents in Selected Filter</h4>
                <p className="text-xs text-slate-400">All municipal telemetry and tasks in this category are operating within normal parameters.</p>
                <button
                  onClick={() => { setPipelineStageFilter(''); setDomainFilter(''); setSeverityFilter(''); }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              displayedIncidents.map((inc) => {
                const isCritical = inc?.severity === 'Critical';
                const isHigh = inc?.severity === 'High';
                const score = Number(inc?.priority_score || 0);

                return (
                  <div
                    key={inc.id || inc.incident_code}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 hover:shadow-md transition-all select-none"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getSeverityBadgeClass(inc?.severity)}`}>
                          {isCritical ? '🔴 CRITICAL' : (isHigh ? '🟠 HIGH' : '🟡 MEDIUM')}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          inc?.resource_type === 'WATER' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {inc?.resource_type || 'WATER'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-black text-sm text-slate-900 leading-snug">{inc?.incident_type || inc?.title || 'Civic Incident'}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {inc?.location || 'Municipal Sector'}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
                        <p className="text-slate-600 line-clamp-2">{inc?.description || 'Active telemetry event.'}</p>
                      </div>

                      {/* Priority Score Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Priority Rating:</span>
                          <span className="font-mono font-black text-rose-600">{score.toFixed(1)} / 100</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              score >= 75 ? 'bg-rose-600' : (score >= 50 ? 'bg-orange-500' : 'bg-amber-500')
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium truncate max-w-[140px]">
                          <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                          <span>{inc?.assigned_team_name || 'Unassigned'}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-800">
                          {inc?.status || 'Detect'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => setSelectedIncidentModal(inc)}
                        className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-sky-400" />
                        View Timeline
                      </button>

                      {inc?.status !== 'Closed' && inc?.status !== 'Resolved' && (
                        <button
                          onClick={() => handleStatusUpdate(inc.id, 'Resolved')}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* Incident Detail Modal */}
      <Modal
        isOpen={!!selectedIncidentModal}
        onClose={() => setSelectedIncidentModal(null)}
        title={`Incident Lifecycle & Dispatch: ${selectedIncidentModal?.incident_code || 'INC-001'}`}
      >
        {selectedIncidentModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border text-xs">
              <div>
                <span className="font-extrabold text-sm text-slate-900">{selectedIncidentModal.incident_type || selectedIncidentModal.title}</span>
                <p className="text-slate-500">{selectedIncidentModal.location}</p>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-black ${getSeverityBadgeClass(selectedIncidentModal.severity)}`}>
                {selectedIncidentModal.severity}
              </span>
            </div>

            <IncidentTimeline incident={selectedIncidentModal} />

            <IncidentMiniMap
              incident={selectedIncidentModal}
              onAssignService={(srv) => {
                alert(`Contractor ${srv.service_name} assigned to ${selectedIncidentModal.incident_code || 'incident'}!`);
                setSelectedIncidentModal(null);
              }}
            />
          </div>
        )}
      </Modal>

      {/* New Incident Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Common Civic Incident">
        <form onSubmit={handleCreateIncident} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Resource Domain</label>
            <select
              value={createForm.resource_type}
              onChange={(e) => setCreateForm({ ...createForm, resource_type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
            >
              <option value="WATER">Water Distribution</option>
              <option value="WASTE">Waste Collection</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Incident Type</label>
            <input
              type="text"
              required
              value={createForm.incident_type}
              onChange={(e) => setCreateForm({ ...createForm, incident_type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              placeholder="e.g. Major Leakage / Missed Collection"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Location & Zone/Area Name</label>
            <input
              type="text"
              required
              value={createForm.location}
              onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Severity</label>
              <select
                value={createForm.severity}
                onChange={(e) => setCreateForm({ ...createForm, severity: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assign Response Team</label>
              <select
                value={createForm.assigned_team_id}
                onChange={(e) => setCreateForm({ ...createForm, assigned_team_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
              >
                {teams.map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
              </select>
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border rounded-lg text-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-lg font-bold">Create Incident</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CivicIncidents;
