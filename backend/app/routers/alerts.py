from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.alert import Alert
from app.schemas.alert import AlertOut

router = APIRouter(prefix="/alerts", tags=["Unified Alert Center"])

@router.get("", response_model=dict)
def get_alerts(resource_type: Optional[str] = None, severity: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Alert)
    if resource_type:
        query = query.filter(Alert.resource_type == resource_type.upper())
    if severity:
        query = query.filter(Alert.severity == severity.upper())

    alerts = query.order_by(Alert.created_at.desc()).all()
    res = [AlertOut.model_validate(a) for a in alerts]
    return {"success": True, "data": res}

@router.get("/unread-count", response_model=dict)
def get_unread_count(db: Session = Depends(get_db)):
    count = db.query(Alert).filter(Alert.is_read == False).count()
    return {"success": True, "data": {"unread_count": count}}

@router.put("/{id}/read", response_model=dict)
def mark_alert_read(id: int, db: Session = Depends(get_db)):
    a = db.query(Alert).filter(Alert.id == id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
    a.is_read = True
    db.commit()
    return {"success": True, "message": "Alert marked as read"}
