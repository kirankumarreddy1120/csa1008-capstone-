from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class WaterZoneCreate(BaseModel):
    zone_name: str
    zone_code: str
    population: int = 10000
    latitude: float
    longitude: float
    status: str = "Active"

class WaterZoneOut(WaterZoneCreate):
    id: int
    created_at: datetime
    latest_leakage_percentage: Optional[float] = 0.0
    latest_risk_level: Optional[str] = "Normal"

    class Config:
        from_attributes = True

class PipelineCreate(BaseModel):
    pipeline_name: str
    pipeline_code: str
    zone_id: int
    length: float
    diameter: float
    status: str = "OPERATIONAL"

class PipelineOut(PipelineCreate):
    id: int
    created_at: datetime
    zone_name: Optional[str] = None

    class Config:
        from_attributes = True

class WaterReadingCreate(BaseModel):
    zone_id: int
    pipeline_id: int
    water_supplied: float
    water_consumed: float
    flow_rate: float
    pressure: float
    timestamp: Optional[datetime] = None

class WaterReadingOut(WaterReadingCreate):
    id: int
    created_at: datetime
    water_loss: Optional[float] = 0.0
    leakage_percentage: Optional[float] = 0.0
    risk_level: Optional[str] = "Normal"

    class Config:
        from_attributes = True
