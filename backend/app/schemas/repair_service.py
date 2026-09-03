from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class RepairServiceCreate(BaseModel):
    service_name: str
    contact_person: str
    phone: str
    email: EmailStr
    address: str
    latitude: float
    longitude: float
    service_area: str = "Municipal District"
    availability: str = "Available"
    status: str = "Active"

class RepairServiceOut(RepairServiceCreate):
    id: int
    created_at: datetime
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True

class NearbyServicesResponse(BaseModel):
    affected_zone_or_area: str
    latitude: float
    longitude: float
    search_radius_km: float
    total_found: int
    repair_services: List[RepairServiceOut]
