from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TaskCreate(BaseModel):
    incident_id: int
    task_title: str
    description: str
    resource_type: str
    assigned_team_id: Optional[int] = None
    priority: str = "Medium"
    due_date: Optional[datetime] = None
    admin_notes: Optional[str] = None

class TaskStatusUpdate(BaseModel):
    status: str
    assigned_team_id: Optional[int] = None
    admin_notes: Optional[str] = None
    technician_notes: Optional[str] = None

class TaskOut(BaseModel):
    id: int
    task_code: str
    incident_id: int
    task_title: str
    description: str
    resource_type: str
    assigned_team_id: Optional[int] = None
    assigned_team_name: Optional[str] = None
    priority: str
    status: str
    due_date: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    admin_notes: Optional[str] = None
    technician_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
