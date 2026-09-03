from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.waste_area import WasteArea
from app.models.waste_schedule import WasteSchedule
from app.models.waste_request import WasteRequest
from app.schemas.waste import WasteAreaCreate, WasteAreaOut, WasteScheduleCreate, WasteScheduleOut, WasteRequestCreate, WasteRequestOut

router = APIRouter(prefix="/waste", tags=["Waste Management"])

@router.get("/areas", response_model=dict)
def get_waste_areas(db: Session = Depends(get_db)):
    areas = db.query(WasteArea).all()
    res = []
    for a in areas:
        open_reqs = db.query(WasteRequest).filter(WasteRequest.area_id == a.id, WasteRequest.status != "Closed").count()
        schedules = db.query(WasteSchedule).filter(WasteSchedule.area_id == a.id).all()
        comp = len([s for s in schedules if s.status == "Completed"])
        rate = round((comp / len(schedules) * 100.0), 1) if schedules else 100.0
        
        a_dict = WasteAreaOut.model_validate(a).model_dump()
        a_dict["active_requests_count"] = open_reqs
        a_dict["completion_rate"] = rate
        res.append(a_dict)

    return {"success": True, "data": res}

@router.post("/areas", response_model=dict)
def create_waste_area(area_in: WasteAreaCreate, db: Session = Depends(get_db)):
    if db.query(WasteArea).filter(WasteArea.area_code == area_in.area_code).first():
        raise HTTPException(status_code=400, detail="Area code already exists")
    a = WasteArea(**area_in.model_dump())
    db.add(a)
    db.commit()
    db.refresh(a)
    return {"success": True, "data": WasteAreaOut.model_validate(a)}

@router.get("/schedules", response_model=dict)
def get_schedules(area_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(WasteSchedule)
    if area_id:
        query = query.filter(WasteSchedule.area_id == area_id)
    schedules = query.all()
    res = []
    for s in schedules:
        s_dict = WasteScheduleOut.model_validate(s).model_dump()
        s_dict["area_name"] = s.area.area_name if s.area else None
        s_dict["team_name"] = s.team.team_name if s.team else "Unassigned"
        res.append(s_dict)
    return {"success": True, "data": res}

@router.post("/schedules", response_model=dict)
def create_schedule(sch_in: WasteScheduleCreate, db: Session = Depends(get_db)):
    sch = WasteSchedule(**sch_in.model_dump())
    db.add(sch)
    db.commit()
    db.refresh(sch)
    return {"success": True, "data": WasteScheduleOut.model_validate(sch)}

@router.get("/requests", response_model=dict)
def get_waste_requests(db: Session = Depends(get_db)):
    reqs = db.query(WasteRequest).order_by(WasteRequest.created_at.desc()).all()
    res = []
    for r in reqs:
        r_dict = WasteRequestOut.model_validate(r).model_dump()
        r_dict["area_name"] = r.area.area_name if r.area else None
        res.append(r_dict)
    return {"success": True, "data": res}

@router.post("/requests", response_model=dict)
def create_waste_request(req_in: WasteRequestCreate, db: Session = Depends(get_db)):
    req = WasteRequest(**req_in.model_dump())
    db.add(req)
    db.commit()
    db.refresh(req)
    return {"success": True, "data": WasteRequestOut.model_validate(req)}
