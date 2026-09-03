import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { waterAPI, wasteAPI, incidentsAPI, teamsAPI, repairServicesAPI } from '../services/api';
import { getSeverityBadgeClass } from '../utils/formatters';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Map, Droplets, Trash2, AlertOctagon, Users, Wrench, RefreshCw, Eye } from 'lucide-react';

const createIcon = (type, color) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="30" height="30" stroke="#ffffff" stroke-width="1.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const CivicMap = () => {
  const [waterZones, setWaterZones] = useState([]);
  const [wasteAreas, setWasteAreas] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Layer Toggles
  const [layers, setLayers] = useState({
    water: true,
    waste: true,
    incidents: true,
    teams: true,
    services: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [zRes, aRes, incRes, tRes, sRes] = await Promise.all([
        waterAPI.getZones(),
        wasteAPI.getAreas(),
        incidentsAPI.getIncidents(),
        teamsAPI.getTeams(),
        repairServicesAPI.getServices()
      ]);
      if (zRes.success) setWaterZones(zRes.data);
      if (aRes.success) setWasteAreas(aRes.data);
      if (incRes.success) setIncidents(incRes.data);
      if (tRes.success) setTeams(tRes.data);
      if (sRes.success) setServices(sRes.data);
    } catch (err) {
      console.error("Failed to load map assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleLayer = (key) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  const center = [12.965, 77.595];

  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header title="CivicResource Multi-Layer GIS Operations Map" />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Geospatial Resource & Incident Map</h1>
            <p className="text-xs text-slate-500">Interactive OpenStreetMap view showing Water distribution zones, Waste collection wards, active Civic Incidents, response teams, and repair services</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs text-xs font-bold">
            <button
              onClick={() => toggleLayer('water')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${layers.water ? 'bg-sky-100 border-sky-300 text-sky-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
            >
              <Droplets className="w-3.5 h-3.5" /> Water Zones
            </button>
            <button
              onClick={() => toggleLayer('waste')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${layers.waste ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
            >
              <Trash2 className="w-3.5 h-3.5" /> Waste Wards
            </button>
            <button
              onClick={() => toggleLayer('incidents')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${layers.incidents ? 'bg-rose-100 border-rose-300 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
            >
              <AlertOctagon className="w-3.5 h-3.5" /> Civic Incidents
            </button>
            <button
              onClick={() => toggleLayer('teams')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-colors ${layers.teams ? 'bg-purple-100 border-purple-300 text-purple-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
            >
              <Users className="w-3.5 h-3.5" /> Teams
            </button>
          </div>
        </div>

        {/* MAP CONTAINER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden h-[620px] relative z-10">
          <MapContainer center={center} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Water Zone Layer */}
            {layers.water && waterZones.map((z) => (
              <React.Fragment key={`zone-${z.id}`}>
                <Circle center={[z.latitude, z.longitude]} radius={1000} pathOptions={{ color: '#0284c7', fillColor: '#0284c7', fillOpacity: 0.15 }} />
                <Marker position={[z.latitude, z.longitude]} icon={createIcon('water', '#0284c7')}>
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <h4 className="font-extrabold text-sky-800">{z.zone_name}</h4>
                      <p>Population: {z.population.toLocaleString()}</p>
                      <p className="font-bold text-rose-600">Est. Loss: {z.latest_leakage_percentage?.toFixed(1)}%</p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}

            {/* Waste Area Layer */}
            {layers.waste && wasteAreas.map((a) => (
              <React.Fragment key={`area-${a.id}`}>
                <Circle center={[a.latitude, a.longitude]} radius={1000} pathOptions={{ color: '#059669', fillColor: '#059669', fillOpacity: 0.15 }} />
                <Marker position={[a.latitude, a.longitude]} icon={createIcon('waste', '#059669')}>
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <h4 className="font-extrabold text-emerald-800">{a.area_name}</h4>
                      <p>Population: {a.population.toLocaleString()}</p>
                      <p className="font-bold text-emerald-600">Completion: {a.completion_rate?.toFixed(1)}%</p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}

            {/* Civic Incidents Layer */}
            {layers.incidents && incidents.map((inc) => {
              const color = inc.severity === 'Critical' ? '#e11d48' : (inc.severity === 'High' ? '#f97316' : '#f59e0b');
              return (
                <Marker key={`inc-${inc.id}`} position={[inc.latitude, inc.longitude]} icon={createIcon('inc', color)}>
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <div className="flex items-center gap-1 font-extrabold">
                        <span className="text-rose-600">{inc.incident_code}</span>
                        <span className="text-slate-400">({inc.resource_type})</span>
                      </div>
                      <p className="font-bold">{inc.incident_type}</p>
                      <p className="text-slate-500">{inc.location}</p>
                      <p className="font-extrabold text-rose-700">Priority Score: {inc.priority_score.toFixed(1)}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Response Teams Layer */}
            {layers.teams && teams.map((t) => (
              <Marker key={`team-${t.id}`} position={[t.latitude, t.longitude]} icon={createIcon('team', '#9333ea')}>
                <Popup>
                  <div className="p-1 space-y-1 text-xs">
                    <h4 className="font-extrabold text-purple-900">{t.team_name}</h4>
                    <p className="font-semibold text-purple-700">{t.team_type}</p>
                    <p>Phone: {t.phone}</p>
                    <p>Availability: <strong className="text-emerald-600">{t.availability}</strong></p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </main>
    </div>
  );
};

export default CivicMap;
