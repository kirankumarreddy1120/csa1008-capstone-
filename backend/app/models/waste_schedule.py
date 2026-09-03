from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class WasteSchedule(Base):
    __tablename__ = "waste_schedules"

    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("waste_areas.id"), nullable=False)
    collection_date = Column(String, nullable=False)  # YYYY-MM-DD
    collection_time = Column(String, default="08:00 AM")
    waste_type = Column(String, default="Organic & Recyclable")  # Organic, Recyclable, Hazardous, General
    assigned_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    status = Column(String, default="Scheduled")  # Scheduled, Assigned, In Progress, Completed, Missed, Cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    area = relationship("WasteArea", back_populates="schedules")
    team = relationship("Team")
