from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.water_zone import WaterZone
from app.models.pipeline import Pipeline
from app.models.water_reading import WaterReading
from app.schemas.water import WaterZoneCreate, WaterZoneOut, PipelineCreate, PipelineOut, WaterReadingCreate, WaterReadingOut
from app.services.analytics_service import process_water_reading_analytics

router = APIRouter(prefix="/water", tags=["Water Management"])

@router.get("/zones", response_model=dict)
def get_zones(db: Session = Depends(get_db)):
    zones = db.query(WaterZone).all()
    result = []
    for z in zones:
        latest_reading = db.query(WaterReading).filter(WaterReading.zone_id == z.id).order_by(WaterReading.timestamp.desc()).first()
        leakage = 0.0
        risk = "Normal"
        if latest_reading:
            loss = max(0.0, latest_reading.water_supplied - latest_reading.water_consumed)
            leakage = round((loss / latest_reading.water_supplied * 100.0), 2) if latest_reading.water_supplied > 0 else 0.0
            if leakage > 30: risk = "Critical"
            elif leakage > 20: risk = "High"
            elif leakage > 10: risk = "Medium"
            elif leakage > 5: risk = "Low"
        
        z_dict = WaterZoneOut.model_validate(z).model_dump()
        z_dict["latest_leakage_percentage"] = leakage
        z_dict["latest_risk_level"] = risk
        result.append(z_dict)

    return {"success": True, "message": "Water zones retrieved successfully", "data": result}

@router.post("/zones", response_model=dict)
def create_zone(zone_in: WaterZoneCreate, db: Session = Depends(get_db)):
    if db.query(WaterZone).filter(WaterZone.zone_code == zone_in.zone_code).first():
        raise HTTPException(status_code=400, detail="Zone code already exists")
    z = WaterZone(**zone_in.model_dump())
    db.add(z)
    db.commit()
    db.refresh(z)
    return {"success": True, "data": WaterZoneOut.model_validate(z)}

@router.get("/pipelines", response_model=dict)
def get_pipelines(db: Session = Depends(get_db)):
    pipelines = db.query(Pipeline).all()
    res = []
    for p in pipelines:
        p_dict = PipelineOut.model_validate(p).model_dump()
        p_dict["zone_name"] = p.zone.zone_name if p.zone else None
        res.append(p_dict)
    return {"success": True, "data": res}

@router.post("/readings", response_model=dict)
def create_reading(reading_in: WaterReadingCreate, db: Session = Depends(get_db)):
    r = WaterReading(**reading_in.model_dump())
    db.add(r)
    db.commit()
    db.refresh(r)

    # Process analytics & auto trigger civic incidents
    proc = process_water_reading_analytics(db, r)
    
    r_out = WaterReadingOut.model_validate(r).model_dump()
    r_out["water_loss"] = proc["water_loss"]
    r_out["leakage_percentage"] = proc["leakage_percentage"]
    r_out["risk_level"] = proc["risk_level"]

    return {"success": True, "message": "Water reading created and analytics processed", "data": r_out}

@router.get("/readings", response_model=dict)
def get_readings(zone_id: Optional[int] = None, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(WaterReading)
    if zone_id:
        query = query.filter(WaterReading.zone_id == zone_id)
    readings = query.order_by(WaterReading.timestamp.desc()).limit(limit).all()
    
    res = []
    for r in readings:
        loss = max(0.0, r.water_supplied - r.water_consumed)
        pct = round((loss / r.water_supplied * 100.0), 2) if r.water_supplied > 0 else 0.0
        risk = "Critical" if pct > 30 else ("High" if pct > 20 else ("Medium" if pct > 10 else ("Low" if pct > 5 else "Normal")))
        r_dict = WaterReadingOut.model_validate(r).model_dump()
        r_dict["water_loss"] = loss
        r_dict["leakage_percentage"] = pct
        r_dict["risk_level"] = risk
        res.append(r_dict)

    return {"success": True, "data": res}

@router.get("/pressure/history/{zone_id}", response_model=dict)
def get_pressure_history(zone_id: int, db: Session = Depends(get_db)):
    readings = db.query(WaterReading).filter(WaterReading.zone_id == zone_id).order_by(WaterReading.timestamp.asc()).limit(30).all()
    history = [
        {
            "timestamp": r.timestamp.strftime("%H:%M"),
            "pressure": r.pressure,
            "min_normal": 2.0,
            "max_normal": 6.0
        } for r in readings
    ]
    return {"success": True, "data": history}
