import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import init_db
from api.router import router as api_router
from mqtt.client import start_mqtt_client, set_ws_broadcast
from websocket.manager import broadcast_mqtt_data
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="RFID Localization Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting up FastAPI application...")
    await init_db()
    set_ws_broadcast(broadcast_mqtt_data)
    asyncio.create_task(start_mqtt_client())

@app.get("/")
def read_root():
    return {"message": "RFID Localization Platform API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

