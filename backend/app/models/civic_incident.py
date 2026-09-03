from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base

class CivicIncident(Base):
    __tablename__ = "civic_incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_code = Column(String, unique=True, index=True, nullable=False)
    resource_type = Column(String, nullable=False)  # WATER, WASTE
    incident_type = Column(String, nullable=False)
    # Water: Possible Leakage, Major Leakage, Low Pressure, High Pressure, Uneven Distribution
    # Waste: Missed Collection, Overflowing Waste, Collection Delay, Illegal Dumping, High Waste Accumulation
    location = Column(String, nullable=False)
    zone_or_area_id = Column(Integer, nullable=False)
    description = Column(String, nullable=False)
    severity = Column(String, default="Medium")  # Low, Medium, High, Critical
    priority_score = Column(Float, default=50.0)  # 0.0 to 100.0 computed priority
    status = Column(String, default="Detect")
    # Workflow Statuses: Detect, Analyze, Prioritize, Open, Service Assigned, Task Created, In Progress, Pending Verification, Resolved, Closed
    assigned_team_name = Column(String, nullable=True)
    assigned_team_id = Column(Integer, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    detected_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
