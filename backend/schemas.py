from pydantic import BaseModel
from typing import List, Literal

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

    class Config:
        from_attributes = True
