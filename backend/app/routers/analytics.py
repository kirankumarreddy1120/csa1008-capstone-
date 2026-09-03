from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.water_reading import WaterReading
from app.models.water_zone import WaterZone
from app.models.waste_area import WasteArea
from app.models.waste_schedule import WasteSchedule
from app.models.civic_incident import CivicIncident
from app.models.task import Task
from app.services.ml_service import ml_predictor

router = APIRouter(prefix="/analytics", tags=["Civic Analytics Suite"])

@router.get("/water", response_model=dict)
def get_water_analytics(db: Session = Depends(get_db)):
    readings = db.query(WaterReading).order_by(WaterReading.timestamp.desc()).limit(100).all()
    
    # Loss by Zone
    zones = db.query(WaterZone).all()
    loss_by_zone = []
    for z in zones:
        z_readings = [r for r in readings if r.zone_id == z.id]
        avg_loss = np_avg([max(0, r.water_supplied - r.water_consumed) for r in z_readings]) if z_readings else 0.0
        loss_by_zone.append({
            "zone_name": z.zone_name,
            "avg_loss_m3": round(avg_loss, 1)
        })

    # Timeline trends
    timeline = []
    for r in list(reversed(readings[:15])):
        loss = max(0, r.water_supplied - r.water_consumed)
        timeline.append({
            "time": r.timestamp.strftime("%H:%M"),
            "supplied": r.water_supplied,
            "consumed": r.water_consumed,
            "loss": loss
        })

    return {
        "success": True,
        "data": {
            "loss_by_zone": loss_by_zone,
            "timeline_trends": timeline
        }
    }

@router.get("/waste", response_model=dict)
def get_waste_analytics(db: Session = Depends(get_db)):
    areas = db.query(WasteArea).all()
    area_metrics = []
    for a in areas:
        schedules = db.query(WasteSchedule).filter(WasteSchedule.area_id == a.id).all()
        comp = len([s for s in schedules if s.status == "Completed"])
        rate = round((comp / len(schedules) * 100.0), 1) if schedules else 100.0
        area_metrics.append({
            "area_name": a.area_name,
            "completion_rate": rate,
            "total_schedules": len(schedules)
        })

    return {
        "success": True,
        "data": {
            "area_metrics": area_metrics
        }
    }

@router.get("/civic", response_model=dict)
def get_civic_analytics(db: Session = Depends(get_db)):
    total_water_inc = db.query(CivicIncident).filter(CivicIncident.resource_type == "WATER").count()
    total_waste_inc = db.query(CivicIncident).filter(CivicIncident.resource_type == "WASTE").count()
    
    resolved_count = db.query(CivicIncident).filter(CivicIncident.status.in_(["Resolved", "Closed"])).count()
    total_count = db.query(CivicIncident).count()
    resolution_rate = round((resolved_count / total_count * 100.0), 1) if total_count > 0 else 100.0

    severity_counts = {
        "Critical": db.query(CivicIncident).filter(CivicIncident.severity == "Critical").count(),
        "High": db.query(CivicIncident).filter(CivicIncident.severity == "High").count(),
        "Medium": db.query(CivicIncident).filter(CivicIncident.severity == "Medium").count(),
        "Low": db.query(CivicIncident).filter(CivicIncident.severity == "Low").count()
    }

    return {
        "success": True,
        "data": {
            "incidents_by_resource": [
                {"resource": "Water Distribution", "count": total_water_inc},
                {"resource": "Waste Collection", "count": total_waste_inc}
            ],
            "severity_distribution": severity_counts,
            "resolution_rate_pct": resolution_rate
        }
    }

@router.post("/predict-risk", response_model=dict)
def predict_risk(
    supplied: float = Query(250.0),
    consumed: float = Query(180.0),
    flow_rate: float = Query(20.0),
    pressure: float = Query(3.5),
    population: int = Query(25000)
):
    pred = ml_predictor.predict_risk(supplied, consumed, flow_rate, pressure, population)
    return {"success": True, "data": pred}

def np_avg(lst):
    return sum(lst) / len(lst) if lst else 0.0
