from pydantic import BaseModel
from typing import List, Literal, Optional
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
