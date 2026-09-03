from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class WaterZone(Base):
    __tablename__ = "water_zones"

    id = Column(Integer, primary_key=True, index=True)
    zone_name = Column(String, nullable=False)
    zone_code = Column(String, unique=True, index=True, nullable=False)
    population = Column(Integer, default=10000)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(String, default="Active")  # Active, Maintenance, Inactive
    created_at = Column(DateTime, default=datetime.utcnow)

    pipelines = relationship("Pipeline", back_populates="zone", cascade="all, delete-orphan")
    readings = relationship("WaterReading", back_populates="zone", cascade="all, delete-orphan")
