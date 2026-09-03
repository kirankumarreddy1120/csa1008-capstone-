from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models.task import Task
from app.models.team import Team
from app.models.civic_incident import CivicIncident
from app.schemas.task import TaskCreate, TaskStatusUpdate, TaskOut

router = APIRouter(prefix="/tasks", tags=["Task Management"])

@router.get("", response_model=dict)
def get_tasks(resource_type: Optional[str] = None, status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Task)
    if resource_type:
        query = query.filter(Task.resource_type == resource_type.upper())
    if status:
        query = query.filter(Task.status == status)

    tasks = query.order_by(Task.created_at.desc()).all()
    res = []
    for t in tasks:
        t_dict = TaskOut.model_validate(t).model_dump()
        t_dict["assigned_team_name"] = t.assigned_team.team_name if t.assigned_team else "Unassigned"
        res.append(t_dict)

    return {"success": True, "data": res}

@router.post("", response_model=dict)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    code = f"TSK-{task_in.resource_type[:3]}-{task_in.incident_id:04d}"
    t = Task(
        task_code=code,
        incident_id=task_in.incident_id,
        task_title=task_in.task_title,
        description=task_in.description,
        resource_type=task_in.resource_type.upper(),
        assigned_team_id=task_in.assigned_team_id,
        priority=task_in.priority,
        status="Assigned" if task_in.assigned_team_id else "Pending",
        due_date=task_in.due_date or (datetime.utcnow() + datetime.timedelta(days=2)),
        admin_notes=task_in.admin_notes
    )
    db.add(t)
    
    # Update linked incident status
    inc = db.query(CivicIncident).filter(CivicIncident.id == task_in.incident_id).first()
    if inc:
        inc.status = "Task Created"
        if task_in.assigned_team_id:
            team = db.query(Team).filter(Team.id == task_in.assigned_team_id).first()
            if team:
                inc.assigned_team_name = team.team_name
                inc.assigned_team_id = team.id

    db.commit()
    db.refresh(t)
    
    t_out = TaskOut.model_validate(t).model_dump()
    t_out["assigned_team_name"] = t.assigned_team.team_name if t.assigned_team else "Unassigned"

    return {"success": True, "message": "Task created successfully", "data": t_out}

@router.put("/{id}/status", response_model=dict)
def update_task_status(id: int, status_update: TaskStatusUpdate, db: Session = Depends(get_db)):
    t = db.query(Task).filter(Task.id == id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")

    t.status = status_update.status
    if status_update.assigned_team_id:
        t.assigned_team_id = status_update.assigned_team_id
    if status_update.admin_notes:
        t.admin_notes = status_update.admin_notes
    if status_update.technician_notes:
        t.technician_notes = status_update.technician_notes

    if status_update.status == "In Progress" and not t.started_at:
        t.started_at = datetime.utcnow()
    elif status_update.status in ["Completed", "Verified", "Closed"]:
        t.completed_at = datetime.utcnow()
        # Update linked incident
        inc = db.query(CivicIncident).filter(CivicIncident.id == t.incident_id).first()
        if inc:
            inc.status = "Resolved" if status_update.status in ["Completed", "Verified"] else "Closed"

    db.commit()
    db.refresh(t)
    
    t_out = TaskOut.model_validate(t).model_dump()
    t_out["assigned_team_name"] = t.assigned_team.team_name if t.assigned_team else "Unassigned"

    return {"success": True, "data": t_out}
