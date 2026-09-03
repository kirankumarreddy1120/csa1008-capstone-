from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class WasteArea(Base):
    __tablename__ = "waste_areas"

    id = Column(Integer, primary_key=True, index=True)
    area_name = Column(String, nullable=False)
    area_code = Column(String, unique=True, index=True, nullable=False)
    population = Column(Integer, default=15000)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String, default="Active")  # Active, Inactive
    created_at = Column(DateTime, default=datetime.utcnow)

    schedules = relationship("WasteSchedule", back_populates="area", cascade="all, delete-orphan")
    requests = relationship("WasteRequest", back_populates="area", cascade="all, delete-orphan")
