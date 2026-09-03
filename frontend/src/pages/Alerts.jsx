import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { alertsAPI } from '../services/api';
import { formatDate } from '../utils/formatters';
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert, Filter, RefreshCw } from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resourceFilter, setResourceFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await alertsAPI.getAlerts({ resource_type: resourceFilter, severity: severityFilter });
      if (res.success) setAlerts(res.data);
    } catch (err) {
      console.error("Failed to load alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [resourceFilter, severityFilter]);

  const handleMarkRead = async (id) => {
    try {
      await alertsAPI.markAsRead(id);
      fetchAlerts();
    } catch (err) {
      alert(err.message || 'Failed to mark read');
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header title="Unified Civic Alert Center" />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Unified Municipal Alert Center</h1>
            <p className="text-xs text-slate-500">Real-time telemetry notifications for Water leakage, Pressure surges, and Waste collection delays</p>
          </div>

          <button onClick={fetchAlerts} className="p-2 bg-white border rounded-xl text-slate-600 hover:bg-slate-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-700">Domain:</span>
              <select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
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
                className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-bold"
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="WARNING">Warning</option>
                <option value="INFO">Info</option>
              </select>
            </div>
          </div>
        </div>

        {/* ALERTS LIST */}
        <div className="space-y-3">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                !a.is_read ? 'bg-white border-slate-300 shadow-xs ring-1 ring-sky-500/20' : 'bg-slate-50 border-slate-200 opacity-80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl text-white ${
                  a.severity === 'CRITICAL' ? 'bg-rose-600' :
                  a.severity === 'HIGH' ? 'bg-orange-500' : 'bg-sky-600'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.2 rounded text-[9px] font-extrabold ${
                      a.resource_type === 'WATER' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {a.resource_type}
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-900">{a.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600">{a.message}</p>
                  <span className="text-[10px] text-slate-400 font-mono">{formatDate(a.created_at)}</span>
                </div>
              </div>

              <div>
                {!a.is_read && (
                  <button
                    onClick={() => handleMarkRead(a.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Alerts;
