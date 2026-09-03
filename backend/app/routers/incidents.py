from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.models.civic_incident import CivicIncident
from app.models.team import Team
from app.schemas.civic_incident import CivicIncidentCreate, CivicIncidentStatusUpdate, CivicIncidentOut
from app.services.priority_engine import calculate_priority_score

router = APIRouter(prefix="/incidents", tags=["Civic Incident Management"])

@router.get("", response_model=dict)
def get_incidents(
    resource_type: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(CivicIncident)
    if resource_type:
        query = query.filter(CivicIncident.resource_type == resource_type.upper())
    if severity:
        query = query.filter(CivicIncident.severity == severity)
    if status:
        query = query.filter(CivicIncident.status == status)

    incidents = query.order_by(CivicIncident.priority_score.desc()).all()
    res = [CivicIncidentOut.model_validate(inc) for inc in incidents]
    return {"success": True, "data": res}

@router.post("", response_model=dict)
def create_incident(inc_in: CivicIncidentCreate, db: Session = Depends(get_db)):
    score = calculate_priority_score(
        resource_type=inc_in.resource_type,
        severity=inc_in.severity,
        population_affected=15000
    )
    inc_code = f"INC-{inc_in.resource_type[:3]}-{inc_in.zone_or_area_id:02d}-{int(datetime.utcnow().timestamp()) % 10000}"
    
    inc = CivicIncident(
        incident_code=inc_code,
        resource_type=inc_in.resource_type.upper(),
        incident_type=inc_in.incident_type,
        location=inc_in.location,
        zone_or_area_id=inc_in.zone_or_area_id,
        description=inc_in.description,
        severity=inc_in.severity,
        priority_score=score,
        status="Detect",
        assigned_team_id=inc_in.assigned_team_id,
        latitude=inc_in.latitude,
        longitude=inc_in.longitude
    )

    if inc_in.assigned_team_id:
        t = db.query(Team).filter(Team.id == inc_in.assigned_team_id).first()
        if t:
            inc.assigned_team_name = t.team_name

    db.add(inc)
    db.commit()
    db.refresh(inc)
    return {"success": True, "message": "Civic Incident created successfully", "data": CivicIncidentOut.model_validate(inc)}

@router.get("/{id}", response_model=dict)
def get_incident(id: int, db: Session = Depends(get_db)):
    inc = db.query(CivicIncident).filter(CivicIncident.id == id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    return {"success": True, "data": CivicIncidentOut.model_validate(inc)}

@router.put("/{id}/status", response_model=dict)
def update_incident_status(id: int, status_update: CivicIncidentStatusUpdate, db: Session = Depends(get_db)):
    inc = db.query(CivicIncident).filter(CivicIncident.id == id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    inc.status = status_update.status
    if status_update.assigned_team_id:
        inc.assigned_team_id = status_update.assigned_team_id
        t = db.query(Team).filter(Team.id == status_update.assigned_team_id).first()
        if t:
            inc.assigned_team_name = t.team_name

    if status_update.status in ["Resolved", "Closed"]:
        inc.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(inc)
    return {"success": True, "data": CivicIncidentOut.model_validate(inc)}
