# Real-Time SDR-Based RFID Indoor Localization & Analytics Platform


## 📌 Abstract & Overview

Accurate indoor localization of passive UHF RFID tags is an essential requirement in warehouse automation, medical equipment tracking, and smart manufacturing where GPS signals cannot penetrate. 

This platform delivers an end-to-end **real-time 3D RFID indoor localization and analytics system**. Inspired by the state-of-the-art **POLAR** localization research (Shangguan & Jamieson), the system processes backscattered UHF carrier signals in the 902–928 MHz ISM band, combining **Received Signal Strength Indicator (RSSI)**, **carrier phase measurements**, and **polarization angles** to achieve sub-metre positioning accuracy (mean error ~0.24m in LOS conditions).

The platform includes:
- **Telemetry Ingestion & Simulation**: Software-Defined Radio (BladeRF SDR) reader interface or high-frequency telemetry simulation.
- **Micro-Broker Pipeline**: Ultra-lightweight asynchronous MQTT 3.1.1 broker.
- **FastAPI Localization Engine**: Asynchronous telemetry ingestion, database persistence, and WebSocket real-time fan-out.
- **Industrial Web Dashboard**: Interactive 3D spatial room digital twin (Three.js), 2D floor plans, bay scanning, accuracy analytics, and historical playback.

---

## 🏗️ System Architecture

```text
 ┌────────────────────────────────────────────────────────┐
 │   RFID Tag Array (Fixed & Mobile Passive UHF Tags)     │
 └───────────────────────────▲────────────────────────────┘
                             │ Backscatter (915 MHz)
 ┌───────────────────────────┴────────────────────────────┐
 │  SDR Interrogator / Telemetry Simulator (simulator/)   │
 │   - Phase accumulation: φ = (4πd/λ) mod 2π             │
 │   - RSSI path-loss modelling with Rayleigh fading      │
 │   - Reader trajectory simulation in 3D coordinate space│
 └───────────────────────────┬────────────────────────────┘
                             │ MQTT Publish (QoS 0)
                             │ Topic: rfid_localization_alpha_team_e22d
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │        In-Memory MQTT Broker (mqtt_broker.py)          │
 │              Listening on 0.0.0.0:1883                 │
 └───────────────────────────┬────────────────────────────┘
                             │ aiomqtt Client (Async)
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │          FastAPI Backend Service (backend/)            │
 │   - Asynchronous SQLite / PostgreSQL engine            │
 │   - Tag registration & historical trajectory storage   │
 │   - WebSocket broadcast hub (/ws/live)                 │
 │   - RESTful API (/tags, /analytics, /api/history)      │
 └───────────────────────────┬────────────────────────────┘
                             │ WebSocket (JSON Telemetry)
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │       React 19 + Vite Industrial UI (frontend/)        │
 │   - Three.js 3D Spatial Digital Twin (Scene3D)         │
 │   - 2D Overhead Multi-Bay Grid (Visualizer2D)          │
 │   - Dynamic RSSI & Phase Waveforms (Chart.js)          │
 │   - Accuracy & Positioning Error Distribution Analytics│
 │   - Warehouse Bay Inventory Scanner & Tag Manager      │
 └────────────────────────────────────────────────────────┘
```

---

## ⚡ Mathematical Formulation

### 1. Carrier Phase Ranging
The carrier phase $\phi$ of the backscattered signal received from an RFID tag located at distance $d$ from the interrogator is governed by:

$$\phi = \left(\frac{4\pi}{\lambda} d + \theta_0\right) \pmod{2\pi}$$

Where:
- $\lambda$ is the electromagnetic carrier wavelength ($\approx 0.327 \text{ m}$ at $915\text{ MHz}$).
- $\theta_0$ accounts for reader/tag hardware circuitry phase offsets.
- Multipath suppression is resolved using polarization-diversity observables.

### 2. Log-Distance Path Loss (RSSI)
The received power $P_r(d)$ in dBm at distance $d$ follows:

$$P_r(d) = P_0 - 10 \, n \, \log_{10}\left(\frac{d}{d_0}\right) + X_\sigma$$

Where $P_0$ is the reference power at $d_0 = 1\text{m}$, $n$ is the environment path-loss exponent, and $X_\sigma \sim \mathcal{N}(0, \sigma^2)$ represents shadow fading.

---

## 🚀 Quick Start (Windows)

### Prerequisites
- **Python 3.10+** (Added to system `PATH`)
- **Node.js LTS** (v18 or higher)

### 1. Initial Project Setup
Run `setup.bat` once to configure the virtual environment and install all dependencies:
```cmd
setup.bat
```
This automatically:
- Creates `venv/`
- Installs backend packages (`fastapi`, `uvicorn`, `aiomqtt`, `sqlalchemy`, `aiosqlite`, `pydantic`)
- Installs simulator packages (`paho-mqtt`)
- Runs `npm install` inside `frontend/`

