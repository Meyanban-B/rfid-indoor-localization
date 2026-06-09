from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
import datetime
from database.connection import Base

class Tag(Base):
    __tablename__ = "tags"
    id = Column(String, primary_key=True, index=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Device(Base):
    __tablename__ = "devices"
    id = Column(String, primary_key=True, index=True)
    type = Column(String, index=True) # e.g., "reader"
    status = Column(String)
    last_seen = Column(DateTime, default=datetime.datetime.utcnow)

class SignalMeasurement(Base):
    __tablename__ = "signal_measurements"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tag_id = Column(String, ForeignKey("tags.id"), index=True)
    timestamp = Column(Float) # Unix timestamp from simulator
    phase = Column(Float)
    rssi = Column(Float)
    frequency = Column(Float)
    reader_position = Column(JSON) # e.g., {"x": 2.1, "y": 1.5, "z": 1.2}

class TagLocation(Base):
    __tablename__ = "tag_locations"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tag_id = Column(String, ForeignKey("tags.id"), index=True)
    timestamp = Column(Float)
    estimated_position = Column(JSON) # e.g., {"x": 5.4, "y": 2.2, "z": 0.8}
