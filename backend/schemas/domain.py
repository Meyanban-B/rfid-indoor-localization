from pydantic import BaseModel
from typing import Optional

class Position(BaseModel):
    x: float
    y: float
    z: float

class RFIDDataPayload(BaseModel):
    tag_id: str
    timestamp: float
    phase: float
    rssi: float
    frequency: float
    reader_position: Position
    estimated_tag_position: Optional[Position] = None

class TagUpdate(BaseModel):
    description: str
