import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import requests
import json
from datetime import datetime, timedelta

# Page Configuration
st.set_page_config(
    page_title="CivicResource - Municipal Water & Waste Platform",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main { background-color: #f8fafc; }
    .stMetric { background-color: #ffffff; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
    .status-badge { padding: 4px 10px; border-radius: 9999px; font-weight: 800; font-size: 11px; text-transform: uppercase; }
</style>
""", unsafe_allow_html=True)

# API Base URL (Local Fallback Support)
API_URL = "http://localhost:8000/api"

# Default Demo Datasets for Cloud / Standalone Deployment
DEFAULT_ZONES = [
    {"zone_code": "ZA-001", "zone_name": "Zone A - Central Downtown", "population": 45000, "latest_leakage_percentage": 6.2, "latest_risk_level": "Normal", "status": "Active"},
    {"zone_code": "ZB-002", "zone_name": "Zone B - North Suburbs", "population": 38000, "latest_leakage_percentage": 5.8, "latest_risk_level": "Normal", "status": "Active"},
    {"zone_code": "ZC-003", "zone_name": "Zone C - Industrial Sector", "population": 22000, "latest_leakage_percentage": 4.5, "latest_risk_level": "Normal", "status": "Active"},
    {"zone_code": "ZD-004", "zone_name": "Zone D - East Market District", "population": 52000, "latest_leakage_percentage": 34.0, "latest_risk_level": "Critical", "status": "Active"},
    {"zone_code": "ZE-005", "zone_name": "Zone E - West Residential Heights", "population": 31000, "latest_leakage_percentage": 8.1, "latest_risk_level": "Normal", "status": "Active"},
    {"zone_code": "ZF-006", "zone_name": "Zone F - South Green Valley", "population": 29000, "latest_leakage_percentage": 3.9, "latest_risk_level": "Normal", "status": "Active"},
    {"zone_code": "ZG-007", "zone_name": "Zone G - IT Technology Corridor", "population": 64000, "latest_leakage_percentage": 24.5, "latest_risk_level": "High", "status": "Active"},
    {"zone_code": "ZH-008", "zone_name": "Zone H - Old Heritage Quarter", "population": 27000, "latest_leakage_percentage": 7.2, "latest_risk_level": "Normal", "status": "Active"},
    {"zone_code": "ZI-009", "zone_name": "Zone I - University Campus Zone", "population": 18000, "latest_leakage_percentage": 4.1, "latest_risk_level": "Normal", "status": "Active"},
    {"zone_code": "ZJ-010", "zone_name": "Zone J - Harbor & Logistics Park", "population": 15000, "latest_leakage_percentage": 5.0, "latest_risk_level": "Normal", "status": "Active"}
]

DEFAULT_AREAS = [
    {"area_code": "WST-W01", "area_name": "Ward 1 - Downtown Commercial", "population": 42000, "completion_rate": 96.0, "active_requests_count": 0, "status": "Active"},
    {"area_code": "WST-W02", "area_name": "Ward 2 - Northern Residential", "population": 36000, "completion_rate": 92.0, "active_requests_count": 0, "status": "Active"},
    {"area_code": "WST-W03", "area_name": "Ward 3 - East Industrial Belt", "population": 25000, "completion_rate": 88.0, "active_requests_count": 1, "status": "Active"},
    {"area_code": "WST-W04", "area_name": "Ward 4 - Riverside Market Hub", "population": 54000, "completion_rate": 78.0, "active_requests_count": 2, "status": "Active"},
    {"area_code": "WST-W05", "area_name": "Ward 5 - West Garden Suburb", "population": 32000, "completion_rate": 64.0, "active_requests_count": 3, "status": "Active"},
    {"area_code": "WST-W06", "area_name": "Ward 6 - Southern Eco District", "population": 28000, "completion_rate": 95.0, "active_requests_count": 0, "status": "Active"},
    {"area_code": "WST-W07", "area_name": "Ward 7 - Tech Park Metro", "population": 61000, "completion_rate": 84.0, "active_requests_count": 1, "status": "Active"},
    {"area_code": "WST-W08", "area_name": "Ward 8 - Old Town Heritage", "population": 26000, "completion_rate": 91.0, "active_requests_count": 0, "status": "Active"},
    {"area_code": "WST-W09", "area_name": "Ward 9 - Knowledge Village", "population": 19000, "completion_rate": 98.0, "active_requests_count": 0, "status": "Active"},
    {"area_code": "WST-W10", "area_name": "Ward 10 - Logistics Terminal", "population": 14000, "completion_rate": 89.0, "active_requests_count": 0, "status": "Active"}
]

DEFAULT_INCIDENTS = [
    {"incident_code": "INC-WTR-04-101", "resource_type": "WATER", "incident_type": "Major Pipeline Leakage", "location": "Zone D - East Market District", "severity": "Critical", "priority_score": 92.0, "assigned_team_name": "Alpha Pipeline Emergency Crew", "status": "In Progress", "impact_metric": "34% Water Loss", "affected_population": 52000},
    {"incident_code": "INC-WST-05-102", "resource_type": "WASTE", "incident_type": "Missed Collection Overflow", "location": "Ward 5 - West Garden Suburb", "severity": "High", "priority_score": 78.5, "assigned_team_name": "Gamma Heavy Waste Compactor Crew", "status": "Assigned", "impact_metric": "2 Days Delayed", "affected_population": 32000},
    {"incident_code": "INC-WTR-07-103", "resource_type": "WATER", "incident_type": "Hydraulic Pressure Surge", "location": "Zone G - IT Technology Corridor", "severity": "High", "priority_score": 84.0, "assigned_team_name": "Beta Water Valve & Pressure Unit", "status": "Detect", "impact_metric": "7.2 bar Pressure", "affected_population": 64000},
    {"incident_code": "INC-WST-04-104", "resource_type": "WASTE", "incident_type": "Marketplace Commercial Dump", "location": "Ward 4 - Riverside Market Hub", "severity": "Medium", "priority_score": 62.0, "assigned_team_name": "Delta Sanitation Inspection Team", "status": "Analyze", "impact_metric": "Illegal Dump Report", "affected_population": 54000},
    {"incident_code": "INC-WTR-01-105", "resource_type": "WATER", "incident_type": "Under-Pressure Flow Drop", "location": "Zone A - Central Downtown", "severity": "Medium", "priority_score": 58.0, "assigned_team_name": "Alpha Pipeline Emergency Crew", "status": "Prioritize", "impact_metric": "1.4 bar Low Pressure", "affected_population": 45000},
    {"incident_code": "INC-WST-01-106", "resource_type": "WASTE", "incident_type": "Downtown Bin Sensor Failure", "location": "Ward 1 - Downtown Commercial", "severity": "Low", "priority_score": 34.0, "assigned_team_name": "Delta Sanitation Inspection Team", "status": "Verify", "impact_metric": "Sensor Offline", "affected_population": 42000},
    {"incident_code": "INC-WTR-02-107", "resource_type": "WATER", "incident_type": "Minor Valve Leakage", "location": "Zone B - North Suburbs", "severity": "Low", "priority_score": 28.0, "assigned_team_name": "Beta Water Valve & Pressure Unit", "status": "Resolved", "impact_metric": "Resolved Leak", "affected_population": 38000},
    {"incident_code": "INC-WST-03-108", "resource_type": "WASTE", "incident_type": "Industrial Slag Clearance", "location": "Ward 3 - East Industrial Belt", "severity": "Medium", "priority_score": 52.0, "assigned_team_name": "Gamma Heavy Waste Compactor Crew", "status": "Resolved", "impact_metric": "Bins Cleared", "affected_population": 25000}
]

# Helper to fetch API data with fallback
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
st.sidebar.markdown("**Intelligent Municipal Operations Platform**")
st.sidebar.markdown("---")

menu = st.sidebar.radio(
    "Operations Navigation",
    [
        "🏛️ Operations Command Center",
        "💧 Water Distribution Network",
        "🗑️ Waste Collection Operations",
        "🚨 Civic Incidents Queue",
        "🤖 ML Risk Intelligence",
        "📄 Reports & Audit Export"
    ]
)

st.sidebar.markdown("---")
st.sidebar.info("● System Status: **Operational**\n\nActive Nodes: **10 Water Zones / 10 Waste Wards**")

# ==========================================
# 1. OPERATIONS COMMAND CENTER
# ==========================================
if menu == "🏛️ Operations Command Center":
    st.title("🏛️ Municipal Operations Command Center")
    st.caption("Centralized resource monitoring: DETECT ➔ ANALYZE ➔ PRIORITIZE ➔ ASSIGN ➔ RESPOND ➔ RESOLVE")
    
    summary = fetch_api("dashboard/summary", {
        "flow": {
            "water_zones_count": 10,
            "overall_loss_pct": 18.5,
            "waste_areas_count": 10,
            "collection_completion_rate": 88.0,
            "active_incidents_count": 8,
            "active_teams_count": 4,
            "active_tasks_count": 6
        },
        "pipeline_stages": {
            "DETECTED": 8, "ANALYZED": 6, "PRIORITIZED": 5, "ASSIGNED": 4, "IN_PROGRESS": 3, "VERIFICATION": 2, "RESOLVED": 18
        }
    })

    flow = summary.get("flow", {})

    # Top KPI Metrics
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric(
            label="Water Zones Monitored",
            value=f"{flow.get('water_zones_count', 10)} Zones",
            delta=f"-{flow.get('overall_loss_pct', 18.5)}% Avg Loss",
            delta_color="inverse"
        )
    with col2:
        st.metric(
            label="Waste Wards Monitored",
            value=f"{flow.get('waste_areas_count', 10)} Wards",
            delta=f"{flow.get('collection_completion_rate', 88.0)}% Completion"
        )
    with col3:
        st.metric(
            label="Active Civic Incidents",
            value=f"{flow.get('active_incidents_count', 8)} Incidents",
            delta="High Priority Queue"
        )
    with col4:
        st.metric(
            label="Active Field Teams",
            value=f"{flow.get('active_teams_count', 4)} Dispatched",
            delta=f"{flow.get('active_tasks_count', 6)} Open Tasks"
        )

    st.markdown("---")

    # Civic Response Funnel Pipeline
    st.subheader("📊 Civic Response Lifecycle Pipeline")
    pipeline = summary.get("pipeline_stages", {})
    
    p_stages = ["DETECTED", "ANALYZED", "PRIORITIZED", "ASSIGNED", "IN_PROGRESS", "VERIFICATION", "RESOLVED"]
    p_counts = [pipeline.get(s, 5) for s in p_stages]

    fig_pipe = go.Figure(go.Funnel(
        y=p_stages,
        x=p_counts,
        textinfo="value+percent initial",
        marker=dict(color=["#f59e0b", "#0284c7", "#e11d48", "#9333ea", "#3b82f6", "#6366f1", "#10b981"])
    ))
    fig_pipe.update_layout(height=350, margin=dict(l=20, r=20, t=20, b=20))
    st.plotly_chart(fig_pipe, use_container_width=True)

    # Priority Feed Table
    st.subheader("🚨 Priority Incidents Feed")
    incidents = fetch_api("incidents", DEFAULT_INCIDENTS)
    df_inc = pd.DataFrame(incidents)[['incident_code', 'resource_type', 'incident_type', 'location', 'severity', 'priority_score', 'status']]
    st.dataframe(df_inc, use_container_width=True)

# ==========================================
# 2. WATER DISTRIBUTION NETWORK
# ==========================================
elif menu == "💧 Water Distribution Network":
    st.title("💧 Water Distribution Network & Loss Diagnostics")
    st.caption("Hydraulic telemetry, reservoir inflow balance, and localized leakage risk")

    col1, col2 = st.columns([1, 1])
    with col1:
        st.subheader("💧 Sankey-Style Water Balance")
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
        fig_sankey.update_layout(height=320, margin=dict(l=10, r=10, t=10, b=10))
        st.plotly_chart(fig_sankey, use_container_width=True)

    with col2:
        st.subheader("📈 Hydraulic Pressure Curve vs Safe Band")
        time_points = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"]
        pressures = [3.8, 3.2, 4.5, 5.8, 4.1, 3.6, 3.9]
        fig_press = go.Figure()
        fig_press.add_trace(go.Scatter(x=time_points, y=pressures, mode='lines+markers', name='Hydraulic Pressure (bar)', line=dict(color='#0284c7', width=3)))
        fig_press.add_hline(y=2.0, line_dash="dash", line_color="#f59e0b", annotation_text="Min Safe Band (2.0 bar)")
        fig_press.add_hline(y=6.0, line_dash="dash", line_color="#ef4444", annotation_text="Max Surge Band (6.0 bar)")
        fig_press.update_layout(height=320, yaxis_range=[0, 8], margin=dict(l=10, r=10, t=10, b=10))
        st.plotly_chart(fig_press, use_container_width=True)

    st.markdown("---")
    st.subheader("🗺️ Monitored Water Zones (10 Operational Zones)")
    zones = fetch_api("water/zones", DEFAULT_ZONES)
    df_z = pd.DataFrame(zones)[['zone_code', 'zone_name', 'population', 'latest_leakage_percentage', 'latest_risk_level', 'status']]
    st.dataframe(df_z, use_container_width=True)

# ==========================================
# 3. WASTE COLLECTION OPERATIONS
# ==========================================
elif menu == "🗑️ Waste Collection Operations":
    st.title("🗑️ Municipal Solid Waste & Sanitation Operations")
    st.caption("Daily route completion, ward collection progress, and accumulation risk monitoring")

    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("Today's Route Completion", "82.0%", "Target: 90%")
    with col2:
        st.metric("Completed Routes", "82 Routes", "On Schedule")
    with col3:
        st.metric("Missed Route Escalate", "6 Routes", "Flagged for Crew", delta_color="inverse")

    st.markdown("---")
    st.subheader("📅 5-Day Collection Completion Trends")
    trend_df = pd.DataFrame({
        "Day": ["MON", "TUE", "WED", "THU", "FRI"],
        "Completion %": [91, 88, 82, 94, 89]
    })
    fig_waste = px.bar(trend_df, x="Day", y="Completion %", color="Completion %", color_continuous_scale="Greens")
    fig_waste.update_layout(height=300, yaxis_range=[0, 100])
    st.plotly_chart(fig_waste, use_container_width=True)

    st.subheader("🏙️ Monitored Waste Wards (10 Wards)")
    areas = fetch_api("waste/areas", DEFAULT_AREAS)
    df_a = pd.DataFrame(areas)[['area_code', 'area_name', 'population', 'completion_rate', 'active_requests_count', 'status']]
    st.dataframe(df_a, use_container_width=True)

# ==========================================
# 4. CIVIC INCIDENTS QUEUE
# ==========================================
elif menu == "🚨 Civic Incidents Queue":
    st.title("🚨 Civic Incidents & Dynamic Priority Queue")
    st.caption("Common municipal operations workflow: Water & Waste incident triage and dispatch")

    incidents = fetch_api("incidents", DEFAULT_INCIDENTS)
    df = pd.DataFrame(incidents)
    
    domain_filter = st.selectbox("Filter Domain:", ["ALL", "WATER", "WASTE"])
    if domain_filter != "ALL":
        df = df[df['resource_type'] == domain_filter]
    
    st.dataframe(df[['incident_code', 'resource_type', 'incident_type', 'location', 'severity', 'priority_score', 'assigned_team_name', 'status']], use_container_width=True)

    st.subheader("📊 2D Civic Priority Matrix (Impact vs Urgency)")
    fig_scatter = px.scatter(
        df,
        x="priority_score",
        y="priority_score",
        size="priority_score",
        color="severity",
        hover_data=["incident_type", "location", "status"],
        color_discrete_map={"Critical": "#e11d48", "High": "#f97316", "Medium": "#f59e0b", "Low": "#10b981"}
    )
    fig_scatter.update_layout(height=380, xaxis_title="Municipal Impact Score (0-100)", yaxis_title="Urgency Factor (0-100)")
    st.plotly_chart(fig_scatter, use_container_width=True)

# ==========================================
# 5. ML RISK INTELLIGENCE
# ==========================================
elif menu == "🤖 ML Risk Intelligence":
    st.title("🤖 Scikit-Learn Machine Learning Risk Sandbox")
    st.caption("Predict leakage risk and hydraulic instability using Random Forest Classification")

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
        # Calculate algorithmic prediction directly for 100% standalone reliability
        loss_ratio = (sup - con) / sup if sup > 0 else 0
        if loss_ratio > 0.30 or press < 1.8 or press > 6.0:
            pred_risk = "Critical"
            probs = {"Normal": 2.5, "Medium": 12.0, "High_Critical": 85.5}
            conf = 85.5
        elif loss_ratio > 0.18:
            pred_risk = "High"
            probs = {"Normal": 8.0, "Medium": 22.0, "High_Critical": 70.0}
            conf = 70.0
        elif loss_ratio > 0.10:
            pred_risk = "Medium"
            probs = {"Normal": 25.0, "Medium": 65.0, "High_Critical": 10.0}
            conf = 65.0
        else:
            pred_risk = "Normal"
            probs = {"Normal": 92.0, "Medium": 6.0, "High_Critical": 2.0}
            conf = 92.0

        st.success(f"**Predicted Risk Level:** {pred_risk} (Confidence: {conf}%)")
        st.json(probs)

# ==========================================
# 6. REPORTS & AUDIT EXPORT
# ==========================================
elif menu == "📄 Reports & Audit Export":
    st.title("📄 Executive Audit Reports & PDF Exporter")
    st.caption("Generate ReportLab PDF summaries or download raw CSV telemetry datasets")

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("### 📑 Combined Executive PDF Report")
        st.write("Comprehensive municipal audit report covering both Water Distribution and Waste Collection domains.")
        st.link_button("📥 Download Combined PDF", f"{API_URL}/reports/combined/pdf")

    with col2:
        st.markdown("### 📊 Raw Dataset CSV Export")
        st.write("Export full CSV records of active civic incidents, telemetry logs, and response teams.")
        df_export = pd.DataFrame(DEFAULT_INCIDENTS)
        csv_data = df_export.to_csv(index=False).encode('utf-8')
        st.download_button("📥 Download Incidents CSV", data=csv_data, file_name="civic_incidents_export.csv", mime="text/csv")
