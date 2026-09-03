import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { teamsAPI } from '../services/api';
import { Users, Plus, Phone, MapPin, RefreshCw, CheckCircle2 } from 'lucide-react';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Team Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamForm, setTeamForm] = useState({
    team_name: '',
    team_type: 'Pipeline Repair Team',
    contact_person: '',
    phone: '+91-',
    service_area: 'Municipal Wide',
    latitude: 12.9716,
    longitude: 77.5946,
    availability: 'Available',
    status: 'Active'
  });

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await teamsAPI.getTeams();
      if (res.success) setTeams(res.data);
    } catch (err) {
      console.error("Failed to load teams:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await teamsAPI.createTeam(teamForm);
      setIsModalOpen(false);
      fetchTeams();
    } catch (err) {
      alert(err.message || 'Failed to register team');
    }
  };

  const handleToggleAvailability = async (team) => {
    const nextAvail = team.availability === 'Available' ? 'Busy' : (team.availability === 'Busy' ? 'Unavailable' : 'Available');
    try {
      await teamsAPI.updateTeam(team.id, { ...team, availability: nextAvail });
      fetchTeams();
    } catch (err) {
      alert(err.message || 'Failed to update availability');
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header title="Municipal Operational Response Teams" />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Municipal Field Response Teams</h1>
            <p className="text-xs text-slate-500">Manage specialized Water Maintenance, Pipeline Repair, Waste Collection, and Rapid Response crews</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs"
            >
              <Plus className="w-4 h-4" /> Register New Team
            </button>
            <button onClick={fetchTeams} className="p-2 bg-white border rounded-xl text-slate-600 hover:bg-slate-50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* TEAMS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{team.team_name}</h4>
                    <span className="text-xs text-purple-700 font-bold">{team.team_type}</span>
                  </div>
                  <button
                    onClick={() => handleToggleAvailability(team)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold border cursor-pointer ${
                      team.availability === 'Available' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      team.availability === 'Busy' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    {team.availability}
                  </button>
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <p>Contact: <strong className="text-slate-900">{team.contact_person}</strong></p>
                  <p className="font-mono text-sky-700 font-bold">{team.phone}</p>
                  <p>Service Area: {team.service_area}</p>
                </div>
              </div>

              <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-semibold">Active Dispatched Tasks:</span>
                <span className="font-extrabold text-purple-800 font-mono">{team.active_tasks_count} Tasks</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* New Team Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Municipal Response Team">
        <form onSubmit={handleCreateTeam} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Team Name</label>
            <input
              type="text"
              required
              value={teamForm.team_name}
              onChange={(e) => setTeamForm({ ...teamForm, team_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              placeholder="e.g. Zeta Pipeline Response Crew"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Team Specialization Type</label>
            <select
              value={teamForm.team_type}
              onChange={(e) => setTeamForm({ ...teamForm, team_type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
            >
              <option value="Pipeline Repair Team">Pipeline Repair Team</option>
              <option value="Water Maintenance Team">Water Maintenance Team</option>
              <option value="Waste Collection Team">Waste Collection Team</option>
              <option value="Waste Inspection Team">Waste Inspection Team</option>
              <option value="General Civic Response Team">General Civic Response Team</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Leader</label>
              <input
                type="text"
                required
                value={teamForm.contact_person}
                onChange={(e) => setTeamForm({ ...teamForm, contact_person: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={teamForm.phone}
                onChange={(e) => setTeamForm({ ...teamForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold">Register Team</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamManagement;
