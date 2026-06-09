import asyncio
import aiomqtt
import os
import json
import logging
from database.connection import AsyncSessionLocal
from models.domain import Tag, SignalMeasurement, TagLocation, Device
from schemas.domain import RFIDDataPayload

logger = logging.getLogger(__name__)

MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = "rfid_localization_alpha_team_e22d"

# Reference to the websocket manager broadcast function, set by main.py
ws_broadcast_callback = None

def set_ws_broadcast(callback):
    global ws_broadcast_callback
    ws_broadcast_callback = callback

async def process_message(payload_str: str):
    try:
        data = json.loads(payload_str)
        payload = RFIDDataPayload(**data)
        
        # 1. Forward to websocket
        if ws_broadcast_callback:
            await ws_broadcast_callback(data)
            
        # 2. Save to database asynchronously
        async with AsyncSessionLocal() as db:
            # Ensure tag exists
            tag = await db.get(Tag, payload.tag_id)
            if not tag:
                tag = Tag(id=payload.tag_id, description=f"Auto-registered {payload.tag_id}")
                db.add(tag)
                await db.flush()
                
            # Add measurement
            measurement = SignalMeasurement(
                tag_id=payload.tag_id,
                timestamp=payload.timestamp,
                phase=payload.phase,
                rssi=payload.rssi,
                frequency=payload.frequency,
                reader_position=payload.reader_position.dict()
            )
            db.add(measurement)
            
            # Add location if available
            if payload.estimated_tag_position:
                loc = TagLocation(
                    tag_id=payload.tag_id,
                    timestamp=payload.timestamp,
                    estimated_position=payload.estimated_tag_position.dict()
                )
                db.add(loc)
            
            await db.commit()

    except Exception as e:
        logger.error(f"Error processing MQTT message: {e}")

async def start_mqtt_client():
    while True:
        try:
            logger.info(f"Connecting to MQTT broker {MQTT_BROKER}:{MQTT_PORT}...")
            async with aiomqtt.Client(hostname=MQTT_BROKER, port=MQTT_PORT) as client:
                logger.info("Connected to MQTT!")
                await client.subscribe(MQTT_TOPIC)
                async for message in client.messages:
                    await process_message(message.payload.decode())
        except aiomqtt.MqttError as error:
            logger.error(f"MQTT Error: {error}. Reconnecting in 5 seconds...")
            await asyncio.sleep(5)
        except Exception as e:
            logger.error(f"Unexpected MQTT Client error: {e}")
            await asyncio.sleep(5)
