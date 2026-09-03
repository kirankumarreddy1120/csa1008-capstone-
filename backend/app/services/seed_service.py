import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.water_zone import WaterZone
from app.models.pipeline import Pipeline
from app.models.water_reading import WaterReading
from app.models.waste_area import WasteArea
from app.models.waste_schedule import WasteSchedule
from app.models.waste_request import WasteRequest
from app.models.civic_incident import CivicIncident
from app.models.task import Task
from app.models.team import Team
from app.models.repair_service import RepairService
from app.models.alert import Alert
from app.utils.security import get_password_hash
from app.services.priority_engine import calculate_priority_score
from app.services.analytics_service import process_water_reading_analytics

def seed_database(db: Session):
    print("Clearing existing database records...")
    db.query(Alert).delete()
    db.query(Task).delete()
    db.query(CivicIncident).delete()
    db.query(WasteRequest).delete()
    db.query(WasteSchedule).delete()
    db.query(WaterReading).delete()
    db.query(Pipeline).delete()
    db.query(WaterZone).delete()
    db.query(WasteArea).delete()
    db.query(Team).delete()
    db.query(RepairService).delete()
    db.query(User).delete()
    db.commit()

    print("Seeding Users...")
    admin = User(
        email="admin@civicresource.gov",
        full_name="Municipal Administrator",
        password_hash=get_password_hash("Admin@123"),
        role="ADMIN"
    )
    operator = User(
        email="operator@civicresource.gov",
        full_name="Civic Operations Officer",
        password_hash=get_password_hash("Operator@123"),
        role="OPERATOR"
    )
    db.add(admin)
    db.add(operator)
    db.commit()

    print("Seeding 10 Water Zones...")
    water_zones_data = [
        {"name": "Zone A - Central Downtown", "code": "ZA-001", "pop": 45000, "lat": 12.9716, "lng": 77.5946},
        {"name": "Zone B - North Suburbs", "code": "ZB-002", "pop": 38000, "lat": 12.9850, "lng": 77.6050},
        {"name": "Zone C - Industrial Sector", "code": "ZC-003", "pop": 22000, "lat": 12.9600, "lng": 77.5800},
        {"name": "Zone D - East Market District", "code": "ZD-004", "pop": 52000, "lat": 12.9780, "lng": 77.6200},
        {"name": "Zone E - West Residential Heights", "code": "ZE-005", "pop": 31000, "lat": 12.9550, "lng": 77.5700},
        {"name": "Zone F - South Green Valley", "code": "ZF-006", "pop": 29000, "lat": 12.9400, "lng": 77.5900},
        {"name": "Zone G - IT Technology Corridor", "code": "ZG-007", "pop": 64000, "lat": 12.9350, "lng": 77.6100},
        {"name": "Zone H - Old Heritage Quarter", "code": "ZH-008", "pop": 27000, "lat": 12.9650, "lng": 77.6150},
        {"name": "Zone I - University Campus Zone", "code": "ZI-009", "pop": 18000, "lat": 12.9500, "lng": 77.5600},
        {"name": "Zone J - Harbor & Logistics Park", "code": "ZJ-010", "pop": 15000, "lat": 12.9900, "lng": 77.6350}
    ]

    zones = []
    for zd in water_zones_data:
        z = WaterZone(
            zone_name=zd["name"],
            zone_code=zd["code"],
            population=zd["pop"],
            latitude=zd["lat"],
            longitude=zd["lng"],
            status="Active"
        )
        db.add(z)
        zones.append(z)
    db.commit()

    print("Seeding Pipelines (20 Trunk Pipelines)...")
    pipelines = []
    for z in zones:
        p1 = Pipeline(
            pipeline_name=f"Main Trunk {z.zone_code}-A",
            pipeline_code=f"PL-{z.zone_code}-01",
            zone_id=z.id,
            diameter=450.0,
            length=2.4,
            status="OPERATIONAL"
        )
        p2 = Pipeline(
            pipeline_name=f"Secondary Line {z.zone_code}-B",
            pipeline_code=f"PL-{z.zone_code}-02",
            zone_id=z.id,
            diameter=300.0,
            length=1.8,
            status="OPERATIONAL"
        )
        db.add(p1)
        db.add(p2)
        pipelines.extend([p1, p2])
    db.commit()

    print("Seeding 10 Waste Areas/Wards...")
    waste_areas_data = [
        {"name": "Ward 1 - Downtown Commercial", "code": "WST-W01", "pop": 42000, "lat": 12.9720, "lng": 77.5950},
        {"name": "Ward 2 - Northern Residential", "code": "WST-W02", "pop": 36000, "lat": 12.9860, "lng": 77.6040},
        {"name": "Ward 3 - East Industrial Belt", "code": "WST-W03", "pop": 25000, "lat": 12.9610, "lng": 77.5810},
        {"name": "Ward 4 - Riverside Market Hub", "code": "WST-W04", "pop": 54000, "lat": 12.9790, "lng": 77.6210},
        {"name": "Ward 5 - West Garden Suburb", "code": "WST-W05", "pop": 32000, "lat": 12.9560, "lng": 77.5710},
        {"name": "Ward 6 - Southern Eco District", "code": "WST-W06", "pop": 28000, "lat": 12.9410, "lng": 77.5910},
        {"name": "Ward 7 - Tech Park Metro", "code": "WST-W07", "pop": 61000, "lat": 12.9360, "lng": 77.6110},
        {"name": "Ward 8 - Old Town Heritage", "code": "WST-W08", "pop": 26000, "lat": 12.9660, "lng": 77.6160},
        {"name": "Ward 9 - Knowledge Village", "code": "WST-W09", "pop": 19000, "lat": 12.9510, "lng": 77.5610},
        {"name": "Ward 10 - Logistics Terminal", "code": "WST-W10", "pop": 14000, "lat": 12.9910, "lng": 77.6360}
    ]

    areas = []
    for ad in waste_areas_data:
        a = WasteArea(
            area_name=ad["name"],
            area_code=ad["code"],
            population=ad["pop"],
            latitude=ad["lat"],
            longitude=ad["lng"],
            status="Active"
        )
        db.add(a)
        areas.append(a)
    db.commit()

    print("Seeding Municipal Response Teams...")
    teams_data = [
        {"name": "Alpha Pipeline Emergency Crew", "type": "Pipeline Repair Team", "contact": "Rajesh Kumar", "phone": "+91-9876543210", "lat": 12.9710, "lng": 77.5940, "avail": "Busy"},
        {"name": "Beta Water Valve & Pressure Unit", "type": "Water Maintenance Team", "contact": "Suresh Nair", "phone": "+91-9876543211", "lat": 12.9800, "lng": 77.6100, "avail": "Available"},
        {"name": "Gamma Heavy Waste Compactor Crew", "type": "Waste Collection Team", "contact": "Manish Rao", "phone": "+91-9876543212", "lat": 12.9500, "lng": 77.5800, "avail": "Busy"},
        {"name": "Delta Sanitation Inspection Team", "type": "Waste Inspection Team", "contact": "Ananya Sen", "phone": "+91-9876543213", "lat": 12.9400, "lng": 77.6000, "avail": "Available"},
        {"name": "Epsilon Rapid Civic Response Taskforce", "type": "General Civic Response Team", "contact": "Vikram Patil", "phone": "+91-9876543214", "lat": 12.9650, "lng": 77.5750, "avail": "Available"}
    ]

    teams = []
    for td in teams_data:
        t = Team(
            team_name=td["name"],
            team_type=td["type"],
            contact_person=td["contact"],
            phone=td["phone"],
            latitude=td["lat"],
            longitude=td["lng"],
            service_area="Municipal District",
            availability=td["avail"],
            status="Active"
        )
        db.add(t)
        teams.append(t)
    db.commit()

    print("Seeding 10 Registered Local Repair Services...")
    services_data = [
        {"name": "AquaFix Fast Response Services", "contact": "Kiran Sharma", "phone": "+91-9845012345", "email": "contact@aquafix.in", "address": "12 Richmond Town Main Rd, Zone A", "lat": 12.9680, "lng": 77.5980, "avail": "Available"},
        {"name": "Apex Hydrotech Plumbing Solutions", "contact": "Ramesh Gowda", "phone": "+91-9741098765", "email": "apex@hydrotech.com", "address": "88 Malleswaram 7th Cross, Zone B", "lat": 12.9880, "lng": 77.6010, "avail": "Available"},
        {"name": "CityWide Emergency Pipeline Contractors", "contact": "Naveen Reddy", "phone": "+91-9632012345", "email": "citywide@pipeline.co", "address": "45 Industrial Layout, Zone C", "lat": 12.9580, "lng": 77.5830, "avail": "Busy"},
        {"name": "BlueWave Flow & Leakage Repair Co.", "contact": "Praveen Jain", "phone": "+91-9523098765", "email": "info@bluewaveflow.in", "address": "19 Indiranagar 100ft Rd, Zone D", "lat": 12.9750, "lng": 77.6250, "avail": "Available"},
        {"name": "Precision Waterworks Specialists", "contact": "Venkatesh Babu", "phone": "+91-9412012345", "email": "precision@waterworks.in", "address": "104 Basavanagudi Ring Rd, Zone E", "lat": 12.9520, "lng": 77.5730, "avail": "Available"},
        {"name": "GreenLeaf Municipal & Sewerage Services", "contact": "Kavita Pillai", "phone": "+91-9988776655", "email": "greenleaf@sewercare.in", "address": "22 Jayanagar 4th Block, Zone F", "lat": 12.9380, "lng": 77.5930, "avail": "Available"},
        {"name": "Metro Tech Hydraulic Solutions", "contact": "Priya Verma", "phone": "+91-9321098765", "email": "support@techhydraulic.com", "address": "301 Tech Hub Sector 4, Zone G", "lat": 12.9320, "lng": 77.6120, "avail": "Busy"},
        {"name": "Old Town Heritage Plumbers", "contact": "Amitabh Das", "phone": "+91-9210987654", "email": "das@oldtownplumbing.in", "address": "5 Fort Cross Street, Zone H", "lat": 12.9620, "lng": 77.6180, "avail": "Available"},
        {"name": "University Heights Pipe Works", "contact": "Deepak Joshi", "phone": "+91-9109876543", "email": "deepak@uniworks.in", "address": "77 Campus Link Road, Zone I", "lat": 12.9520, "lng": 77.5620, "avail": "Available"},
        {"name": "Harbor Port Utility Responders", "contact": "Sunil Hegde", "phone": "+91-9098765432", "email": "hegde@harborwater.in", "address": "9 Dockyard Expressway, Zone J", "lat": 12.9870, "lng": 77.6380, "avail": "Unavailable"}
    ]

    for sd in services_data:
        s = RepairService(
            service_name=sd["name"],
            contact_person=sd["contact"],
            phone=sd["phone"],
            email=sd["email"],
            address=sd["address"],
            latitude=sd["lat"],
            longitude=sd["lng"],
            service_area="Municipal District",
            availability=sd["avail"],
            status="Active"
        )
        db.add(s)
    db.commit()

    print("Seeding 1000+ Water Readings...")
    now = datetime.utcnow()
    readings = []
    
    for z in zones:
        z_pipes = [p for p in pipelines if p.zone_id == z.id]
        
        for hour_offset in range(105, 0, -1):
            ts = now - timedelta(hours=hour_offset * 3)
            pipe = random.choice(z_pipes)
            base_sup = 180.0 + (z.population / 1000.0) * 4.0 + 30.0 * random.random()
            
            if hour_offset in [10, 30]:
                press = 1.5
            elif hour_offset in [20, 50]:
                press = 1.8
            elif hour_offset in [40, 70]:
                press = 6.5
            elif hour_offset in [60, 90]:
                press = 7.0
            else:
                press = random.uniform(2.2, 5.8)

            if z.id == 4: # High leakage zone
                loss_ratio = random.uniform(0.25, 0.38)
            elif z.id == 7: # Critical leakage
                loss_ratio = random.uniform(0.32, 0.48)
            else:
                loss_ratio = random.uniform(0.01, 0.07)

            sup = round(base_sup, 2)
            con = round(sup * (1.0 - loss_ratio), 2)
            flow = round(sup / 12.0 + random.uniform(-0.5, 0.5), 2)

            r = WaterReading(
                zone_id=z.id,
                pipeline_id=pipe.id,
                timestamp=ts,
                water_supplied=sup,
                water_consumed=con,
                flow_rate=max(0.5, flow),
                pressure=round(press, 2)
            )
            db.add(r)
            readings.append(r)
            
    db.commit()
    print(f"Created {len(readings)} water readings.")

    print("Seeding Comprehensive 12 Civic Incidents across all stages...")
    incidents_seed = [
        {
            "code": "INC-WTR-04-101",
            "type": "WATER",
            "title": "Major Pipeline Leakage",
            "loc": "Zone D - East Market District",
            "zid": 4,
            "desc": "Automated telemetry detected 34% unmetered water loss with localized pressure drop.",
            "sev": "Critical",
            "score": 92.0,
            "status": "In Progress",
            "team_id": teams[0].id,
            "lat": 12.9780,
            "lng": 77.6200
        },
        {
            "code": "INC-WST-05-102",
            "type": "WASTE",
            "title": "Missed Collection Overflow",
            "loc": "Ward 5 - West Garden Suburb",
            "zid": 5,
            "desc": "High waste accumulation reported: 2 days collection delay in community bins.",
            "sev": "High",
            "score": 78.5,
            "status": "Assigned",
            "team_id": teams[2].id,
            "lat": 12.9560,
            "lng": 77.5710
        },
        {
            "code": "INC-WTR-07-103",
            "type": "WATER",
            "title": "Hydraulic Pressure Surge",
            "loc": "Zone G - IT Technology Corridor",
            "zid": 7,
            "desc": "Sensor pressure spikes exceeding 7.2 bar threatening secondary junction joints.",
            "sev": "High",
            "score": 84.0,
            "status": "Detect",
            "team_id": teams[1].id,
            "lat": 12.9350,
            "lng": 77.6100
        },
        {
            "code": "INC-WST-04-104",
            "type": "WASTE",
            "title": "Marketplace Commercial Dump",
            "loc": "Ward 4 - Riverside Market Hub",
            "zid": 4,
            "desc": "Citizen reports of illegal commercial waste dumping along riverside boardwalk.",
            "sev": "Medium",
            "score": 62.0,
            "status": "Analyze",
            "team_id": teams[3].id,
            "lat": 12.9790,
            "lng": 77.6210
        },
        {
            "code": "INC-WTR-01-105",
            "type": "WATER",
            "title": "Under-Pressure Flow Drop",
            "loc": "Zone A - Central Downtown",
            "zid": 1,
            "desc": "Pressure fallen to 1.4 bar near Central Metro station line.",
            "sev": "Medium",
            "score": 58.0,
            "status": "Prioritize",
            "team_id": teams[0].id,
            "lat": 12.9716,
            "lng": 77.5946
        },
        {
            "code": "INC-WST-01-106",
            "type": "WASTE",
            "title": "Downtown Bin Sensor Failure",
            "loc": "Ward 1 - Downtown Commercial",
            "zid": 1,
            "desc": "Telemetry sensor battery depleted on high-density pedestrian street bins.",
            "sev": "Low",
            "score": 34.0,
            "status": "Verify",
            "team_id": teams[3].id,
            "lat": 12.9720,
            "lng": 77.5950
        },
        {
            "code": "INC-WTR-02-107",
            "type": "WATER",
            "title": "Minor Valve Leakage",
            "loc": "Zone B - North Suburbs",
            "zid": 2,
            "desc": "Gasket wear detected during scheduled pressure inspection.",
            "sev": "Low",
            "score": 28.0,
            "status": "Resolved",
            "team_id": teams[1].id,
            "lat": 12.9850,
            "lng": 77.6050
        },
        {
            "code": "INC-WST-03-108",
            "type": "WASTE",
            "title": "Industrial Slag Clearance",
            "loc": "Ward 3 - East Industrial Belt",
            "zid": 3,
            "desc": "Bulk scrap metal containers successfully cleared by heavy compactor.",
            "sev": "Medium",
            "score": 52.0,
            "status": "Resolved",
            "team_id": teams[2].id,
            "lat": 12.9610,
            "lng": 77.5810
        },
        {
            "code": "INC-WTR-03-109",
            "type": "WATER",
            "title": "Trunk Line Hydro Fracture",
            "loc": "Zone C - Industrial Sector",
            "zid": 3,
            "desc": "Replaced 12m fractured ductile iron pipe section and normalized flow rate.",
            "sev": "High",
            "score": 81.0,
            "status": "Closed",
            "team_id": teams[0].id,
            "lat": 12.9600,
            "lng": 77.5800
        },
        {
            "code": "INC-WST-08-110",
            "type": "WASTE",
            "title": "Heritage Quarter Cleanup",
            "loc": "Ward 8 - Old Town Heritage",
            "zid": 8,
            "desc": "Weekly organic waste recycling cycle completed on time.",
            "sev": "Low",
            "score": 25.0,
            "status": "Closed",
            "team_id": teams[4].id,
            "lat": 12.9660,
            "lng": 77.6160
        },
        {
            "code": "INC-WTR-05-111",
            "type": "WATER",
            "title": "Residential Sump Overfill",
            "loc": "Zone E - West Residential Heights",
            "zid": 5,
            "desc": "Inlet valve adjusted to prevent backflow into municipal storm line.",
            "sev": "Medium",
            "score": 45.0,
            "status": "In Progress",
            "team_id": teams[1].id,
            "lat": 12.9550,
            "lng": 77.5700
        },
        {
            "code": "INC-WST-07-112",
            "type": "WASTE",
            "title": "E-Waste Depot Accumulation",
            "loc": "Ward 7 - Tech Park Metro",
            "zid": 7,
            "desc": "Scheduled special electronic waste collection and sorting.",
            "sev": "Medium",
            "score": 48.0,
            "status": "Assigned",
            "team_id": teams[4].id,
            "lat": 12.9360,
            "lng": 77.6110
        }
    ]

    for inc_d in incidents_seed:
        t_obj = next((t for t in teams if t.id == inc_d["team_id"]), teams[0])
        inc = CivicIncident(
            incident_code=inc_d["code"],
            resource_type=inc_d["type"],
            incident_type=inc_d["title"],
            location=inc_d["loc"],
            zone_or_area_id=inc_d["zid"],
            description=inc_d["desc"],
            severity=inc_d["sev"],
            priority_score=inc_d["score"],
            status=inc_d["status"],
            assigned_team_name=t_obj.team_name,
            assigned_team_id=t_obj.id,
            latitude=inc_d["lat"],
            longitude=inc_d["lng"],
            detected_at=datetime.utcnow() - timedelta(hours=random.randint(1, 48))
        )
        db.add(inc)
        db.commit()
        db.refresh(inc)

        # Create Task
        tsk = Task(
            task_code=f"TSK-{inc_d['type'][:3]}-{inc.id:04d}",
            incident_id=inc.id,
            task_title=f"Resolve: {inc_d['title']}",
            description=inc_d["desc"],
            resource_type=inc_d["type"],
            assigned_team_id=t_obj.id,
            priority=inc_d["sev"],
            status="In Progress" if inc_d["status"] == "In Progress" else ("Completed" if inc_d["status"] in ["Resolved", "Closed"] else "Assigned"),
            admin_notes=f"Dispatched {t_obj.team_name} for priority resolution."
        )
        db.add(tsk)

        # Create Alert
        alt = Alert(
            resource_type=inc_d["type"],
            incident_id=inc.id,
            title=f"{inc_d['sev']} Priority: {inc_d['title']}",
            message=f"{inc_d['title']} at {inc_d['loc']}. Score: {inc_d['score']}",
            severity="CRITICAL" if inc_d["sev"] == "Critical" else ("HIGH" if inc_d["sev"] == "High" else "WARNING"),
            is_read=inc_d["status"] in ["Resolved", "Closed"]
        )
        db.add(alt)

    db.commit()

    print("Seeding Waste Schedules & Requests...")
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    for a in areas:
        sch = WasteSchedule(
            area_id=a.id,
            collection_date=today_str,
            collection_time="08:30 AM",
            waste_type="Organic & Recyclable",
            assigned_team_id=teams[2].id if a.id % 2 == 0 else teams[3].id,
            status="In Progress" if a.id in [1, 2, 3] else ("Missed" if a.id == 5 else "Completed")
        )
        db.add(sch)
    db.commit()

    print("Database seeding completed successfully with 12 comprehensive incidents!")
