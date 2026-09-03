from fastapi.testclient import TestClient
from app.main import app
from app.services.distance_engine import calculate_haversine_distance
from app.services.priority_engine import calculate_priority_score

client = TestClient(app)

def test_haversine():
    dist = calculate_haversine_distance(12.9716, 77.5946, 12.9789, 77.6025)
    assert 1.0 <= dist <= 3.0

def test_priority_engine():
    score_water = calculate_priority_score("WATER", "Critical", 45000, 35.0)
    assert score_water >= 75.0
    score_waste = calculate_priority_score("WASTE", "Low", 5000, 2.0)
    assert score_waste <= 30.0

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["success"] is True

def test_login_admin():
    response = client.post("/api/auth/login", json={
        "email": "admin@civicresource.gov",
        "password": "Admin@123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    return data["data"]["access_token"]

def test_dashboard_summary():
    token = test_login_admin()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/dashboard/summary", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["kpi"]["total_water_zones"] == 10
    assert data["kpi"]["total_waste_areas"] == 10

def test_water_zones():
    response = client.get("/api/water/zones")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 10

def test_waste_areas():
    response = client.get("/api/waste/areas")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 10

def test_civic_incidents():
    response = client.get("/api/incidents")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) > 0

def test_tasks():
    response = client.get("/api/tasks")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) > 0

def test_teams():
    response = client.get("/api/teams")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 5

def test_nearby_repair_services():
    response = client.get("/api/repair-services/nearby/1?radius_km=10&domain=water")
    assert response.status_code == 200
    data = response.json()["data"]
    assert "repair_services" in data
    assert len(data["repair_services"]) > 0

def test_alerts():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) > 0

def test_analytics_predict():
    response = client.post("/api/analytics/predict-risk?supplied=300&consumed=180&flow_rate=25&pressure=1.5&population=35000")
    assert response.status_code == 200
    data = response.json()["data"]
    assert "predicted_risk_level" in data

def test_reports_pdf():
    response = client.get("/api/reports/export-pdf?type=combined")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"

if __name__ == "__main__":
    test_haversine()
    test_priority_engine()
    test_root()
    test_dashboard_summary()
    test_water_zones()
    test_waste_areas()
    test_civic_incidents()
    test_tasks()
    test_teams()
    test_nearby_repair_services()
    test_alerts()
    test_analytics_predict()
    test_reports_pdf()
    print("All Backend API & Civic Core Integration Tests Passed Cleanly!")
