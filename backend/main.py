from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
import database
from database import engine
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
import os

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS Configuration
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173")
origins = [origin.strip() for origin in cors_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"ok": True}

@app.get("/health/db")
def health_db_check(db: Session = Depends(database.get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
def read_root():
    return {"message": "Welcome to the Workflow API"}

@app.post("/workflows/", response_model=schemas.Workflow)
def create_workflow(workflow: schemas.WorkflowBase, db: Session = Depends(database.get_db)):
    db_workflow = models.Workflow(name=workflow.name, steps=[step.dict() for step in workflow.steps])
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    return db_workflow

@app.get("/workflows/", response_model=List[schemas.Workflow])
def read_workflows(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    workflows = db.query(models.Workflow).offset(skip).limit(limit).all()
    return workflows
