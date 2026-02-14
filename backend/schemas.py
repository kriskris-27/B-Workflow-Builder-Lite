from pydantic import BaseModel
from typing import List, Literal, Optional, Any
import datetime

class Step(BaseModel):
    type: Literal["clean", "summarize", "extract", "tag"]
    config: dict = {}

class WorkflowBase(BaseModel):
    name: str
    steps: List[Step]

class WorkflowCreate(WorkflowBase):
    pass

class Workflow(WorkflowBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class StepRunRequest(BaseModel):
    step_type: str
    input_data: str
    config: Optional[dict] = {}

class RecentRunCreate(BaseModel):
    workflow_id: int
    user_id: Optional[str] = None
    input_data: Any
    output_data: Any
