from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.report_service import generate_pdf_report, generate_csv_report

router = APIRouter(prefix="/reports", tags=["Reports Exporter"])

@router.get("/export-pdf")
def export_pdf_report(type: str = Query("combined"), db: Session = Depends(get_db)):
    pdf_buffer = generate_pdf_report(db, report_type=type)
    headers = {'Content-Disposition': f'attachment; filename="CivicResource_Report_{type}.pdf"'}
    return StreamingResponse(pdf_buffer, media_type="application/pdf", headers=headers)

@router.get("/export-csv")
def export_csv_report(type: str = Query("combined"), db: Session = Depends(get_db)):
    csv_str = generate_csv_report(db, report_type=type)
    headers = {'Content-Disposition': f'attachment; filename="CivicResource_Data_{type}.csv"'}
    return Response(content=csv_str, media_type="text/csv", headers=headers)
