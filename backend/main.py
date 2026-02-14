from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
import database
from database import engine
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from runner import WorkflowRunner
import os

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
runner = WorkflowRunner()

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

# Templates Data
TEMPLATES = [
    {
        "id": "notes_insights_tag",
        "name": "Notes → Insights → Tag",
        "steps": [
            {"type": "clean"},
            {"type": "summarize"},
            {"type": "extract"},
            {"type": "tag"}
        ]
    },
    {
        "id": "quick_summary",
        "name": "Quick Summary",
        "steps": [
            {"type": "clean"},
            {"type": "summarize"}
        ]
    },
    {
        "id": "insights_only",
        "name": "Insights Only",
        "steps": [
            {"type": "clean"},
            {"type": "summarize"},
            {"type": "extract"}
        ]
    }
]

@app.get("/health")
def health_check():
    return {"ok": True}

@app.get("/health/db")
def health_db_check(db: Session = Depends(database.get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database connection failed")

@app.get("/health/gemini")
async def health_gemini_check():
    try:
        # Minimal check: just a tiny prompt
        await runner._call_gemini("ok")
        return {"ok": True, "status": "connected"}
    except Exception as e:
        error_msg = str(e).lower()
        if "429" in error_msg or "quota" in error_msg:
            return {"ok": False, "status": "rate_limited"}
        return {"ok": False, "status": "error", "detail": "Gemini connection failed"}

@app.get("/")
def read_root():
    return {"message": "Welcome to the Workflow API"}

# Workflow CRUD
@app.post("/api/workflows", response_model=schemas.Workflow, status_code=201)
def create_workflow(workflow: schemas.WorkflowCreate, db: Session = Depends(database.get_db)):
    try:
        db_workflow = models.Workflow(
            name=workflow.name, 
            steps=[step.dict() for step in workflow.steps]
        )
        db.add(db_workflow)
        db.commit()
        db.refresh(db_workflow)
        return db_workflow
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create workflow")

@app.get("/api/workflows", response_model=List[schemas.Workflow])
def list_workflows(db: Session = Depends(database.get_db)):
    try:
        return db.query(models.Workflow).order_by(models.Workflow.created_at.desc()).all()
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch workflows")

@app.get("/api/workflows/{workflow_id}", response_model=schemas.Workflow)
def get_workflow(workflow_id: int, db: Session = Depends(database.get_db)):
    db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return db_workflow

@app.put("/api/workflows/{workflow_id}", response_model=schemas.Workflow)
def update_workflow(workflow_id: int, workflow: schemas.WorkflowCreate, db: Session = Depends(database.get_db)):
    try:
        db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
        if not db_workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        db_workflow.name = workflow.name
        db_workflow.steps = [step.dict() for step in workflow.steps]
        db.commit()
        db.refresh(db_workflow)
        return db_workflow
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update workflow")

@app.delete("/api/workflows/{workflow_id}")
def delete_workflow(workflow_id: int, db: Session = Depends(database.get_db)):
    try:
        db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
        if not db_workflow:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        db.delete(db_workflow)
        db.commit()
        return {"ok": True}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete workflow")

# Templates
@app.get("/api/templates")
def list_templates():
    return TEMPLATES

@app.post("/api/templates/{template_id}/create-workflow", response_model=schemas.Workflow)
def create_from_template(template_id: str, name_data: Optional[dict] = None, db: Session = Depends(database.get_db)):
    template = next((t for t in TEMPLATES if t["id"] == template_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    workflow_name = (name_data or {}).get("name") or template["name"]
    
    try:
        db_workflow = models.Workflow(
            name=workflow_name,
            steps=template["steps"]
        )
        db.add(db_workflow)
        db.commit()
        db.refresh(db_workflow)
        return db_workflow
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create workflow from template")

# Workflow Execution
@app.post("/api/workflows/{workflow_id}/run")
async def run_workflow(workflow_id: int, initial_data: str, db: Session = Depends(database.get_db)):
    db_workflow = db.query(models.Workflow).filter(models.Workflow.id == workflow_id).first()
    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    try:
        result = await runner.run_workflow(db_workflow.steps, initial_data)

        # Store the recent run
        recent_run = models.RecentRun(
            workflow_id=workflow_id,
            input_data=initial_data,
            output_data=result
        )
        db.add(recent_run)
        db.commit()

        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Workflow execution failed")

@app.post("/api/workflows/run-step")
async def run_step(request: schemas.StepRunRequest):
    try:
        result = await runner.run_step(request.step_type, request.input_data, request.config or {})
        return {"result": result}
    except ValueError as e:
        # Known validation / unsupported step errors return 400
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Step execution failed: {str(e)}")

@app.delete("/api/recent-runs")
def clear_recent_runs(user_id: Optional[str] = None, db: Session = Depends(database.get_db)):
    try:
        query = db.query(models.RecentRun)
        if user_id:
            query = query.filter(models.RecentRun.user_id == user_id)
        query.delete(synchronize_session=False)
        db.commit()
        return {"message": "Recent runs cleared successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to clear recent runs")

@app.get("/api/recent-runs")
def get_recent_runs(user_id: Optional[str] = None, db: Session = Depends(database.get_db)):
    try:
        query = db.query(models.RecentRun)
        if user_id:
            query = query.filter(models.RecentRun.user_id == user_id)
        
        runs = query.order_by(models.RecentRun.created_at.desc()).limit(10).all()
        
        result = []
        for r in runs:
            wf = db.query(models.Workflow).filter(models.Workflow.id == r.workflow_id).first()
            result.append({
                "id": r.id,
                "workflow_id": r.workflow_id,
                "workflow_name": wf.name if wf else "Unknown Workflow",
                "input_data": r.input_data,
                "output_data": r.output_data,
                "created_at": r.created_at
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch recent runs: {str(e)}")

@app.post("/api/recent-runs")
def add_recent_run(recent_run: schemas.RecentRunCreate, db: Session = Depends(database.get_db)):
    try:
        new_run = models.RecentRun(
            workflow_id=recent_run.workflow_id,
            user_id=recent_run.user_id,
            input_data=recent_run.input_data,
            output_data=recent_run.output_data
        )
        db.add(new_run)
        db.commit()
        db.refresh(new_run)
        return new_run
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to add recent run")
