import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WaterManagement from './pages/WaterManagement';
import WasteManagement from './pages/WasteManagement';
import CivicMap from './pages/CivicMap';
import CivicIncidents from './pages/CivicIncidents';
import TaskManagement from './pages/TaskManagement';
import TeamManagement from './pages/TeamManagement';
import RepairServices from './pages/RepairServices';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import UserManagement from './pages/UserManagement';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">Loading CivicResource Platform...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/water" element={<ProtectedRoute><WaterManagement /></ProtectedRoute>} />
          <Route path="/waste" element={<ProtectedRoute><WasteManagement /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><CivicMap /></ProtectedRoute>} />
          <Route path="/incidents" element={<ProtectedRoute><CivicIncidents /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><TaskManagement /></ProtectedRoute>} />
          <Route path="/teams" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
          <Route path="/repair-services" element={<ProtectedRoute><RepairServices /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute adminOnly={true}><UserManagement /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
