import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { analyticsAPI } from '../services/api';
import { BarChart3, TrendingUp, Cpu, Activity, Droplets, Trash2, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';

const Analytics = () => {
  const [waterData, setWaterData] = useState(null);
  const [wasteData, setWasteData] = useState(null);
  const [civicData, setCivicData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ML Predictor Form
  const [mlForm, setMlForm] = useState({
    supplied: 280.0,
    consumed: 175.0,
    flow_rate: 22.0,
    pressure: 1.6,
    population: 32000
  });
  const [mlResult, setMlResult] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [wRes, wstRes, cRes] = await Promise.all([
        analyticsAPI.getWaterAnalytics(),
        analyticsAPI.getWasteAnalytics(),
        analyticsAPI.getCivicAnalytics()
      ]);
      if (wRes.success) setWaterData(wRes.data);
      if (wstRes.success) setWasteData(wstRes.data);
      if (cRes.success) setCivicData(cRes.data);
    } catch (err) {
      console.error("Failed to load analytics suite:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handlePredictML = async (e) => {
    e.preventDefault();
    setPredicting(true);
    try {
      const res = await analyticsAPI.predictRisk(mlForm);
      if (res.success) setMlResult(res.data);
    } catch (err) {
      alert(err.message || 'Prediction failed');
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-100 min-h-screen">
      <Header title="Decision-Driven Civic Analytics & Machine Learning Intelligence" />

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Executive Decision Analytics</h1>
          <p className="text-xs text-slate-500 font-medium">Strategic intelligence structured around core municipal decision questions</p>
        </div>

        {/* QUESTION 1: WHERE ARE WE LOSING WATER? */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase">Question 1: Where are we losing water?</h2>
              <p className="text-xs text-slate-500">Unmetered loss across 10 distribution zones — highlighting zones exceeding the 20% loss threshold</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterData?.loss_by_zone || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="zone_name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} label={{ value: 'Avg Loss (m³)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="avg_loss_m3" name="Estimated Loss (m³)" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* QUESTION 2: WHERE ARE COLLECTION PROBLEMS? */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase">Question 2: Where are collection problems?</h2>
              <p className="text-xs text-slate-500">Route completion rates across 10 collection wards — identifying areas with missed or delayed clearances</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteData?.area_metrics || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="area_name" stroke="#94a3b8" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} label={{ value: 'Completion %', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="completion_rate" name="Completion Rate (%)" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* QUESTION 3: HOW FAST ARE WE RESPONDING? */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase">Question 3: How fast are we responding?</h2>
              <p className="text-xs text-slate-500">Average response and resolution benchmarks by municipal department</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border space-y-1 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Avg Leakage Response</span>
              <h4 className="text-2xl font-black text-sky-800 font-mono">35 Minutes</h4>
              <p className="text-[10px] text-slate-500">Pipeline Repair Crew</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border space-y-1 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Avg Sanitation Clearance</span>
              <h4 className="text-2xl font-black text-emerald-800 font-mono">42 Minutes</h4>
              <p className="text-[10px] text-slate-500">Waste Collection Crew</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border space-y-1 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">24-Hour Resolution Rate</span>
              <h4 className="text-2xl font-black text-purple-800 font-mono">94.8%</h4>
              <p className="text-[10px] text-slate-500">All Civic Incidents</p>
            </div>
          </div>
        </section>

        {/* QUESTION 4: WHAT NEEDS IMMEDIATE ATTENTION? (ML RISK PREDICTOR) */}
        <section className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2 bg-gradient-to-br from-sky-500 to-rose-500 rounded-xl text-white">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-white uppercase">Question 4: What needs immediate attention?</h2>
              <p className="text-xs text-slate-400">Scikit-Learn Random Forest Machine Learning Risk Predictor Sandbox</p>
            </div>
          </div>

          <form onSubmit={handlePredictML} className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Water Supplied (m³)</label>
              <input
                type="number"
                step="any"
                required
                value={mlForm.supplied}
                onChange={(e) => setMlForm({ ...mlForm, supplied: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Water Consumed (m³)</label>
              <input
                type="number"
                step="any"
                required
                value={mlForm.consumed}
                onChange={(e) => setMlForm({ ...mlForm, consumed: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Flow Rate (L/sec)</label>
              <input
                type="number"
                step="any"
                required
                value={mlForm.flow_rate}
                onChange={(e) => setMlForm({ ...mlForm, flow_rate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Pressure (bar)</label>
              <input
                type="number"
                step="any"
                required
                value={mlForm.pressure}
                onChange={(e) => setMlForm({ ...mlForm, pressure: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={predicting}
                className="w-full py-2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-black rounded-xl shadow-lg transition-all"
              >
                {predicting ? 'Classifying...' : 'Predict Risk Level'}
              </button>
            </div>
          </form>

          {mlResult && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-sky-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
              <div>
                <p className="text-slate-400 uppercase font-bold text-[10px]">Predicted Risk Classification</p>
                <h4 className="text-2xl font-black text-sky-300 font-mono mt-0.5">{mlResult.predicted_risk_level}</h4>
                <p className="text-slate-400 mt-1">Model Confidence: <strong className="text-emerald-400 font-mono">{mlResult.confidence_percentage}%</strong></p>
              </div>

              <div className="flex items-center gap-6 text-right">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Normal Probability</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">{mlResult.probabilities?.Normal}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Medium Probability</span>
                  <span className="font-mono font-black text-amber-400 text-sm">{mlResult.probabilities?.Medium}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">High / Critical</span>
                  <span className="font-mono font-black text-rose-400 text-sm">{mlResult.probabilities?.High_Critical}%</span>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Analytics;
