from datetime import datetime
from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class WaterReading(Base):
    __tablename__ = "water_readings"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("water_zones.id"), nullable=False)
    pipeline_id = Column(Integer, ForeignKey("pipelines.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    water_supplied = Column(Float, nullable=False)  # in cubic meters
    water_consumed = Column(Float, nullable=False)  # in cubic meters
    flow_rate = Column(Float, nullable=False)  # liters/sec
    pressure = Column(Float, nullable=False)  # in bar
    created_at = Column(DateTime, default=datetime.utcnow)

    zone = relationship("WaterZone", back_populates="readings")
    pipeline = relationship("Pipeline", back_populates="readings")
