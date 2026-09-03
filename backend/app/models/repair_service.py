from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base

class RepairService(Base):
    __tablename__ = "repair_services"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String, nullable=False)
    contact_person = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=False)
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    service_area = Column(String, default="Municipal District")
    availability = Column(String, default="Available")  # Available, Busy, Unavailable
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)
