from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String, nullable=False)
    team_type = Column(String, nullable=False)
    # Types: Water Maintenance Team, Pipeline Repair Team, Waste Collection Team, Waste Inspection Team, General Civic Response Team
    contact_person = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    service_area = Column(String, default="Municipal Wide")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    availability = Column(String, default="Available")  # Available, Busy, Unavailable
    status = Column(String, default="Active")  # Active, Inactive
    created_at = Column(DateTime, default=datetime.utcnow)