### 2. Launch All Services (One-Click)
Run `start_all.bat` to launch all 4 components in synchronized terminal windows:
```cmd
start_all.bat
```

Services started:
| Service | Local Address | Description |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:5173](http://localhost:5173) | React 19 + Three.js 3D Industrial Dashboard |
| **FastAPI Backend** | [http://localhost:8000](http://localhost:8000) | REST API & Real-Time WebSocket server |
| **Interactive API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Swagger UI for testing API endpoints |
| **MQTT Broker** | `localhost:1883` | Async MQTT 3.1.1 Message Broker |
| **RFID Simulator** | Console | Real-time tag telemetry generator |

---

## 🛠️ Individual Service Controls

To run or debug services individually:

- **MQTT Broker**:
  ```cmd
  start_broker.bat
  ```
- **Backend API Server**:
  ```cmd
  start_backend.bat
  ```
- **Telemetry Simulator**:
  ```cmd
  start_simulator.bat
  ```
- **Frontend Dashboard**:
  ```cmd
  start_frontend.bat
  ```

---

## 🐳 Running with Docker Compose

To deploy containerized services (Mosquitto broker + PostgreSQL + FastAPI + React frontend):

```bash
docker-compose up --build
```

---

## 📂 Project Structure

```text
├── backend/
│   ├── api/                # REST endpoints and WebSocket route handlers
│   ├── database/           # SQLAlchemy async engine, connection & schema setup
│   ├── models/             # Domain ORM models (Tag, SignalMeasurement, Device)
│   ├── mqtt/               # Asynchronous MQTT client & subscriber loop
│   ├── schemas/            # Pydantic validation models
│   ├── websocket/          # Active WebSocket connection manager
│   ├── Dockerfile          # Backend container specification
│   ├── main.py             # FastAPI entry point & Windows event loop setup
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # UI modules (Scene3D, Visualizer2D, Accuracy, etc.)
│   │   ├── pages/          # Main Dashboard page
│   │   ├── services/       # WebSocket service and API clients
│   │   ├── App.jsx         # Root component
│   │   └── main.jsx        # React DOM entry point
│   ├── package.json        # Dependencies & scripts
│   ├── tailwind.config.js  # Industrial theme configuration
│   └── vite.config.js      # Vite build configuration
├── simulator/
│   ├── Dockerfile          # Simulator container specification
│   ├── main.py             # 3D circular reader motion & RFID signal generator
│   └── requirements.txt    # Simulator dependencies
├── docker/
│   └── mosquitto/config/   # Mosquitto broker configuration
├── .gitignore              # Production-grade git exclusion rules
├── docker-compose.yml      # Multi-container orchestration
├── mqtt_broker.py          # Standalone lightweight Python MQTT broker
├── setup.bat               # First-time automatic setup script
├── start_all.bat           # Master one-click startup script
├── start_backend.bat       # Backend launcher
├── start_broker.bat        # Broker launcher
├── start_frontend.bat      # Frontend launcher
└── start_simulator.bat     # Simulator launcher
```

---

## 📡 API & WebSocket Reference

### Key REST Endpoints

- `GET /` - Health check & platform status.
- `GET /tags` - List all registered tags with active timestamps.
- `GET /tags/{tag_id}` - Retrieve details and coordinates for a specific tag.
- `PUT /tags/{tag_id}` - Update tag metadata (description, location name).
- `GET /analytics` - Aggregate statistics (total measurements captured).
- `GET /api/history?limit=100` - Historical RSSI, phase, and reader position telemetry.
- `GET /api/history/locations?limit=150` - Historical tag localization points.
- `GET /api/devices` - Reader hardware status (IP address, antenna status).

### WebSocket Stream (`ws://localhost:8000/ws/live`)

Live telemetry published per packet:
```json
{
  "tag_id": "RFID_001",
  "timestamp": 1748180400.12,
  "phase": 3.14159,
  "rssi": -48.2,
  "frequency": 915000000,
  "reader_position": { "x": 2.5, "y": 1.8, "z": 1.2 },
  "estimated_tag_position": { "x": 1.05, "y": 0.98, "z": 0.52 }
}
```

---

## 📊 Dashboard Modules

1. **3D Spatial Digital Twin (`Scene3D`)**: Interactive volumetric room view rendered in WebGL showing the roving reader path, tag coordinate spheres, and spatial grid.
2. **2D Grid Floor Plan (`Visualizer2D`)**: Real-time overhead map with coordinates and reader sweep path.
3. **Signal Quality Analytics (`SignalStrength`)**: Live oscilloscope-style RSSI and phase waveforms.
4. **Accuracy & Positioning Error (`AccuracyAnalytics`)**: Real-time CDF error curves, LOS vs NLOS error rates, and RMSE analysis.
5. **Bay Inventory Scanner (`BayScan`)**: Shelf-level asset audits and missing tag alerts.
6. **Telemetry History Playback (`HistoryModule`)**: Inspection log of raw measurements for post-hoc analysis.

---


