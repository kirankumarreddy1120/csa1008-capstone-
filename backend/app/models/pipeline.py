from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Pipeline(Base):
    __tablename__ = "pipelines"

    id = Column(Integer, primary_key=True, index=True)
    pipeline_name = Column(String, nullable=False)
    pipeline_code = Column(String, unique=True, index=True, nullable=False)
    zone_id = Column(Integer, ForeignKey("water_zones.id"), nullable=False)
    length = Column(Float, nullable=False)  # in km
    diameter = Column(Float, nullable=False)  # in mm
    status = Column(String, default="OPERATIONAL")  # OPERATIONAL, MAINTENANCE, BROKEN
    created_at = Column(DateTime, default=datetime.utcnow)

    zone = relationship("WaterZone", back_populates="pipelines")
    readings = relationship("WaterReading", back_populates="pipeline")
