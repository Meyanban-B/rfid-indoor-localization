from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database.connection import get_db
from models.domain import Tag, SignalMeasurement, TagLocation, Device
from schemas.domain import TagUpdate
from websocket.manager import manager
from typing import List

router = APIRouter()

@router.get("/tags")
async def get_tags(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag))
    return result.scalars().all()

@router.get("/tags/{tag_id}")
async def get_tag(tag_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag).filter(Tag.id == tag_id))
    return result.scalars().first()

@router.put("/tags/{tag_id}")
async def update_tag(tag_id: str, tag_update: TagUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag).filter(Tag.id == tag_id))
    tag = result.scalars().first()
    if not tag:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Tag not found")
    tag.description = tag_update.description
    await db.commit()
    await db.refresh(tag)
    return tag

@router.get("/analytics")
async def get_analytics(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SignalMeasurement))
    measurements = result.scalars().all()
    return {"total_measurements": len(measurements)}

@router.get("/api/history")
async def get_history(limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SignalMeasurement)
        .order_by(SignalMeasurement.timestamp.desc())
        .limit(limit)
    )
    measurements = result.scalars().all()
    return [
        {
            "tag_id": m.tag_id,
            "timestamp": m.timestamp,
            "phase": m.phase,
            "rssi": m.rssi,
            "frequency": m.frequency,
            "reader_position": m.reader_position
        }
        for m in measurements
    ]

@router.get("/api/history/locations")
async def get_historical_locations(limit: int = 150, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TagLocation)
        .order_by(TagLocation.timestamp.desc())
        .limit(limit)
    )
    locations = result.scalars().all()
    return [
        {
            "tag_id": loc.tag_id,
            "timestamp": loc.timestamp,
            "estimated_position": loc.estimated_position
        }
        for loc in locations
    ]

@router.get("/api/devices")
async def get_devices(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Device))
    devices = result.scalars().all()
    
    # If DB has no registered devices yet, provide active mock RFID readers for tracking
    if not devices:
        return [
            {
                "id": "READER_MAIN_01",
                "type": "RFID Reader",
                "status": "Online",
                "ip_address": "192.168.1.105",
                "antennas": ["Antenna 1 (Active)", "Antenna 2 (Active)"],
                "last_seen": "Just Now"
            },
            {
                "id": "READER_BAY_02",
                "type": "RFID Reader",
                "status": "Offline",
                "ip_address": "192.168.1.106",
                "antennas": ["Antenna A (Disconnected)"],
                "last_seen": "15 mins ago"
            }
        ]
    return [
        {
            "id": dev.id,
            "type": dev.type,
            "status": dev.status,
            "last_seen": dev.last_seen.isoformat() if dev.last_seen else None
        }
        for dev in devices
    ]

@router.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
