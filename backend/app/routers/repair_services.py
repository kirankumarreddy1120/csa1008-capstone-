from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.repair_service import RepairService
from app.models.water_zone import WaterZone
from app.models.waste_area import WasteArea
from app.schemas.repair_service import RepairServiceCreate, RepairServiceOut, NearbyServicesResponse
from app.services.distance_engine import calculate_haversine_distance

router = APIRouter(prefix="/repair-services", tags=["Repair Services Proximity Engine"])

@router.get("", response_model=dict)
def get_repair_services(db: Session = Depends(get_db)):
    services = db.query(RepairService).all()
    res = [RepairServiceOut.model_validate(s) for s in services]
    return {"success": True, "data": res}

@router.post("", response_model=dict)
def create_repair_service(service_in: RepairServiceCreate, db: Session = Depends(get_db)):
    s = RepairService(**service_in.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    return {"success": True, "data": RepairServiceOut.model_validate(s)}

@router.get("/nearby/{zone_or_area_id}", response_model=dict)
def get_nearby_repair_services(
    zone_or_area_id: int,
    radius_km: float = Query(10.0, description="Search radius in km (5, 10, 20, 50)"),
    domain: str = Query("water", description="Domain: water or waste"),
    db: Session = Depends(get_db)
):
    lat, lng, name = 12.9716, 77.5946, "Municipal District"
    if domain.lower() == "water":
        zone = db.query(WaterZone).filter(WaterZone.id == zone_or_area_id).first()
        if zone:
            lat, lng, name = zone.latitude, zone.longitude, zone.zone_name
    else:
        area = db.query(WasteArea).filter(WasteArea.id == zone_or_area_id).first()
        if area:
            lat, lng, name = area.latitude, area.longitude, area.area_name

    all_services = db.query(RepairService).filter(RepairService.status == "Active").all()
    nearby_list = []

    for s in all_services:
        dist = calculate_haversine_distance(lat, lng, s.latitude, s.longitude)
        if dist <= radius_km:
            s_dict = RepairServiceOut.model_validate(s).model_dump()
            s_dict["distance_km"] = dist
            nearby_list.append(s_dict)

    # Sort by Availability (Available > Busy > Unavailable) then by Distance (km ascending)
    avail_order = {"Available": 1, "Busy": 2, "Unavailable": 3}
    nearby_list.sort(key=lambda x: (avail_order.get(x["availability"], 99), x["distance_km"]))

    return {
        "success": True,
        "data": {
            "affected_zone_or_area": name,
            "latitude": lat,
            "longitude": lng,
            "search_radius_km": radius_km,
            "total_found": len(nearby_list),
            "repair_services": nearby_list
        }
    }
