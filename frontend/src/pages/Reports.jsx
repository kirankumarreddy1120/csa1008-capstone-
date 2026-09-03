import React from 'react';
import Header from '../components/Header';
import { reportsAPI } from '../services/api';
import { FileText, Download, FileSpreadsheet, ShieldCheck } from 'lucide-react';

const Reports = () => {
  const reportOptions = [
    { title: "Combined CivicResource Executive Report", desc: "Comprehensive PDF audit report covering both Water Distribution and Waste Collection domains.", type: "combined" },
    { title: "Water Distribution Performance Report", desc: "PDF report summarizing 10 water zones, trunk line readings, and leakage risk classifications.", type: "water" },
    { title: "Waste Collection Performance Report", desc: "PDF report summarizing 10 waste wards, completion rates, missed routes, and area requests.", type: "waste" },
    { title: "Civic Incidents & Priority Audit", desc: "PDF log of all active and resolved civic incidents sorted by priority score.", type: "incidents" },
  ];

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header title="Municipal Reports & Data Exporter Portal" />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Executive PDF & CSV Reports</h1>
            <p className="text-xs text-slate-500">Download formatted ReportLab PDF audits or raw CSV datasets for municipal reporting</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportOptions.map((rep) => (
            <div key={rep.type} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">{rep.title}</h3>
                </div>
                <p className="text-xs text-slate-500">{rep.desc}</p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <a
                  href={reportsAPI.getPDFUrl(rep.type)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </a>
                <a
                  href={reportsAPI.getCSVUrl(rep.type)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Reports;
