from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


class RawEvent(BaseModel):
    type: str
    timestamp: int  # unix ms
    url: Optional[str] = None
    properties: Dict[str, Any] = Field(default_factory=dict)


class EventBatch(BaseModel):
    anon_id: str
    session_id: str
    events: List[RawEvent]
