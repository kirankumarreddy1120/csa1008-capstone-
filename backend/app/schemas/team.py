from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TeamCreate(BaseModel):
    team_name: str
    team_type: str
    contact_person: str
    phone: str
    service_area: str = "Municipal Wide"
    latitude: float
    longitude: float
    availability: str = "Available"
    status: str = "Active"

class TeamOut(TeamCreate):
    id: int
    created_at: datetime
    active_tasks_count: Optional[int] = 0

    class Config:
        from_attributes = True
