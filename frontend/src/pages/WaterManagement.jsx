import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import WaterLossFlow from '../components/visualizations/WaterLossFlow';
import PressureTimeline from '../components/visualizations/PressureTimeline';
import { waterAPI } from '../services/api';
import { getSeverityBadgeClass } from '../utils/formatters';
import { Droplets, Activity, Gauge, AlertTriangle, Plus, RefreshCw, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

const WaterManagement = () => {
  const [zones, setZones] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [readings, setReadings] = useState([]);
  const [selectedZone, setSelectedZone] = useState('1');
  const [pressureHistory, setPressureHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Reading Modal
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [readingForm, setReadingForm] = useState({
    zone_id: 1,
    pipeline_id: 1,
    water_supplied: 250.0,
    water_consumed: 180.0,
    flow_rate: 20.0,
    pressure: 3.5
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [zRes, pRes, rRes] = await Promise.all([
        waterAPI.getZones(),
        waterAPI.getPipelines(),
        waterAPI.getReadings()
      ]);
      if (zRes.success) setZones(zRes.data);
      if (pRes.success) setPipelines(pRes.data);
      if (rRes.success) setReadings(rRes.data);
    } catch (err) {
      console.error("Failed to load water telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedZone) {
      waterAPI.getPressureHistory(selectedZone).then(res => {
        if (res.success) setPressureHistory(res.data);
      });
    }
  }, [selectedZone]);

  const handleCreateReading = async (e) => {
    e.preventDefault();
    try {
      await waterAPI.createReading(readingForm);
      setIsReadingModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to record water reading');
    }
  };

  const activeZoneObj = zones.find(z => String(z.id) === String(selectedZone));

  // Compute Total Water Flow
  const totalSupplied = readings.reduce((acc, r) => acc + r.water_supplied, 0) || 125000;
  const totalConsumed = readings.reduce((acc, r) => acc + r.water_consumed, 0) || 98000;
  const totalLoss = Math.max(0, totalSupplied - totalConsumed);
  const lossPct = totalSupplied > 0 ? Number(((totalLoss / totalSupplied) * 100).toFixed(1)) : 21.6;

  return (
    <div className="flex-1 bg-slate-100 min-h-screen">
      <Header title="Municipal Hydraulic & Water Distribution Command" />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Water Distribution Network & Loss Diagnostics</h1>
            <p className="text-xs text-slate-500 font-medium">Visualizing flow from Municipal Reservoirs ➔ Trunk Pipelines ➔ Distribution Zones with automated leakage detection</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReadingModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Log Telemetry Reading
            </button>
            <button
              onClick={fetchData}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 1. SANKEY-STYLE WATER LOSS FLOW VISUALIZATION */}
        <WaterLossFlow
          supplied={totalSupplied}
          consumed={totalConsumed}
          loss={totalLoss}
          lossPct={lossPct}
        />

        {/* 2. HYDRAULIC PRESSURE TIMELINE & SAFE BOUNDARIES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black tracking-wider text-slate-900 uppercase">
              Zone Hydraulic Head Pressure Curves
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Select Zone:</span>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="text-xs font-bold text-sky-800 bg-white border border-slate-200 rounded-xl px-3 py-1.5 outline-none shadow-xs"
              >
                {zones.map(z => <option key={z.id} value={String(z.id)}>{z.zone_name} ({z.zone_code})</option>)}
              </select>
            </div>
          </div>

          <PressureTimeline history={pressureHistory} zoneName={activeZoneObj?.zone_name} />
        </div>

        {/* 3. WATER DISTRIBUTION NETWORK SCHEMATIC & ZONES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black tracking-wider text-slate-900 uppercase flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-600" />
                Distribution Zones & Trunk Pipeline Nodes ({zones.length} Zones)
              </h3>
              <p className="text-xs text-slate-500">Live zone telemetry, population serviced, and localized risk classification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((z) => {
              const isHigh = z.latest_risk_level === 'High' || z.latest_risk_level === 'Critical';
              return (
                <div
                  key={z.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-sky-300 hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-extrabold text-xs text-sky-800 bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200">
                        {z.zone_code}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${getSeverityBadgeClass(z.latest_risk_level)}`}>
                        {z.latest_risk_level} Risk
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-sm text-slate-900">{z.zone_name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {z.latitude.toFixed(4)}, {z.longitude.toFixed(4)}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Serviced Population</span>
                        <span className="font-extrabold text-slate-900 font-mono">{z.population.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Est. Leakage</span>
                        <span className={`font-mono font-black ${isHigh ? 'text-rose-600' : 'text-slate-800'}`}>
                          {z.latest_leakage_percentage?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold">Status:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {z.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* New Reading Modal */}
      <Modal isOpen={isReadingModalOpen} onClose={() => setIsReadingModalOpen(false)} title="Log Water Reading Telemetry">
        <form onSubmit={handleCreateReading} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Water Zone</label>
            <select
              value={readingForm.zone_id}
              onChange={(e) => setReadingForm({ ...readingForm, zone_id: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            >
              {zones.map(z => <option key={z.id} value={z.id}>{z.zone_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pipeline Trunk Line</label>
            <select
              value={readingForm.pipeline_id}
              onChange={(e) => setReadingForm({ ...readingForm, pipeline_id: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
            >
              {pipelines.map(p => <option key={p.id} value={p.id}>{p.pipeline_name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Water Supplied (m³)</label>
              <input
                type="number"
                step="any"
                required
                value={readingForm.water_supplied}
                onChange={(e) => setReadingForm({ ...readingForm, water_supplied: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Water Consumed (m³)</label>
              <input
                type="number"
                step="any"
                required
                value={readingForm.water_consumed}
                onChange={(e) => setReadingForm({ ...readingForm, water_consumed: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Flow Rate (L/sec)</label>
              <input
                type="number"
                step="any"
                required
                value={readingForm.flow_rate}
                onChange={(e) => setReadingForm({ ...readingForm, flow_rate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hydraulic Pressure (bar)</label>
              <input
                type="number"
                step="any"
                required
                value={readingForm.pressure}
                onChange={(e) => setReadingForm({ ...readingForm, pressure: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIsReadingModalOpen(false)} className="px-4 py-2 border rounded-lg text-slate-600">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-lg font-bold">Submit Reading</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WaterManagement;
