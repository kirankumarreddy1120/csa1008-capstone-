import io
import csv
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from sqlalchemy.orm import Session
from app.models.water_zone import WaterZone
from app.models.waste_area import WasteArea
from app.models.civic_incident import CivicIncident
from app.models.task import Task
from app.models.team import Team

def generate_pdf_report(db: Session, report_type: str = "combined") -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        fontName='Helvetica-Bold'
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#64748b'),
        fontName='Helvetica'
    )
    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#0284c7'),
        fontName='Helvetica-Bold',
        spaceBefore=12,
        spaceAfter=6
    )

    # Title Banner
    story.append(Paragraph("CivicResource – Municipal Performance Audit Report", title_style))
    story.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')} | Type: {report_type.upper()}", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#e2e8f0'), spaceAfter=15))

    # Fetch Data
    incidents = db.query(CivicIncident).all()
    tasks = db.query(Task).all()
    zones = db.query(WaterZone).all()
    areas = db.query(WasteArea).all()

    # Executive Summary Table
    story.append(Paragraph("Executive Performance Summary", h2_style))
    summary_data = [
        ["Metric Category", "Water Domain", "Waste Domain", "Combined Total"],
        ["Total Operational Zones / Wards", str(len(zones)), str(len(areas)), str(len(zones) + len(areas))],
        ["Active Incidents Logged", str(len([i for i in incidents if i.resource_type == "WATER" and i.status != "Closed"])),
         str(len([i for i in incidents if i.resource_type == "WASTE" and i.status != "Closed"])), str(len([i for i in incidents if i.status != "Closed"]))],
        ["Open Dispatch Tasks", str(len([t for t in tasks if t.resource_type == "WATER" and t.status != "Closed"])),
         str(len([t for t in tasks if t.resource_type == "WASTE" and t.status != "Closed"])), str(len([t for t in tasks if t.status != "Closed"]))]
    ]
    t = Table(summary_data, colWidths=[160, 110, 110, 110])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc'))
    ]))
    story.append(t)
    story.append(Spacer(1, 15))

    # Priority Incidents Table
    story.append(Paragraph("Active Civic Incidents & Priority Ratings", h2_style))
    inc_headers = ["Code", "Type", "Domain", "Location", "Priority", "Severity", "Status"]
    inc_rows = [inc_headers]
    for inc in incidents[:12]:
        inc_rows.append([
            inc.incident_code,
            inc.incident_type,
            inc.resource_type,
            inc.location[:22],
            f"{inc.priority_score:.1f}",
            inc.severity,
            inc.status
        ])
    
    t_inc = Table(inc_rows, colWidths=[70, 95, 55, 110, 50, 55, 55])
    t_inc.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0284c7')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f1f5f9')])
    ]))
    story.append(t_inc)

    doc.build(story)
    buffer.seek(0)
    return buffer

def generate_csv_report(db: Session, report_type: str = "combined") -> str:
    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == "water":
        writer.writerow(["Zone ID", "Zone Name", "Zone Code", "Population", "Latitude", "Longitude", "Status"])
        zones = db.query(WaterZone).all()
        for z in zones:
            writer.writerow([z.id, z.zone_name, z.zone_code, z.population, z.latitude, z.longitude, z.status])
    elif report_type == "waste":
        writer.writerow(["Area ID", "Area Name", "Area Code", "Population", "Latitude", "Longitude", "Status"])
        areas = db.query(WasteArea).all()
        for a in areas:
            writer.writerow([a.id, a.area_name, a.area_code, a.population, a.latitude, a.longitude, a.status])
    else: # Combined Civic Incidents
        writer.writerow(["Incident Code", "Resource Type", "Incident Type", "Location", "Priority Score", "Severity", "Status", "Detected At"])
        incidents = db.query(CivicIncident).all()
        for inc in incidents:
            writer.writerow([inc.incident_code, inc.resource_type, inc.incident_type, inc.location, inc.priority_score, inc.severity, inc.status, inc.detected_at])

    return output.getvalue()
