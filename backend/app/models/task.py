from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    task_code = Column(String, unique=True, index=True, nullable=False)
    incident_id = Column(Integer, ForeignKey("civic_incidents.id"), nullable=False)
    task_title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    resource_type = Column(String, nullable=False)  # WATER, WASTE
    assigned_team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    priority = Column(String, default="Medium")  # Low, Medium, High, Critical
    status = Column(String, default="Pending")
    # Task Statuses: Pending, Assigned, Accepted, In Progress, Completed, Verified, Closed
    due_date = Column(DateTime, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    admin_notes = Column(String, nullable=True)
    technician_notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("CivicIncident")
    assigned_team = relationship("Team")
