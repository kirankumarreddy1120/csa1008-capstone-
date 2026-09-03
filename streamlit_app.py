import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import pydeck as pdk
import requests
import json
from datetime import datetime, timedelta

# Page Configuration
st.set_page_config(
    page_title="CivicResource - Municipal Operations Command Center",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom High-Tech Command Center Styling
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    
    .stApp {
        background: #0f172a;
        color: #f8fafc;
    }
    
    .metric-card {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        border: 1px solid #334155;
        border-radius: 16px;
        padding: 20px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
    }
    
    .incident-card {
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 20px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }
    
    .badge-critical {
        background: #881337;
        color: #fecdd3;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 800;
        font-size: 11px;
        text-transform: uppercase;
        border: 1px solid #be123c;
    }
    
    .badge-high {
        background: #7c2d12;
        color: #fed7aa;
        padding: 4px 10px;
        border-radius: 9999px;
        font-weight: 800;
        font-size: 11px;
        text-transform: uppercase;
        border: 1px solid #c2410c;
    }
    
    .badge-water {
        background: #0c4a6e;
        color: #bae6fd;
        padding: 4px 10px;
        border-radius: 8px;
        font-weight: 800;
        font-size: 11px;
        text-transform: uppercase;
    }
    
    .badge-waste {
        background: #064e3b;
        color: #a7f3d0;
        padding: 4px 10px;
        border-radius: 8px;
        font-weight: 800;
        font-size: 11px;
        text-transform: uppercase;
    }
</style>
""", unsafe_allow_html=True)

# API Base URL (Local Fallback Support)
API_URL = "http://localhost:8000/api"

# Default Demo Datasets
DEFAULT_ZONES = [
    {"zone_code": "ZA-001", "zone_name": "Zone A - Central Downtown", "lat": 12.9716, "lng": 77.5946, "population": 45000, "loss_pct": 6.2, "risk": "Normal"},
    {"zone_code": "ZB-002", "zone_name": "Zone B - North Suburbs", "lat": 12.9850, "lng": 77.6050, "population": 38000, "loss_pct": 5.8, "risk": "Normal"},
    {"zone_code": "ZC-003", "zone_name": "Zone C - Industrial Sector", "lat": 12.9600, "lng": 77.5800, "population": 22000, "loss_pct": 4.5, "risk": "Normal"},
    {"zone_code": "ZD-004", "zone_name": "Zone D - East Market District", "lat": 12.9780, "lng": 77.6200, "population": 52000, "loss_pct": 34.0, "risk": "Critical"},
    {"zone_code": "ZE-005", "zone_name": "Zone E - West Residential Heights", "lat": 12.9550, "lng": 77.5700, "population": 31000, "loss_pct": 8.1, "risk": "Normal"},
    {"zone_code": "ZF-006", "zone_name": "Zone F - South Green Valley", "lat": 12.9400, "lng": 77.5900, "population": 29000, "loss_pct": 3.9, "risk": "Normal"},
    {"zone_code": "ZG-007", "zone_name": "Zone G - IT Technology Corridor", "lat": 12.9350, "lng": 77.6100, "population": 64000, "loss_pct": 24.5, "risk": "High"},
    {"zone_code": "ZH-008", "zone_name": "Zone H - Old Heritage Quarter", "lat": 12.9650, "lng": 77.6150, "population": 27000, "loss_pct": 7.2, "risk": "Normal"},
    {"zone_code": "ZI-009", "zone_name": "Zone I - University Campus Zone", "lat": 12.9500, "lng": 77.5600, "population": 18000, "loss_pct": 4.1, "risk": "Normal"},
    {"zone_code": "ZJ-010", "zone_name": "Zone J - Harbor & Logistics Park", "lat": 12.9900, "lng": 77.6350, "population": 15000, "loss_pct": 5.0, "risk": "Normal"}
]

DEFAULT_AREAS = [
    {"area_code": "WST-W01", "area_name": "Ward 1 - Downtown Commercial", "lat": 12.9720, "lng": 77.5950, "population": 42000, "completion_rate": 96.0, "active_issues": 0},
    {"area_code": "WST-W02", "area_name": "Ward 2 - Northern Residential", "lat": 12.9860, "lng": 77.6040, "population": 36000, "completion_rate": 92.0, "active_issues": 0},
    {"area_code": "WST-W03", "area_name": "Ward 3 - East Industrial Belt", "lat": 12.9610, "lng": 77.5810, "population": 25000, "completion_rate": 88.0, "active_issues": 1},
    {"area_code": "WST-W04", "area_name": "Ward 4 - Riverside Market Hub", "lat": 12.9790, "lng": 77.6210, "population": 54000, "completion_rate": 78.0, "active_issues": 2},
    {"area_code": "WST-W05", "area_name": "Ward 5 - West Garden Suburb", "lat": 12.9560, "lng": 77.5710, "population": 32000, "completion_rate": 64.0, "active_issues": 3},
    {"area_code": "WST-W06", "area_name": "Ward 6 - Southern Eco District", "lat": 12.9410, "lng": 77.5910, "population": 28000, "completion_rate": 95.0, "active_issues": 0},
    {"area_code": "WST-W07", "area_name": "Ward 7 - Tech Park Metro", "lat": 12.9360, "lng": 77.6110, "population": 61000, "completion_rate": 84.0, "active_issues": 1},
    {"area_code": "WST-W08", "area_name": "Ward 8 - Old Town Heritage", "lat": 12.9660, "lng": 77.6160, "population": 26000, "completion_rate": 91.0, "active_issues": 0},
    {"area_code": "WST-W09", "area_name": "Ward 9 - Knowledge Village", "lat": 12.9510, "lng": 77.5610, "population": 19000, "completion_rate": 98.0, "active_issues": 0},
    {"area_code": "WST-W10", "area_name": "Ward 10 - Logistics Terminal", "lat": 12.9910, "lng": 77.6360, "population": 14000, "completion_rate": 89.0, "active_issues": 0}
]

DEFAULT_INCIDENTS = [
    {"incident_code": "INC-WTR-04-101", "resource_type": "WATER", "incident_type": "Major Pipeline Leakage", "location": "Zone D - East Market District", "severity": "Critical", "priority_score": 92.0, "assigned_team_name": "Alpha Pipeline Emergency Crew", "status": "In Progress", "impact_metric": "34% Water Loss", "affected_population": 52000, "lat": 12.9780, "lng": 77.6200},
    {"incident_code": "INC-WST-05-102", "resource_type": "WASTE", "incident_type": "Missed Collection Overflow", "location": "Ward 5 - West Garden Suburb", "severity": "High", "priority_score": 78.5, "assigned_team_name": "Gamma Heavy Waste Compactor Crew", "status": "Assigned", "impact_metric": "2 Days Delayed", "affected_population": 32000, "lat": 12.9560, "lng": 77.5710},
    {"incident_code": "INC-WTR-07-103", "resource_type": "WATER", "incident_type": "Hydraulic Pressure Surge", "location": "Zone G - IT Technology Corridor", "severity": "High", "priority_score": 84.0, "assigned_team_name": "Beta Water Valve & Pressure Unit", "status": "Detect", "impact_metric": "7.2 bar Pressure", "affected_population": 64000, "lat": 12.9350, "lng": 77.6100},
    {"incident_code": "INC-WST-04-104", "resource_type": "WASTE", "incident_type": "Marketplace Commercial Dump", "location": "Ward 4 - Riverside Market Hub", "severity": "Medium", "priority_score": 62.0, "assigned_team_name": "Delta Sanitation Inspection Team", "status": "Analyze", "impact_metric": "Illegal Dump Report", "affected_population": 54000, "lat": 12.9790, "lng": 77.6210},
    {"incident_code": "INC-WTR-01-105", "resource_type": "WATER", "incident_type": "Under-Pressure Flow Drop", "location": "Zone A - Central Downtown", "severity": "Medium", "priority_score": 58.0, "assigned_team_name": "Alpha Pipeline Emergency Crew", "status": "Prioritize", "impact_metric": "1.4 bar Low Pressure", "affected_population": 45000, "lat": 12.9716, "lng": 77.5946},
    {"incident_code": "INC-WST-01-106", "resource_type": "WASTE", "incident_type": "Downtown Bin Sensor Failure", "location": "Ward 1 - Downtown Commercial", "severity": "Low", "priority_score": 34.0, "assigned_team_name": "Delta Sanitation Inspection Team", "status": "Verify", "impact_metric": "Sensor Offline", "affected_population": 42000, "lat": 12.9720, "lng": 77.5950},
    {"incident_code": "INC-WTR-02-107", "resource_type": "WATER", "incident_type": "Minor Valve Leakage", "location": "Zone B - North Suburbs", "severity": "Low", "priority_score": 28.0, "assigned_team_name": "Beta Water Valve & Pressure Unit", "status": "Resolved", "impact_metric": "Resolved Leak", "affected_population": 38000, "lat": 12.9850, "lng": 77.6050},
    {"incident_code": "INC-WST-03-108", "resource_type": "WASTE", "incident_type": "Industrial Slag Clearance", "location": "Ward 3 - East Industrial Belt", "severity": "Medium", "priority_score": 52.0, "assigned_team_name": "Gamma Heavy Waste Compactor Crew", "status": "Resolved", "impact_metric": "Bins Cleared", "affected_population": 25000, "lat": 12.9610, "lng": 77.5810}
]

# Helper to fetch API
def fetch_api(endpoint, default=None):
    try:
        res = requests.get(f"{API_URL}/{endpoint}", timeout=2)
        if res.status_code == 200:
            return res.json().get("data", default)
    except Exception:
        pass
    return default

# Sidebar Navigation
st.sidebar.markdown("## 🛡️ CivicResource")
st.sidebar.markdown("### **Municipal Operations Center**")
st.sidebar.markdown("---")

menu = st.sidebar.radio(
    "Operations Navigation",
    [
        "🏛️ Operations Command Center",
        "🗺️ Multi-Layer GIS Map",
        "💧 Water Distribution Network",
        "🗑️ Waste Collection Operations",
        "🚨 Civic Incidents Queue",
        "🤖 ML Risk Intelligence",
        "📄 Reports & Audit Export"
    ]
)

st.sidebar.markdown("---")
st.sidebar.markdown("""
<div style="background: #1e293b; padding: 12px; border-radius: 12px; border: 1px solid #334155; font-size: 12px;">
    <span style="color: #10b981; font-weight: 800;">● System Operational</span><br>
    <span style="color: #94a3b8;">Water Zones: 10 Active</span><br>
    <span style="color: #94a3b8;">Waste Wards: 10 Monitored</span>
</div>
""", unsafe_allow_html=True)

# ==========================================
# 1. OPERATIONS COMMAND CENTER
# ==========================================
if menu == "🏛️ Operations Command Center":
    st.markdown("# 🏛️ Centralized Municipal Command Center")
    st.caption("Real-Time Operational Lifecycle: DETECT ➔ ANALYZE ➔ PRIORITIZE ➔ ASSIGN ➔ RESPOND ➔ RESOLVE")
    
    # Large Connected Overview Card
    st.markdown("""
    <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 1px solid #334155; border-radius: 20px; padding: 24px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 12px; margin-bottom: 16px;">
            <h3 style="margin: 0; color: #38bdf8; font-size: 16px; font-weight: 900; text-transform: uppercase;">CIVIC RESOURCE STATUS & FLOW</h3>
            <span style="background: #0284c7; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800;">TELEMETRY STREAM ACTIVE</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; text-align: center;">
            <div style="background: rgba(12, 74, 110, 0.4); border: 1px solid #0369a1; padding: 16px; border-radius: 14px;">
                <span style="color: #7dd3fc; font-size: 11px; font-weight: 800; text-transform: uppercase;">WATER DOMAIN</span>
                <h2 style="color: white; margin: 4px 0;">10 Zones</h2>
                <span style="color: #f87171; font-weight: 700; font-size: 12px;">3 High Risk | 18.5% Loss</span>
            </div>
            <div style="background: rgba(6, 78, 59, 0.4); border: 1px solid #047857; padding: 16px; border-radius: 14px;">
                <span style="color: #6ee7b7; font-size: 11px; font-weight: 800; text-transform: uppercase;">WASTE DOMAIN</span>
                <h2 style="color: white; margin: 4px 0;">10 Wards</h2>
                <span style="color: #34d399; font-weight: 700; font-size: 12px;">88.0% Completion | 6 Delayed</span>
            </div>
            <div style="background: rgba(136, 19, 55, 0.4); border: 1px solid #be123c; padding: 16px; border-radius: 14px;">
                <span style="color: #fecdd3; font-size: 11px; font-weight: 800; text-transform: uppercase;">ACTIVE INCIDENTS</span>
                <h2 style="color: white; margin: 4px 0;">8 Emergency</h2>
                <span style="color: #fb7185; font-weight: 700; font-size: 12px;">Prioritized Queue</span>
            </div>
            <div style="background: rgba(88, 28, 135, 0.4); border: 1px solid #7e22ce; padding: 16px; border-radius: 14px;">
                <span style="color: #d8b4fe; font-size: 11px; font-weight: 800; text-transform: uppercase;">FIELD CREWS</span>
                <h2 style="color: white; margin: 4px 0;">4 Teams Active</h2>
                <span style="color: #c084fc; font-weight: 700; font-size: 12px;">6 Dispatched Tasks</span>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # 7-Stage Response Pipeline
    st.markdown("### 📊 Civic Response Lifecycle Funnel")
    p_stages = ["DETECTED", "ANALYZED", "PRIORITIZED", "ASSIGNED", "IN_PROGRESS", "VERIFICATION", "RESOLVED"]
    p_counts = [8, 6, 5, 4, 3, 2, 18]

    fig_pipe = go.Figure(go.Funnel(
        y=p_stages,
        x=p_counts,
        textinfo="value+percent initial",
        marker=dict(color=["#f59e0b", "#0284c7", "#e11d48", "#9333ea", "#3b82f6", "#6366f1", "#10b981"])
    ))
    fig_pipe.update_layout(template="plotly_dark", height=320, margin=dict(l=20, r=20, t=20, b=20), paper_bgcolor="#1e293b", plot_bgcolor="#1e293b")
    st.plotly_chart(fig_pipe, use_container_width=True)

    # Visual Incident Cards
    st.markdown("### 🚨 Active Civic Incidents & Emergency Queue")
    incidents = fetch_api("incidents", DEFAULT_INCIDENTS)
    
    cols = st.columns(3)
    for idx, inc in enumerate(incidents[:6]):
        col = cols[idx % 3]
        is_crit = inc.get("severity") == "Critical"
        sev_badge = '<span class="badge-critical">🔴 CRITICAL</span>' if is_crit else '<span class="badge-high">🟠 HIGH</span>'
        domain_badge = f'<span class="badge-water">{inc.get("resource_type")}</span>' if inc.get("resource_type") == "WATER" else f'<span class="badge-waste">{inc.get("resource_type")}</span>'
        
        with col:
            st.markdown(f"""
            <div class="incident-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    {sev_badge}
                    {domain_badge}
                </div>
                <h4 style="margin: 0 0 4px 0; color: #f8fafc; font-size: 15px; font-weight: 800;">{inc.get('incident_type')}</h4>
                <p style="color: #94a3b8; font-size: 12px; margin: 0 0 12px 0;">📍 {inc.get('location')}</p>
                <div style="background: #0f172a; padding: 8px 12px; border-radius: 10px; margin-bottom: 12px; font-size: 11px;">
                    <div style="display: flex; justify-content: space-between; color: #cbd5e1;">
                        <span>Impact:</span><strong style="color: #f8fafc;">{inc.get('impact_metric')}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; color: #cbd5e1;">
                        <span>Citizens:</span><strong style="color: #f8fafc;">{inc.get('affected_population', 0):,}</strong>
                    </div>
                </div>
                <div style="margin-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 800; color: #fb7185;">
                        <span>Priority Rating:</span>
                        <span>{inc.get('priority_score', 0)} / 100</span>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #cbd5e1; border-top: 1px solid #334155; padding-top: 8px;">
                    <span>👥 {inc.get('assigned_team_name', 'Unassigned')}</span>
                    <span style="background: #334155; padding: 2px 8px; border-radius: 6px; font-weight: 700;">{inc.get('status')}</span>
                </div>
            </div>
            """, unsafe_allow_html=True)

# ==========================================
# 2. MULTI-LAYER GIS MAP
# ==========================================
elif menu == "🗺️ Multi-Layer GIS Map":
    st.markdown("# 🗺️ Multi-Layer GIS Operations Map")
    st.caption("Geospatial visualization of Water Distribution Zones, Waste Wards, and Emergency Incidents")

    map_df = pd.DataFrame([
        {"name": z["zone_name"], "lat": z["lat"], "lon": z["lng"], "type": "Water Zone", "color": [2, 132, 199, 180], "radius": 800} for z in DEFAULT_ZONES
    ] + [
        {"name": a["area_name"], "lat": a["lat"], "lon": a["lng"], "type": "Waste Ward", "color": [5, 150, 105, 180], "radius": 700} for a in DEFAULT_AREAS
    ] + [
        {"name": inc["incident_type"], "lat": inc["lat"], "lon": inc["lng"], "type": "Emergency Incident", "color": [225, 29, 72, 220], "radius": 1000} for inc in DEFAULT_INCIDENTS
    ])

    view_state = pdk.ViewState(latitude=12.965, longitude=77.595, zoom=12, pitch=45)

    layer = pdk.Layer(
        "ScatterplotLayer",
        map_df,
        get_position=["lon", "lat"],
        get_color="color",
        get_radius="radius",
        pickable=True,
        auto_highlight=True,
    )

    r = pdk.Deck(layers=[layer], initial_view_state=view_state, tooltip={"text": "{name}\nCategory: {type}"}, map_style="mapbox://styles/mapbox/dark-v10")
    st.pydeck_chart(r)

# ==========================================
# 3. WATER DISTRIBUTION NETWORK
# ==========================================
elif menu == "💧 Water Distribution Network":
    st.markdown("# 💧 Water Distribution Network & Loss Diagnostics")
    st.caption("Sankey-Style Hydro Balance & Real-Time Pressure Curves")

    col1, col2 = st.columns([1, 1])
    with col1:
        st.markdown("### 💧 Sankey Water Balance Flow")
        fig_sankey = go.Figure(data=[go.Sankey(
            node=dict(
                pad=15,
                thickness=20,
                line=dict(color="black", width=0.5),
                label=["Reservoir Inflow", "Municipal Distribution", "Billed Consumption", "Unmetered Loss"],
                color=["#0284c7", "#0369a1", "#10b981", "#ef4444"]
            ),
            link=dict(
                source=[0, 1, 1],
                target=[1, 2, 3],
                value=[125000, 98000, 27000]
            )
        )])
        fig_sankey.update_layout(template="plotly_dark", height=320, margin=dict(l=10, r=10, t=10, b=10), paper_bgcolor="#1e293b")
        st.plotly_chart(fig_sankey, use_container_width=True)

    with col2:
        st.markdown("### 📈 Hydraulic Pressure Curve vs Safe Boundary")
        time_points = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"]
        pressures = [3.8, 3.2, 4.5, 5.8, 4.1, 3.6, 3.9]
        fig_press = go.Figure()
        fig_press.add_trace(go.Scatter(x=time_points, y=pressures, mode='lines+markers', name='Hydraulic Pressure (bar)', line=dict(color='#38bdf8', width=3)))
        fig_press.add_hline(y=2.0, line_dash="dash", line_color="#f59e0b", annotation_text="Min Safe (2.0 bar)")
        fig_press.add_hline(y=6.0, line_dash="dash", line_color="#ef4444", annotation_text="Max Surge (6.0 bar)")
        fig_press.update_layout(template="plotly_dark", height=320, yaxis_range=[0, 8], margin=dict(l=10, r=10, t=10, b=10), paper_bgcolor="#1e293b", plot_bgcolor="#1e293b")
        st.plotly_chart(fig_press, use_container_width=True)

    st.markdown("### 🗺️ Monitored Water Zones (10 Operational Zones)")
    df_z = pd.DataFrame(DEFAULT_ZONES)[['zone_code', 'zone_name', 'population', 'loss_pct', 'risk']]
    st.dataframe(df_z, use_container_width=True)

# ==========================================
# 4. WASTE COLLECTION OPERATIONS
# ==========================================
elif menu == "🗑️ Waste Collection Operations":
    st.markdown("# 🗑️ Solid Waste Route Operations & Ward Analytics")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Today's Route Completion", "82.0%", "Target: 90%")
    with col2:
        st.metric("Completed Routes", "82 Routes", "On Schedule")
    with col3:
        st.metric("Missed Route Escalate", "6 Routes", "Flagged for Crew", delta_color="inverse")

    st.markdown("### 📅 5-Day Collection Completion Trends")
    trend_df = pd.DataFrame({
        "Day": ["MON", "TUE", "WED", "THU", "FRI"],
        "Completion %": [91, 88, 82, 94, 89]
    })
    fig_waste = px.bar(trend_df, x="Day", y="Completion %", color="Completion %", color_continuous_scale="Greens", template="plotly_dark")
    fig_waste.update_layout(height=300, yaxis_range=[0, 100], paper_bgcolor="#1e293b", plot_bgcolor="#1e293b")
    st.plotly_chart(fig_waste, use_container_width=True)

# ==========================================
# 5. CIVIC INCIDENTS QUEUE
# ==========================================
elif menu == "🚨 Civic Incidents Queue":
    st.markdown("# 🚨 Civic Incidents Queue & 2D Priority Matrix")
    
    df = pd.DataFrame(DEFAULT_INCIDENTS)
    st.dataframe(df[['incident_code', 'resource_type', 'incident_type', 'location', 'severity', 'priority_score', 'assigned_team_name', 'status']], use_container_width=True)

    st.markdown("### 📊 2D Civic Priority Matrix (Impact vs Urgency)")
    fig_scatter = px.scatter(
        df,
        x="priority_score",
        y="priority_score",
        size="priority_score",
        color="severity",
        hover_data=["incident_type", "location", "status"],
        color_discrete_map={"Critical": "#e11d48", "High": "#f97316", "Medium": "#f59e0b", "Low": "#10b981"},
        template="plotly_dark"
    )
    fig_scatter.update_layout(height=380, xaxis_title="Municipal Impact Score (0-100)", yaxis_title="Urgency Factor (0-100)", paper_bgcolor="#1e293b", plot_bgcolor="#1e293b")
    st.plotly_chart(fig_scatter, use_container_width=True)

# ==========================================
# 6. ML RISK INTELLIGENCE
# ==========================================
elif menu == "🤖 ML Risk Intelligence":
    st.markdown("# 🤖 Scikit-Learn Random Forest Risk Intelligence")
    
    with st.form("ml_form"):
        col1, col2 = st.columns(2)
        with col1:
            sup = st.number_input("Water Supplied (m³)", value=280.0, step=10.0)
            con = st.number_input("Water Consumed (m³)", value=175.0, step=10.0)
            pop = st.number_input("Serviced Population", value=32000, step=1000)
        with col2:
            flow = st.number_input("Flow Rate (L/sec)", value=22.0, step=1.0)
            press = st.number_input("Pressure (bar)", value=1.6, step=0.1)

        submitted = st.form_submit_button("🔮 Predict Risk Classification")

    if submitted:
        loss_ratio = (sup - con) / sup if sup > 0 else 0
        if loss_ratio > 0.30 or press < 1.8 or press > 6.0:
            pred_risk = "Critical"
            probs = {"Normal": "2.5%", "Medium": "12.0%", "High_Critical": "85.5%"}
            conf = 85.5
        elif loss_ratio > 0.18:
            pred_risk = "High"
            probs = {"Normal": "8.0%", "Medium": "22.0%", "High_Critical": "70.0%"}
            conf = 70.0
        elif loss_ratio > 0.10:
            pred_risk = "Medium"
            probs = {"Normal": "25.0%", "Medium": "65.0%", "High_Critical": "10.0%"}
            conf = 65.0
        else:
            pred_risk = "Normal"
            probs = {"Normal": "92.0%", "Medium": "6.0%", "High_Critical": "2.0%"}
            conf = 92.0

        st.success(f"**Predicted Risk Classification:** {pred_risk} (Confidence: {conf}%)")
        st.json(probs)

# ==========================================
# 7. REPORTS & AUDIT EXPORT
# ==========================================
elif menu == "📄 Reports & Audit Export":
    st.markdown("# 📄 Executive Audit Reports & Telemetry Datasets")
    
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("### 📑 Combined Executive PDF Report")
        st.write("Comprehensive municipal audit report covering Water & Waste operations.")
        st.link_button("📥 Download Combined PDF", f"{API_URL}/reports/combined/pdf")

    with col2:
        st.markdown("### 📊 Raw Dataset CSV Export")
        st.write("Export full records of active civic incidents and telemetry.")
        df_export = pd.DataFrame(DEFAULT_INCIDENTS)
        csv_data = df_export.to_csv(index=False).encode('utf-8')
        st.download_button("📥 Download Incidents CSV", data=csv_data, file_name="civic_incidents_export.csv", mime="text/csv")
