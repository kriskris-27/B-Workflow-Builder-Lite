from sqlalchemy import Column, Integer, String, JSON, DateTime
from database import Base
import datetime

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    steps = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
