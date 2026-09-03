# 🛡️ CivicResource – Intelligent Municipal Water & Waste Management Platform

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://react.dev/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.57+-FF4B4B.svg)](https://streamlit.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0+-38B2AC.svg)](https://tailwindcss.com/)

**CivicResource** is a unified municipal resource operations and incident response platform combining **Water Distribution Management** and **Solid Waste Collection Management** into a single cohesive operational lifecycle:

$$\text{DETECT} \longrightarrow \text{ANALYZE} \longrightarrow \text{PRIORITIZE} \longrightarrow \text{ASSIGN} \longrightarrow \text{RESPOND} \longrightarrow \text{VERIFY} \longrightarrow \text{RESOLVE}$$

---

## 🌟 Key Capabilities & Visualizations

1. **🏛️ Centralized Operations Command Center**: Connected node flow diagram showing live telemetry converging from 10 Water Zones and 10 Waste Wards into Unified Incidents, Tasks, and Field Team Dispatches.
2. **📊 7-Stage Civic Response Pipeline**: Interactive stepper filtering incidents across `DETECTED`, `ANALYZED`, `PRIORITIZED`, `ASSIGNED`, `IN PROGRESS`, `VERIFICATION`, and `RESOLVED`.
3. **💧 Water Distribution & Loss Balance**:
   - Sankey-style inflow vs consumption vs unmetered loss breakdown.
   - Hydraulic pressure safety curve with boundary threshold zones ($2.0\text{ bar} - 6.0\text{ bar}$).
4. **🗑️ Solid Waste Route Operations**:
   - Real-time collection completion progress and 5-day historical trendlines.
   - Accumulation risk hotspot detection based on missed schedules and delayed pickups.
5. **🚨 Civic Priority Matrix**: 2D scatter matrix positioning incidents by **Impact Factor** vs **Urgency & Severity** to isolate critical-quadrant emergencies.
6. **🔧 Proximity Repair Contractor Finder**: Haversine distance calculations ($5-50\text{ km}$) connecting high-priority leaks with registered local plumbing contractors.
7. **🤖 Scikit-Learn ML Risk Intelligence**: Random Forest classification model predicting unmetered leakage risk with probability distributions.
8. **📄 Executive Audit Reporting**: Automated ReportLab PDF summaries and raw CSV telemetry datasets.

---

## 🏗️ Tech Stack

- **Backend**: Python 3.11, FastAPI, SQLAlchemy ORM, Pydantic v2, Scikit-Learn, ReportLab, SQLite.
- **Frontend (Web Command Center)**: React 18, Vite, Tailwind CSS v4, Lucide React, Recharts, React Leaflet (OpenStreetMap).
- **Companion Streamlit Data App**: Streamlit, Plotly, Pandas, NumPy.

---

## 🚀 Quickstart & How to Run

### Option 1: Full-Stack Web App (React + FastAPI)

#### 1. Start the Backend API Server
```powershell
cd backend
pip install -r requirements.txt
python seed_data.py
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
- API Swagger Documentation: `http://localhost:8000/api/docs`

#### 2. Start the Frontend Web Portal
```powershell
cd frontend
npm install
npm run dev
```
- Open in browser: `http://localhost:5173`

---

### Option 2: Streamlit Companion App

You can run the entire platform as a single-command Streamlit application:
```powershell
streamlit run streamlit_app.py
```
- Open in browser: `http://localhost:8501`

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@civicresource.gov` | `Admin@123` | Full control, triage, contractor assignment, PDF audits |
| **Field Operator** | `operator@civicresource.gov` | `Operator@123` | Telemetry entry, route tracking, incident resolution |

---

## 🧪 Testing & Quality Assurance
Run the backend test suite:
```powershell
cd backend
python test_backend.py
```

Run frontend production build verification:
```powershell
cd frontend
npm run build
```

---

## 📄 License
This project is licensed under the Apache 2.0 License.
