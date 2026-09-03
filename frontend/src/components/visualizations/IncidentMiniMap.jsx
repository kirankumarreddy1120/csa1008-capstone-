import React from 'react';
import { MapPin, Wrench, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

const IncidentMiniMap = ({ incident = {}, nearbyService = null, onAssignService = () => {} }) => {
  const service = nearbyService || {
    service_name: "AquaFix Fast Response Services",
    contact_person: "Kiran Sharma",
    phone: "+91 98450 12345",
    distance_km: 2.4,
    availability: "Available"
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h4 className="text-xs font-black tracking-wider uppercase text-sky-400 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-500" />
          Proximity Dispatch & Contractor Visualizer
        </h4>
        <span className="text-[10px] font-mono text-emerald-400 font-bold">Haversine GPS Live</span>
      </div>

      {/* Proximity Distance Flow */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
        {/* Incident Location Node */}
        <div className="text-center space-y-1">
          <div className="w-8 h-8 rounded-full bg-rose-600/30 border border-rose-500 text-rose-400 flex items-center justify-center mx-auto">
            <MapPin className="w-4 h-4 animate-bounce" />
          </div>
          <p className="text-[10px] font-bold text-rose-300">{incident.location || 'Incident Site'}</p>
        </div>

        {/* Distance Vector */}
        <div className="flex-1 flex flex-col items-center justify-center px-2">
          <span className="text-[11px] font-mono font-extrabold text-sky-300">{service.distance_km} KM</span>
          <div className="w-full h-0.5 bg-gradient-to-r from-rose-500 via-sky-500 to-emerald-500 my-1 relative">
            <span className="w-2 h-2 rounded-full bg-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping"></span>
          </div>
          <span className="text-[9px] text-slate-400 font-bold uppercase">Fastest Response</span>
        </div>

        {/* Service Contractor Node */}
        <div className="text-center space-y-1">
          <div className="w-8 h-8 rounded-full bg-emerald-600/30 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
            <Wrench className="w-4 h-4" />
          </div>
          <p className="text-[10px] font-bold text-emerald-300">{service.service_name}</p>
        </div>
      </div>

      {/* Contractor Details Card */}
      <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-white">{service.service_name}</span>
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            {service.availability}
          </span>
        </div>
        <p className="text-slate-300">Contact: {service.contact_person} (<span className="font-mono text-sky-300">{service.phone}</span>)</p>

        <button
          onClick={() => onAssignService(service)}
          className="w-full py-2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-sky-600/30 transition-all mt-2"
        >
          <UserCheck className="w-4 h-4" /> Dispatch / Request Contractor Assignment
        </button>
      </div>
    </div>
  );
};

export default IncidentMiniMap;
