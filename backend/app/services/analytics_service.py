from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.water_reading import WaterReading
from app.models.water_zone import WaterZone
from app.models.pipeline import Pipeline
from app.models.waste_area import WasteArea
from app.models.waste_schedule import WasteSchedule
from app.models.waste_request import WasteRequest
from app.models.civic_incident import CivicIncident
from app.models.task import Task
from app.models.alert import Alert
from app.services.priority_engine import calculate_priority_score, get_priority_level

def process_water_reading_analytics(db: Session, reading: WaterReading):
    """
    Automated telemetry processor calculating water loss & leakage %,
    evaluating pressure boundaries, and triggering Civic Incidents + Alerts on High/Critical risk.
    """
    water_loss = max(0.0, reading.water_supplied - reading.water_consumed)
    leakage_pct = round((water_loss / reading.water_supplied * 100.0), 2) if reading.water_supplied > 0 else 0.0

    # Risk Classification
    if leakage_pct > 30.0:
        risk_level = "Critical"
    elif leakage_pct > 20.0:
        risk_level = "High"
    elif leakage_pct > 10.0:
        risk_level = "Medium"
    elif leakage_pct > 5.0:
        risk_level = "Low"
    else:
        risk_level = "Normal"

    # Auto-trigger Civic Incident on High or Critical leakage risk
    if risk_level in ["High", "Critical"]:
        zone = db.query(WaterZone).filter(WaterZone.id == reading.zone_id).first()
        pipe = db.query(Pipeline).filter(Pipeline.id == reading.pipeline_id).first()
        zone_name = zone.zone_name if zone else f"Zone {reading.zone_id}"
        pop = zone.population if zone else 10000

        priority_score = calculate_priority_score(
            resource_type="WATER",
            severity=risk_level,
            population_affected=pop,
            loss_or_delay_val=leakage_pct
        )

        existing_incident = db.query(CivicIncident).filter(
            CivicIncident.resource_type == "WATER",
            CivicIncident.zone_or_area_id == reading.zone_id,
            CivicIncident.status.notin_(["Closed", "Resolved"])
        ).first()

        if not existing_incident:
            inc_code = f"INC-WTR-{reading.zone_id:02d}-{int(datetime.utcnow().timestamp()) % 10000}"
            inc = CivicIncident(
                incident_code=inc_code,
                resource_type="WATER",
                incident_type="Major Leakage" if risk_level == "Critical" else "Possible Leakage",
                location=f"{zone_name} - Main Trunk Line #{reading.pipeline_id}",
                zone_or_area_id=reading.zone_id,
                description=f"Automated telemetry detected {leakage_pct}% water loss ({water_loss:.1f} m³ loss).",
                severity=risk_level,
                priority_score=priority_score,
                status="Detect",
                latitude=zone.latitude if zone else 12.9716,
                longitude=zone.longitude if zone else 77.5946,
                detected_at=datetime.utcnow()
            )
            db.add(inc)
            db.commit()
            db.refresh(inc)

            # Create Alert
            alert = Alert(
                resource_type="WATER",
                incident_id=inc.id,
                title=f"Water Leakage Alert: {zone_name}",
                message=f"Critical leakage risk of {leakage_pct}% detected. Priority Score: {priority_score}",
                severity=risk_level.upper(),
                is_read=False
            )
            db.add(alert)
            db.commit()

    return {
        "water_loss": water_loss,
        "leakage_percentage": leakage_pct,
        "risk_level": risk_level
    }
