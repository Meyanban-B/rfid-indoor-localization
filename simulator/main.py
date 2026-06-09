import paho.mqtt.client as mqtt
from paho.mqtt.enums import CallbackAPIVersion
import time
import json
import random
import os
import math

MQTT_BROKER = os.getenv("MQTT_BROKER", "broker.hivemq.com")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = "rfid_localization_alpha_team_e22d"

# Fixed tags in the environment (e.g. 5x5 room)
TAGS = [
    {"id": "RFID_001", "true_pos": {"x": 1.0, "y": 1.0, "z": 0.5}},
    {"id": "RFID_002", "true_pos": {"x": 4.0, "y": 1.0, "z": 0.5}},
    {"id": "RFID_003", "true_pos": {"x": 1.0, "y": 4.0, "z": 0.5}},
    {"id": "RFID_004", "true_pos": {"x": 4.0, "y": 4.0, "z": 0.5}},
    {"id": "RFID_005", "true_pos": {"x": 2.5, "y": 2.5, "z": 0.5}},
]

def on_connect(client, userdata, flags, reason_code, properties=None):
    if reason_code == 0:
        print("Connected to MQTT Broker!")
    else:
        print(f"Failed to connect, return code {reason_code}")

client = mqtt.Client(CallbackAPIVersion.VERSION2)
client.on_connect = on_connect

def connect_mqtt():
    while True:
        try:
            client.connect(MQTT_BROKER, MQTT_PORT, 60)
            break
        except Exception as e:
            print(f"Connection failed: {e}. Retrying in 5 seconds...")
            time.sleep(5)

connect_mqtt()
client.loop_start()

def get_reader_position(t):
    # Simulate reader moving in a circle
    radius = 1.5
    center_x = 2.5
    center_y = 2.5
    speed = 0.5 # rad/s
    return {
        "x": center_x + radius * math.cos(speed * t),
        "y": center_y + radius * math.sin(speed * t),
        "z": 1.2
    }

print("Starting simulation...")
start_time = time.time()

try:
    while True:
        current_time = time.time()
        t = current_time - start_time
        reader_pos = get_reader_position(t)

        for tag in TAGS:
            # Calculate distance
            dx = reader_pos["x"] - tag["true_pos"]["x"]
            dy = reader_pos["y"] - tag["true_pos"]["y"]
            dz = reader_pos["z"] - tag["true_pos"]["z"]
            dist = math.sqrt(dx**2 + dy**2 + dz**2)

            # Simulate RSSI: -40 dBm at 1m, drops with square of distance
            rssi = -40 - 20 * math.log10(max(dist, 0.1)) + random.uniform(-2, 2)
            
            # Simulate phase: wrapped between 0 and 2*pi
            wavelength = 3e8 / 915e6
            phase = (4 * math.pi * dist / wavelength) % (2 * math.pi) + random.uniform(-0.1, 0.1)

            # Simulated estimated position (add some noise to true pos)
            est_pos = {
                "x": tag["true_pos"]["x"] + random.uniform(-0.2, 0.2),
                "y": tag["true_pos"]["y"] + random.uniform(-0.2, 0.2),
                "z": tag["true_pos"]["z"] + random.uniform(-0.1, 0.1)
            }

            payload = {
                "tag_id": tag["id"],
                "timestamp": current_time,
                "phase": phase,
                "rssi": rssi,
                "frequency": 915000000,
                "reader_position": reader_pos,
                "estimated_tag_position": est_pos
            }
            
            client.publish(MQTT_TOPIC, json.dumps(payload))
        
        time.sleep(0.5) # Publish every 500ms
except KeyboardInterrupt:
    print("Stopping simulator...")
    client.loop_stop()
    client.disconnect()
