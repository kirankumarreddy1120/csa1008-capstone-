from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class WasteRequest(Base):
    __tablename__ = "waste_requests"

    id = Column(Integer, primary_key=True, index=True)
    area_id = Column(Integer, ForeignKey("waste_areas.id"), nullable=False)
    request_type = Column(String, nullable=False)  # Missed Collection, Overflowing Waste, Illegal Dumping Report, Collection Delay, General Waste Issue
    description = Column(String, nullable=False)
    priority = Column(String, default="Medium")  # Low, Medium, High, Critical
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String, default="Open")  # Open, Assigned, Resolved, Closed
    created_at = Column(DateTime, default=datetime.utcnow)

    area = relationship("WasteArea", back_populates="requests")
