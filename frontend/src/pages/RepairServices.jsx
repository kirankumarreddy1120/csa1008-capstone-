import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { repairServicesAPI, waterAPI, wasteAPI, tasksAPI, incidentsAPI } from '../services/api';
import { MapPin, PhoneCall, Mail, Search, UserCheck, ShieldAlert, Wrench } from 'lucide-react';

const RepairServices = () => {
  const [waterZones, setWaterZones] = useState([]);
  const [wasteAreas, setWasteAreas] = useState([]);
  const [incidents, setIncidents] = useState([]);

  const [domain, setDomain] = useState('water');
  const [selectedLocationId, setSelectedLocationId] = useState(1);
  const [radiusKm, setRadiusKm] = useState(10);
  
  const [nearbyServices, setNearbyServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assign Modal
  const [assignModalObj, setAssignModalObj] = useState(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchBaseLocations = async () => {
    try {
      const [zRes, aRes, incRes] = await Promise.all([
        waterAPI.getZones(),
        wasteAPI.getAreas(),
        incidentsAPI.getIncidents()
      ]);
      if (zRes.success) setWaterZones(zRes.data);
      if (aRes.success) setWasteAreas(aRes.data);
      if (incRes.success) setIncidents(incRes.data);
    } catch (err) {
      console.error("Failed to load locations:", err);
    }
  };

  useEffect(() => {
    fetchBaseLocations();
  }, []);

  const fetchNearby = async () => {
    if (!selectedLocationId) return;
    setLoading(true);
    try {
      const res = await repairServicesAPI.getNearby(selectedLocationId, radiusKm, domain);
      if (res.success) {
        setNearbyServices(res.data.repair_services);
      }
    } catch (err) {
      console.error("Failed to fetch nearby repair services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, [selectedLocationId, radiusKm, domain]);

  const handleAssignService = async () => {
    if (!selectedIncidentId || !assignModalObj) return;
    setAssigning(true);
    try {
      await tasksAPI.createTask({
        incident_id: parseInt(selectedIncidentId),
        task_title: `Contractor Repair: ${assignModalObj.service_name}`,
        description: `Dispatched external contractor (${assignModalObj.service_name}) at distance ${assignModalObj.distance_km} km. Phone: ${assignModalObj.phone}`,
        resource_type: domain.toUpperCase(),
        priority: "High",
        admin_notes: `Assigned repair contractor ${assignModalObj.service_name}.`
      });
      alert(`Successfully dispatched ${assignModalObj.service_name}!`);
      setAssignModalObj(null);
    } catch (err) {
      alert(err.message || 'Dispatch failed');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header title="Proximity Repair Service Finder" />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Registered Local Plumbing & Repair Technicians</h1>
            <p className="text-xs text-slate-500">Haversine distance calculation sorted by availability and proximity (km)</p>
          </div>
        </div>

        {/* Filter Controls Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Domain & Location</label>
            <div className="flex items-center gap-2">
              <select
                value={domain}
                onChange={(e) => { setDomain(e.target.value); setSelectedLocationId(1); }}
                className="px-3 py-2 border border-slate-200 rounded-xl font-bold text-sky-700 bg-slate-50"
              >
                <option value="water">Water Zones</option>
                <option value="waste">Waste Wards</option>
              </select>

              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
              >
                {domain === 'water'
                  ? waterZones.map(z => <option key={z.id} value={z.id}>{z.zone_name}</option>)
                  : wasteAreas.map(a => <option key={a.id} value={a.id}>{a.area_name}</option>)
                }
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Search Radius (KM)</label>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold text-purple-700"
            >
              <option value="5">5 KM Radius</option>
              <option value="10">10 KM Radius (Default)</option>
              <option value="20">20 KM Radius</option>
              <option value="50">50 KM Radius</option>
            </select>
          </div>

          <div className="text-right">
            <span className="font-mono text-slate-500 font-bold">{nearbyServices.length} Contractors Found</span>
          </div>
        </div>

        {/* Nearby Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nearbyServices.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{service.service_name}</h4>
                    <p className="text-slate-500 font-medium">Contact: {service.contact_person}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    service.availability === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {service.availability}
                  </span>
                </div>

                <div className="bg-sky-50 p-2 rounded-xl border border-sky-100 flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Haversine Distance:</span>
                  <span className="font-extrabold text-sky-700 font-mono">{service.distance_km} KM</span>
                </div>

                <p className="font-mono font-bold text-slate-800 flex items-center gap-1.5 pt-1">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                  <a href={`tel:${service.phone}`} className="hover:underline">{service.phone}</a>
                </p>
                <p className="text-slate-500 truncate flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {service.address}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => setAssignModalObj(service)}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center justify-center gap-1"
                >
                  <UserCheck className="w-4 h-4" /> Approve & Assign Contractor
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Assign Modal */}
      <Modal isOpen={!!assignModalObj} onClose={() => setAssignModalObj(null)} title="Approve Repair Contractor Assignment">
        {assignModalObj && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
              <p><strong>Service:</strong> {assignModalObj.service_name}</p>
              <p><strong>Contact:</strong> {assignModalObj.contact_person} ({assignModalObj.phone})</p>
              <p><strong>Distance:</strong> {assignModalObj.distance_km} KM</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Active Incident</label>
              <select
                value={selectedIncidentId}
                onChange={(e) => setSelectedIncidentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold"
              >
                <option value="">Select Incident to Link...</option>
                {incidents.map(inc => (
                  <option key={inc.id} value={inc.id}>{inc.incident_code}: {inc.incident_type} ({inc.location})</option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setAssignModalObj(null)} className="px-4 py-2 border rounded-lg text-slate-600">Cancel</button>
              <button onClick={handleAssignService} disabled={assigning || !selectedIncidentId} className="px-4 py-2 bg-sky-600 text-white rounded-lg font-bold disabled:opacity-40">
                {assigning ? 'Dispatching...' : 'Approve & Create Task'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RepairServices;
