from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class WasteAreaCreate(BaseModel):
    area_name: str
    area_code: str
    population: int = 15000
    latitude: float
    longitude: float
    status: str = "Active"

class WasteAreaOut(WasteAreaCreate):
    id: int
    created_at: datetime
    active_requests_count: Optional[int] = 0
    completion_rate: Optional[float] = 100.0

    class Config:
        from_attributes = True

class WasteScheduleCreate(BaseModel):
    area_id: int
    collection_date: str
    collection_time: str = "08:00 AM"
    waste_type: str = "Organic & Recyclable"
    assigned_team_id: Optional[int] = None
    status: str = "Scheduled"

class WasteScheduleOut(WasteScheduleCreate):
    id: int
    created_at: datetime
    area_name: Optional[str] = None
    team_name: Optional[str] = None

    class Config:
        from_attributes = True

class WasteRequestCreate(BaseModel):
    area_id: int
    request_type: str
    description: str
    priority: str = "Medium"
    latitude: float
    longitude: float

class WasteRequestOut(WasteRequestCreate):
    id: int
    status: str
    created_at: datetime
    area_name: Optional[str] = None

    class Config:
        from_attributes = True
