import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { tasksAPI, teamsAPI } from '../services/api';
import { formatDate } from '../utils/formatters';
import { CheckSquare, Plus, RefreshCw, Clock, CheckCircle2, UserCheck, Wrench } from 'lucide-react';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, tmRes] = await Promise.all([
        tasksAPI.getTasks({ resource_type: domainFilter }),
        teamsAPI.getTeams()
      ]);
      if (tRes.success) setTasks(tRes.data);
      if (tmRes.success) setTeams(tmRes.data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [domainFilter]);

  const handleUpdateStatus = async (taskId, nextStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, { status: nextStatus });
      fetchData();
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header title="Municipal Actionable Task Management" />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Task Dispatch & Execution Board</h1>
            <p className="text-xs text-slate-500">Track task assignments across Pipeline Repairs, Pressure Investigations, Waste Collections, and Area Cleanup</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
            >
              <option value="">All Tasks (Water & Waste)</option>
              <option value="WATER">Water Tasks</option>
              <option value="WASTE">Waste Tasks</option>
            </select>
            <button onClick={fetchData} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-xs">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* TASKS TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-extrabold border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Task Code</th>
                  <th className="py-3.5 px-4">Domain</th>
                  <th className="py-3.5 px-4">Task Title</th>
                  <th className="py-3.5 px-4">Assigned Team</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Task Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono font-extrabold text-sky-700">{t.task_code}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        t.resource_type === 'WATER' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {t.resource_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{t.task_title}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{t.assigned_team_name}</td>
                    <td className="py-3 px-4 font-bold">{t.priority}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{formatDate(t.due_date)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        t.status === 'Completed' || t.status === 'Closed' ? 'bg-emerald-100 text-emerald-800' :
                        t.status === 'In Progress' ? 'bg-sky-100 text-sky-800 animate-pulse' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {t.status === 'Assigned' && (
                        <button onClick={() => handleUpdateStatus(t.id, 'In Progress')} className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-[10px]">
                          Start
                        </button>
                      )}
                      {t.status === 'In Progress' && (
                        <button onClick={() => handleUpdateStatus(t.id, 'Completed')} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px]">
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskManagement;
