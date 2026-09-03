from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.team import Team
from app.models.task import Task
from app.schemas.team import TeamCreate, TeamOut

router = APIRouter(prefix="/teams", tags=["Team Management"])

@router.get("", response_model=dict)
def get_teams(db: Session = Depends(get_db)):
    teams = db.query(Team).all()
    res = []
    for t in teams:
        active_tasks = db.query(Task).filter(Task.assigned_team_id == t.id, Task.status != "Closed").count()
        t_dict = TeamOut.model_validate(t).model_dump()
        t_dict["active_tasks_count"] = active_tasks
        res.append(t_dict)
    return {"success": True, "data": res}

@router.post("", response_model=dict)
def create_team(team_in: TeamCreate, db: Session = Depends(get_db)):
    t = Team(**team_in.model_dump())
    db.add(t)
    db.commit()
    db.refresh(t)
    return {"success": True, "data": TeamOut.model_validate(t)}

@router.put("/{id}", response_model=dict)
def update_team(id: int, team_in: TeamCreate, db: Session = Depends(get_db)):
    t = db.query(Team).filter(Team.id == id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Team not found")
    
    for key, value in team_in.model_dump().items():
        setattr(t, key, value)

    db.commit()
    db.refresh(t)
    return {"success": True, "data": TeamOut.model_validate(t)}
