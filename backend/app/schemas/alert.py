from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AlertOut(BaseModel):
    id: int
    resource_type: str
    incident_id: Optional[int] = None
    title: str
    message: str
    severity: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
