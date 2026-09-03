from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CivicIncidentCreate(BaseModel):
    resource_type: str  # WATER, WASTE
    incident_type: str
    location: str
    zone_or_area_id: int
    description: str
    severity: str = "Medium"  # Low, Medium, High, Critical
    assigned_team_id: Optional[int] = None
    latitude: float
    longitude: float

class CivicIncidentStatusUpdate(BaseModel):
    status: str
    assigned_team_id: Optional[int] = None

class CivicIncidentOut(BaseModel):
    id: int
    incident_code: str
    resource_type: str
    incident_type: str
    location: str
    zone_or_area_id: int
    description: str
    severity: str
    priority_score: float
    status: str
    assigned_team_name: Optional[str] = None
    assigned_team_id: Optional[int] = None
    latitude: float
    longitude: float
    detected_at: datetime
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
