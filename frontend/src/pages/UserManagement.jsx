import React from 'react';
import Header from '../components/Header';
import { Settings, ShieldCheck, Users, Lock, Key } from 'lucide-react';

const UserManagement = () => {
  return (
    <div className="flex-1 bg-slate-50 min-h-screen">
      <Header title="Municipal Platform Settings & Administration" />

      <main className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">System Configuration & Security</h3>
              <p className="text-xs text-slate-500">Manage environment settings, role-based permissions, and database parameters</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Role-Based Authorization (RBAC)
              </h4>
              <p className="text-slate-600"><strong>ADMIN:</strong> Full system access, data mutation, team dispatch, report generation.</p>
              <p className="text-slate-600"><strong>OPERATOR:</strong> Telemetry input, route tracking, task resolution, alert management.</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-sky-600" />
                Security Standards
              </h4>
              <p className="text-slate-600">Bcrypt password hashing enabled (salt factor 12).</p>
              <p className="text-slate-600">HS256 JWT bearer token authentication active.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserManagement;
