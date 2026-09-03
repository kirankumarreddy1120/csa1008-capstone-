from app.database import engine, Base, SessionLocal
from app.models import *
from app.services.seed_service import seed_database

def run_seed():
    print("Creating Database Tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
