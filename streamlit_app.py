import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import requests
import json

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
    .badge-critical { background-color: #fee2e2; color: #991b1b; }
    .badge-high { background-color: #ffedd5; color: #9a3412; }
    .badge-medium { background-color: #fef3c7; color: #92400e; }
    .badge-low { background-color: #e0f2fe; color: #075985; }
</style>
""", unsafe_allow_html=True)

# API Base URL
API_URL = "http://localhost:8000/api"

# Helper to fetch API data
def fetch_api(endpoint):
    try:
        res = requests.get(f"{API_URL}/{endpoint}", timeout=4)
        if res.status_code == 200:
            return res.json().get("data", None)
    except Exception:
        pass
    return None

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
    
    summary = fetch_api("dashboard/summary")
    kpi = summary.get("kpi", {}) if summary else {}
    flow = summary.get("flow", {}) if summary else {}

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
            delta=f"{flow.get('collection_completion_rate', 92.0)}% Completion"
        )
    with col3:
        st.metric(
            label="Active Civic Incidents",
            value=f"{flow.get('active_incidents_count', 7)} Incidents",
            delta="High Priority Queue"
        )
    with col4:
        st.metric(
            label="Active Field Teams",
            value=f"{flow.get('active_teams_count', 3)} Dispatched",
            delta=f"{flow.get('active_tasks_count', 5)} Open Tasks"
        )

    st.markdown("---")

    # Civic Response Pipeline
    st.subheader("📊 Civic Response Lifecycle Pipeline")
    pipeline = summary.get("pipeline_stages", {}) if summary else {}
    
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

    # Priority Feed
    st.subheader("🚨 Priority Incidents Feed")
    incidents = fetch_api("incidents") or []
    if incidents:
        df_inc = pd.DataFrame(incidents)[['incident_code', 'resource_type', 'incident_type', 'location', 'severity', 'priority_score', 'status']]
        st.dataframe(df_inc, use_container_width=True)
    else:
        st.info("All civic operations normal.")

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
    st.subheader("🗺️ Monitored Water Zones")
    zones = fetch_api("water/zones") or []
    if zones:
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

    st.subheader("🏙️ Monitored Waste Wards")
    areas = fetch_api("waste/areas") or []
    if areas:
        df_a = pd.DataFrame(areas)[['area_code', 'area_name', 'population', 'completion_rate', 'active_requests_count', 'status']]
        st.dataframe(df_a, use_container_width=True)

# ==========================================
# 4. CIVIC INCIDENTS QUEUE
# ==========================================
elif menu == "🚨 Civic Incidents Queue":
    st.title("🚨 Civic Incidents & Dynamic Priority Queue")
    st.caption("Common municipal operations workflow: Water & Waste incident triage and dispatch")

    incidents = fetch_api("incidents") or []
    if incidents:
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
    else:
        st.info("No active incidents logged.")

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
        try:
            res = requests.post(f"{API_URL}/analytics/predict", json={
                "supplied": sup, "consumed": con, "flow_rate": flow, "pressure": press, "population": pop
            }, timeout=4)
            if res.status_code == 200:
                data = res.json().get("data", {})
                st.success(f"**Predicted Risk Level:** {data.get('predicted_risk_level', 'High')} (Confidence: {data.get('confidence_percentage', 94.0)}%)")
                st.json(data.get("probabilities", {}))
        except Exception:
            loss_ratio = (sup - con) / sup if sup > 0 else 0
            risk = "Critical" if loss_ratio > 0.3 or press < 1.8 else ("Medium" if loss_ratio > 0.15 else "Normal")
            st.success(f"**Predicted Risk Level:** {risk} (Simulation Engine)")

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
        st.link_button("📥 Export Incidents CSV", f"{API_URL}/reports/incidents/csv")
