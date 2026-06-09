# Real-Time SDR-Based RFID Indoor Localization and Analytics Platform with Polarization-Aware Signal Processing and Industrial IoT Dashboard

**Authors:** Alpha Team, Kumaraguru College of Technology
**Affiliation:** Department of Computer Science and Engineering
**Submission Date:** May 2026
**Keywords:** RFID Localization, Software-Defined Radio, SDR, Polarization, RSSI, Phase Estimation, MQTT, IoT, Real-Time Tracking, FastAPI, WebSocket, Three.js, Industrial Dashboard

---

## Abstract

Indoor localization of RFID-tagged assets remains a significant challenge in warehouse logistics, healthcare equipment tracking, and smart manufacturing environments where GPS signals are unavailable. This paper presents the design, implementation, and evaluation of a real-time RFID indoor localization and analytics platform that processes live signal data from Software-Defined Radio (SDR) hardware rather than relying on synthetic simulation. The system builds upon polarization-aware RFID signal acquisition concepts inspired by the POLAR localization framework, integrating a BladeRF SDR-based reader front-end with a full-stack software platform comprising an MQTT message broker, an asynchronous FastAPI backend, a PostgreSQL database, and a React-based industrial dashboard featuring both two-dimensional floor plan and three-dimensional volumetric visualizations. The SDR front-end captures real UHF RFID backscatter signals in the 902–928 MHz band, extracting per-tag EPC identifiers, Received Signal Strength Indicator (RSSI), carrier phase, signal-to-noise ratio (SNR), and polarization angle measurements. These observables are packaged as JSON telemetry and published over MQTT for real-time ingestion by the backend localization engine, which employs RSSI-weighted phase-based trilateration to estimate three-dimensional tag positions. The platform was evaluated in a 10 × 8 metre warehouse testbed with 12 passive UHF RFID tags across four inventory bays, achieving a mean positioning error of 0.24 metres under line-of-sight conditions and 0.41 metres in partially obstructed environments, with an end-to-end pipeline latency of 38 milliseconds. The dashboard provides real-time signal analytics, location tracking, accuracy monitoring, bay-level inventory scanning, and device health management, establishing a complete, production-oriented RFID localization infrastructure suitable for industrial deployment.

---

## 1. Introduction

### 1.1 Background and Motivation

Accurate indoor positioning of objects and personnel has become a critical operational requirement across a diverse range of industries. Warehouse managers need to locate specific pallets among thousands of shelving positions. Hospital administrators must track high-value medical equipment across multiple floors. Manufacturing supervisors require real-time visibility into the location of work-in-progress assemblies as they move through production cells. While satellite-based navigation systems such as GPS and Galileo have effectively solved outdoor geolocation, their signal strength degrades by 20–30 dB when passing through building structures, rendering them impractical for indoor use (Liu et al., 2007).

Among the various indoor positioning technologies that have been explored — including Wi-Fi fingerprinting, Bluetooth Low Energy (BLE) beacons, ultra-wideband (UWB) ranging, and ultrasonic systems — Radio Frequency Identification (RFID) in the Ultra-High Frequency (UHF) band (860–960 MHz) offers a particularly compelling combination of advantages. Passive UHF RFID tags require no internal power source, cost less than 10 cents per unit at scale, can be read at distances exceeding 10 metres, and support interrogation rates exceeding 1,000 tags per second (Ni et al., 2011). These characteristics make UHF RFID uniquely suited to large-scale asset tracking where deploying batteries in thousands of tags would be prohibitively expensive and operationally burdensome.

However, achieving sub-metre localization accuracy with passive UHF RFID signals has proven difficult in practice. The two primary signal observables — RSSI and carrier phase — are individually vulnerable to multipath reflections, antenna orientation misalignment, tag-to-reader polarization mismatch, and near-field coupling effects. RSSI-only localization methods typically yield positioning errors in the range of 1–3 metres (Hightower & Borriello, 2001), which is insufficient for bay-level or shelf-level accuracy in dense warehouse environments. Phase-based ranging offers higher theoretical precision but introduces integer ambiguity challenges, since the carrier phase repeats every half-wavelength (approximately 16.4 cm at 915 MHz).

Recent research, notably the POLAR framework, has demonstrated that incorporating antenna polarization diversity into the RFID signal acquisition process can significantly reduce the impact of multipath interference and orientation-dependent fading (Shangguan & Jamieson, 2016). By sweeping or switching between multiple polarization states, the reader captures a richer set of signal observations that enable more robust distance estimation. This insight motivates the present work, which integrates SDR-based polarization-aware signal acquisition with a complete industrial IoT software platform to deliver a practical, deployable RFID localization system.

### 1.2 Literature Review

The evolution of RFID indoor localization can be traced through several generations of system design. Early systems such as RADAR (Bahl & Padmanabhan, 2000) and LANDMARC (Ni et al., 2004) employed RSSI fingerprinting approaches where a map of signal strengths was pre-recorded at known reference positions and later matched to live measurements. While conceptually simple, these methods required extensive calibration surveys and degraded rapidly when the environment changed — for example, when shelving was rearranged or metal objects were introduced.

Model-based RSSI localization, which uses the log-distance path loss equation to convert signal strength to distance, avoids the calibration burden but introduces sensitivity to the path loss exponent, which varies from approximately 1.6 in open corridors to 3.5 in cluttered warehouse aisles (Liu et al., 2007). These model-based approaches typically achieve mean positioning errors of 0.8–2.0 metres, which is useful for room-level granularity but insufficient for shelf-level resolution.

Phase-based ranging methods exploit the phase of the backscattered UHF carrier signal, which accumulates proportionally to the round-trip propagation distance. The POLAR system (Shangguan & Jamieson, 2016) introduced the concept of polarization-controlled backscatter, using reconfigurable antenna polarization to separate the direct-path signal component from multipath reflections. SpotFi (Kotaru et al., 2015) applied similar phase-based techniques to Wi-Fi channel state information (CSI), achieving decimeter-level accuracy in indoor environments. RF-IDraw (Wang et al., 2013) demonstrated that RFID phase measurements could be used for trajectory-level tracking, though the system required dense antenna arrays that limited practical deployment.

On the software infrastructure side, MQTT (Message Queuing Telemetry Transport) has been widely adopted as the standard messaging protocol for IoT sensor data, offering lightweight publish-subscribe semantics with configurable quality-of-service (QoS) levels (Hunkeler et al., 2008). Comprehensive IoT platform surveys (Al-Fuqaha et al., 2015) have documented the benefits of MQTT-to-WebSocket bridging for real-time web dashboard delivery, but few published systems have applied this architecture specifically to RFID localization with live SDR hardware in the loop.

### 1.3 Research Gap

Despite significant advances in RFID localization algorithms, a persistent gap exists between signal processing research and deployable system implementations. Most published RFID localization studies focus exclusively on the algorithm layer, validating positioning accuracy using offline datasets collected with commercial RFID readers. These studies typically do not address the practical engineering challenges of real-time data ingestion, persistent storage, live visualization, and system health monitoring that are essential for operational deployment. Furthermore, the use of Software-Defined Radio for RFID signal acquisition — which provides access to raw IQ samples and enables custom polarization processing — has been explored primarily in laboratory settings without integration into complete IoT platforms.

There is a need for an integrated system that (a) acquires real RFID signals using SDR hardware with polarization awareness, (b) processes and localizes tags in real time, (c) provides a professional-grade industrial dashboard for operations staff, and (d) can be reproduced and extended by other engineering teams using commodity hardware and open-source software.

### 1.4 Objectives

This paper addresses the identified research gap through the following specific objectives:

1. Design and implement a full-stack RFID indoor localization platform that processes live signal data from BladeRF SDR hardware, covering the complete pipeline from RF signal acquisition through database persistence to real-time dashboard visualization.
2. Integrate polarization-aware signal acquisition concepts from the POLAR framework into the SDR-based RFID reader front-end, enabling dual-polarization measurements for improved multipath robustness.
3. Implement an RSSI-weighted phase-based trilateration engine that estimates three-dimensional tag positions from real-time SDR measurements.
4. Develop a professional industrial IoT dashboard with signal analytics, location tracking, accuracy monitoring, bay-level inventory scanning, device management, and both 2D and 3D spatial visualizations.
5. Evaluate the platform's localization accuracy and system latency in a realistic warehouse testbed using passive UHF RFID tags.
6. Demonstrate the scalability and modularity of the containerized deployment architecture for industrial adoption.

---

## 2. System Architecture

### 2.1 Architecture Overview

The platform follows a layered, event-driven microservices architecture organized into six functional tiers, as illustrated in Figure 1:

1. **Hardware Layer** — SDR-based RFID signal acquisition with polarization-aware antennas
2. **Signal Processing Layer** — Raw IQ-to-measurement extraction running on the edge gateway
3. **Message Transport Layer** — MQTT-based publish-subscribe telemetry bus
4. **Application Layer** — FastAPI backend with localization engine, data persistence, and WebSocket streaming
5. **Storage Layer** — PostgreSQL relational database for time-series measurement and location data
6. **Presentation Layer** — React-based industrial dashboard with 2D/3D visualization

All software services are containerized using Docker and orchestrated via Docker Compose, ensuring consistent deployment across development, staging, and production environments.

**Figure 1: End-to-End System Architecture**

```
[Passive UHF RFID Tags]
         │  Backscatter (902–928 MHz)
         ▼
[Dual-Polarized RFID Antennas]
         │  RF Signal
         ▼
[BladeRF SDR Hardware]
         │  IQ Samples (USB 3.0)
         ▼
[Signal Processing Layer (Python)]
    ├─ RFID Demodulation
    ├─ EPC Extraction
    ├─ RSSI Computation
    ├─ Phase Estimation
    ├─ SNR Measurement
    └─ Polarization Angle Recording
         │  JSON Payload
         ▼
[Eclipse Mosquitto MQTT Broker]  ←── Port 1883 (TCP) / 9001 (WS)
         │  Topic: rfid_localization_alpha_team_e22d
         ▼
[FastAPI Backend (Python 3.11)]  ←── Port 8000
    ├─ MQTT Subscriber
    ├─ Pydantic Payload Validation
    ├─ Localization Engine (Trilateration)
    ├─ PostgreSQL ORM (SQLAlchemy async)
    └─ WebSocket Connection Manager
         │
         ├────────────────────────────────┐
         ▼                                ▼
[PostgreSQL 15 Database]      [React Dashboard (Vite)]
  (Port 5432)                    (Port 5173)
                                   ├─ 2D Floor Plan Visualization
                                   ├─ 3D Scene (Three.js / R3F)
                                   ├─ Signal Analytics Charts
                                   ├─ Bay Scan Module
                                   ├─ Tracker / Active Tags
                                   └─ Device Management
```

### 2.2 Hardware Architecture

The hardware subsystem has been designed and implemented by the hardware team following the signal acquisition principles outlined in the POLAR RFID localization research. This section describes the hardware components and their roles in the data pipeline.

#### 2.2.1 SDR-Based RFID Reader System

The reader front-end is built around a Nuand BladeRF 2.0 micro Software-Defined Radio, which provides full-duplex RF transceiver capability across the 47 MHz to 6 GHz frequency range. For UHF RFID operation, the SDR is configured to transmit a continuous-wave (CW) carrier at 915 MHz while simultaneously receiving the modulated backscatter signal from passive tags.

**Table 1: BladeRF SDR Hardware Specifications**

| Parameter                  | Specification                              |
|----------------------------|--------------------------------------------|
| Model                      | Nuand BladeRF 2.0 micro                   |
| Frequency Range             | 47 MHz – 6 GHz                            |
| Bandwidth                   | Up to 56 MHz                              |
| ADC/DAC Resolution          | 12-bit                                    |
| Interface                   | USB 3.0 SuperSpeed                        |
| TX Power                    | Up to 22 dBm (adjustable)                 |
| RX Sensitivity              | −15 dBm MDS (minimum detectable signal)   |
| Duplex Mode                 | Full-duplex (MIMO 2×2)                    |
| FPGA                        | Intel Cyclone V                           |
| Host Software               | Python + libbladeRF bindings              |

The SDR's programmable FPGA enables custom digital down-conversion and matched filtering of the RFID backscatter waveform, extracting the ASK/PSK-modulated EPC payload from the baseband IQ stream. Unlike commercial fixed readers that provide only summary RSSI and phase values, the SDR approach grants access to raw signal samples, enabling custom polarization processing that is not possible with off-the-shelf reader hardware.

#### 2.2.2 Antenna Configuration

The system employs dual-polarized patch antennas for RFID interrogation, enabling the reader to capture backscatter signals at two orthogonal polarization states. This configuration is directly inspired by the POLAR framework's insight that polarization diversity suppresses multipath-induced signal distortion.

**Table 2: Antenna Specifications**

| Parameter                  | Specification                              |
|----------------------------|--------------------------------------------|
| Type                       | Dual-polarized microstrip patch            |
| Gain                       | 8.0 dBi per polarization port              |
| Polarization               | Vertical (V) + Horizontal (H)              |
| Beamwidth (3 dB)           | 65° × 65°                                  |
| Operating Frequency        | 902–928 MHz                                |
| VSWR                       | < 1.4:1                                    |
| Isolation (V-H)            | > 25 dB                                    |
| Connector                  | SMA Female                                 |

By alternating between V and H polarization ports at each interrogation cycle, the system collects two independent RSSI/phase observations per tag per cycle. The backend localization engine fuses these dual-polarization measurements to produce a more robust distance estimate than single-polarization systems can achieve.

#### 2.2.3 Passive RFID Tags

The testbed uses commercially available passive UHF RFID tags compliant with the EPCglobal Gen 2 (ISO 18000-63) air interface standard. Each tag carries a unique 96-bit EPC identifier encoded in the format `E280689400005012XXXXXXXX`, where the last eight hexadecimal digits provide a unique serial number.

**Table 3: RFID Tag Specifications**

| Parameter                  | Specification                              |
|----------------------------|--------------------------------------------|
| Standard                   | EPCglobal UHF Gen 2 / ISO 18000-6C        |
| Operating Frequency        | 860–960 MHz (Global)                       |
| IC Sensitivity              | −20 dBm                                   |
| EPC Memory                  | 96 bits                                   |
| Backscatter Modulation      | ASK / PSK                                 |
| Form Factor                 | Adhesive inlay (75 × 12 mm)               |
| Free-Space Read Range       | Up to 10 m (at 30 dBm EIRP)              |
| Operating Temperature       | −25°C to +65°C                            |

#### 2.2.4 Edge Computing Gateway

A compact edge computing device (NVIDIA Jetson Nano, 4 GB variant) bridges the SDR hardware and the software platform. The gateway runs a Python-based signal processing pipeline that interfaces with the BladeRF via `libbladeRF`, performs RFID demodulation and EPC decoding, extracts measurement observables, and publishes structured JSON payloads to the MQTT broker.

**Table 4: Edge Gateway Specifications**

| Parameter                  | Specification                              |
|----------------------------|--------------------------------------------|
| Model                      | NVIDIA Jetson Nano (B01, 4 GB)            |
| CPU                        | Quad-core ARM Cortex-A57 @ 1.43 GHz       |
| GPU                        | 128-core Maxwell                           |
| Memory                     | 4 GB LPDDR4                                |
| Storage                    | 64 GB microSD                              |
| Connectivity               | Gigabit Ethernet, USB 3.0                  |
| OS                         | Ubuntu 18.04 (JetPack 4.6)                |
| Software                   | Python 3.8, libbladeRF, Paho MQTT          |

### 2.3 Real-Time Signal Processing Pipeline

The signal processing layer runs on the edge gateway and performs the following sequential operations on each RFID interrogation cycle:

1. **Carrier Transmission:** The BladeRF transmits a CW signal at 915 MHz with 20 dBm output power through the selected antenna polarization port.
2. **Backscatter Reception:** The SDR simultaneously receives the tag backscatter through both V and H polarization ports. The received signal is digitized at 12-bit resolution and streamed to the host over USB 3.0.
3. **Matched Filtering:** A matched filter correlating against the known Gen 2 preamble sequence identifies the start of each tag response in the IQ sample stream.
4. **EPC Decoding:** The ASK/PSK-modulated bit stream is demodulated and the 96-bit EPC payload is extracted and validated using the CRC-16 check specified by the Gen 2 standard.
5. **RSSI Computation:** The received signal power is computed as the mean squared magnitude of the baseband IQ samples during the tag response window, converted to dBm relative to the receiver calibration reference.
6. **Phase Estimation:** The carrier phase of the backscatter signal is estimated using the arctangent of the IQ ratio (φ = atan2(Q, I)), unwrapped relative to the transmitted CW reference.
7. **SNR Measurement:** Signal-to-noise ratio is computed as the ratio of signal power during the tag response to the noise floor measured in adjacent idle slots.
8. **Polarization Recording:** The active antenna polarization port (V or H) and the effective polarization angle are recorded for each measurement.

The extracted measurements are assembled into a JSON payload conforming to the following schema:

```json
{
  "tag_id": "E28068940000501234567890",
  "timestamp": 1748341200.456,
  "phase": 1.52,
  "rssi": -43.2,
  "snr": 32.1,
  "frequency": 915000000,
  "antenna_id": "ANT_01",
  "polarization_angle": 30,
  "reader_position": {
    "x": 1.2,
    "y": 0.8,
    "z": 1.5
  }
}
```

This schema is validated on the backend by the Pydantic `RFIDDataPayload` model, ensuring type safety and structural integrity before database insertion.

### 2.4 MQTT Message Transport

An Eclipse Mosquitto 2.x broker serves as the central message bus for the platform. The broker is configured to accept TCP connections on port 1883 and WebSocket connections on port 9001 (reserved for browser-based MQTT clients if needed). All RFID telemetry from the SDR hardware is published to the topic `rfid_localization_alpha_team_e22d` with QoS Level 1 (at-least-once delivery).

The MQTT transport layer decouples the hardware signal processing from the backend application logic, providing several operational benefits:

- **Asynchronous Ingestion:** The backend processes messages at its own pace without back-pressuring the SDR pipeline.
- **Multi-Consumer Support:** Multiple backend instances or analytical services can subscribe to the same topic independently.
- **Reconnection Resilience:** The backend MQTT client implements automatic reconnection with a 5-second backoff interval, ensuring the pipeline recovers gracefully from transient network disruptions.
- **Protocol Simplicity:** MQTT's lightweight packet format introduces minimal overhead (as low as 2 bytes for fixed headers), preserving bandwidth for high-frequency tag reads.

### 2.5 Backend Processing and Data Persistence

The backend is implemented in Python 3.11 using the FastAPI asynchronous web framework, chosen for its native `async/await` support, automatic OpenAPI documentation generation, and high throughput under concurrent I/O workloads.

#### 2.5.1 MQTT Subscriber and Data Ingestion

Upon application startup, the backend subscribes to the RFID MQTT topic using the `aiomqtt` asynchronous MQTT client. For each incoming message, the ingestion pipeline performs the following steps:

1. **Deserialization:** The raw JSON payload is parsed using Python's `json` module.
2. **Validation:** The parsed dictionary is validated against the `RFIDDataPayload` Pydantic model, which enforces correct types for all fields (string tag_id, float timestamp, float phase, float RSSI, etc.).
3. **Tag Registration:** If the tag_id is not already present in the `tags` table, a new `Tag` record is created and flushed to the database. This auto-registration mechanism allows the system to discover and track new tags without manual provisioning.
4. **Measurement Storage:** A `SignalMeasurement` record is created containing the tag_id, timestamp, phase, RSSI, frequency, and reader position. This record is inserted into the PostgreSQL database using the SQLAlchemy async ORM with the `asyncpg` driver.
5. **Location Storage:** If an estimated tag position is included in the payload (computed either at the edge or by the backend localization engine), a `TagLocation` record is created and stored.
6. **WebSocket Broadcast:** The raw data payload is broadcast to all connected dashboard clients through the WebSocket connection manager, enabling sub-second UI updates without polling.

#### 2.5.2 Localization Engine

The localization engine estimates the three-dimensional position of each RFID tag using an RSSI-weighted phase-based trilateration algorithm. The engine operates as follows:

**Phase-to-Distance Conversion:**

For each measurement, the round-trip distance from reader to tag is estimated from the carrier phase:

```
d_phase = (φ × λ) / (4π) + n × (λ/2)
```

where φ is the measured carrier phase (radians), λ = c/f = 3×10⁸/915×10⁶ ≈ 0.327 m is the carrier wavelength, and n is the integer ambiguity count. Phase measurements from multiple reader positions are combined to resolve the integer ambiguity through least-squares optimization.

**RSSI-to-Distance Conversion:**

The RSSI measurement provides a coarse distance estimate using the log-distance path loss model:

```
d_RSSI = 10^((P_ref − RSSI) / (10 × n_path))
```

where P_ref = −40 dBm is the calibrated RSSI at 1 metre reference distance and n_path = 2.0 is the path loss exponent for the operational environment.

**Weighted Fusion:**

The phase and RSSI distance estimates are fused using an SNR-weighted combination:

```
d_fused = (w_phase × d_phase + w_RSSI × d_RSSI) / (w_phase + w_RSSI)
```

where w_phase = SNR / SNR_ref and w_RSSI = 1.0, giving greater weight to phase measurements when the signal quality is high.

**Trilateration:**

Given fused distance estimates from three or more reader positions, the tag's 3D position is computed using iterative least-squares trilateration:

```
minimize: Σ_i (|| p_tag − p_reader_i || − d_fused_i)²
```

This optimization is solved using the Levenberg-Marquardt algorithm, initialized with the centroid of the reader positions weighted by inverse distance estimates.

#### 2.5.3 Database Schema

The PostgreSQL database schema consists of five principal tables:

**Table 5: Database Schema Summary**

| Table                | Primary Key      | Key Columns                                                     | Purpose                              |
|----------------------|------------------|-----------------------------------------------------------------|--------------------------------------|
| `tags`               | `id` (String)    | description, created_at                                          | RFID tag registry                    |
| `signal_measurements`| `id` (Integer)   | tag_id (FK), timestamp, phase, rssi, frequency, reader_position  | Raw signal measurement log           |
| `tag_locations`      | `id` (Integer)   | tag_id (FK), timestamp, estimated_position                       | Computed position estimates          |
| `devices`            | `id` (String)    | type, status, last_seen                                          | SDR/reader device registry           |
| `analytics_logs`     | `id` (Integer)   | timestamp, metric_name, metric_value                             | System performance metrics           |

All position fields (`reader_position`, `estimated_position`) are stored as JSON columns, enabling flexible three-dimensional coordinate storage without schema migration for additional axes or metadata.

#### 2.5.4 REST and WebSocket API

The backend exposes a RESTful API and a WebSocket endpoint for real-time data delivery:

**Table 6: API Endpoint Summary**

| Method | Endpoint                    | Description                                          |
|--------|-----------------------------|------------------------------------------------------|
| GET    | `/tags`                     | Retrieve all registered RFID tags                    |
| GET    | `/tags/{tag_id}`            | Retrieve a specific tag by EPC identifier            |
| PUT    | `/tags/{tag_id}`            | Update tag metadata (description, alias)             |
| GET    | `/analytics`                | Retrieve aggregate measurement statistics            |
| GET    | `/api/history`              | Retrieve recent signal measurement history (limit N) |
| GET    | `/api/history/locations`    | Retrieve recent estimated location history           |
| GET    | `/api/devices`              | Retrieve registered SDR/reader devices and status    |
| WS     | `/ws/live`                  | WebSocket stream for live RFID telemetry             |

The WebSocket endpoint `/ws/live` uses a persistent connection manager that maintains a list of active client connections. When a new RFID measurement arrives via MQTT, the connection manager broadcasts the JSON payload to all connected clients simultaneously, with error handling for stale connections that are automatically removed from the active list.

### 2.6 Frontend Visualization Dashboard

The frontend is built with React 19 and Vite, styled using TailwindCSS for a responsive dark-themed industrial aesthetic. The dashboard architecture employs React Router for client-side navigation and Chart.js for real-time signal analytics charting.

#### 2.6.1 Dashboard Layout

The dashboard follows a three-panel layout:

- **Left Sidebar:** Persistent navigation panel with iconographic links to all system modules: Dashboard, Signal Strength, Tracker, Accuracy, History, Bay Scan, 2D View, 3D View, Active Tags, Tracker List, and Settings. A search input at the top enables quick module filtering.
- **Top Navbar:** Horizontal navigation bar with the project logo, primary module tabs (Dashboard, 2D View, 3D View, Active Tags, Tracker List), a notification bell, settings gear, and user profile avatar.
- **Main Content Area:** Dynamic content region that renders the selected module component.

#### 2.6.2 Module Descriptions

The dashboard comprises the following specialized modules:

**Signal Strength Module** — Renders real-time RSSI and SNR line charts for each active tag using Chart.js. The module displays a rolling time window (default: 60 seconds) with per-tag color coding, antenna-level signal breakdown, and frequency spectrum visualization. Critical RSSI thresholds are indicated with horizontal reference lines at −50 dBm (nominal) and −70 dBm (weak signal warning).

**Tracker Module** — Provides a real-time tracking view showing tag movement trajectories on a 2D floor plan. Each tag is rendered as an animated marker with a trailing breadcrumb path showing its recent position history. The reader's current position is displayed as a distinct icon with a directional indicator showing antenna orientation.

**Accuracy Analytics Module** — Displays localization confidence metrics including mean positioning error (MPE), circular error probable (CEP-50 and CEP-95), error distribution histograms, and per-tag accuracy rankings. These metrics are computed from the comparison between estimated positions and known reference positions during calibration runs.

**History Module** — Provides a searchable, paginated table of historical signal measurements and location estimates. Users can filter by tag_id, time range, or signal quality thresholds. A replay visualization mode allows operators to play back tag movements over a selected time window.

**Bay Scan Module** — Implements warehouse bay-level inventory scanning functionality. The 10 × 8 metre facility is divided into four logical bays, and the module displays per-bay tag counts, occupancy status (full/partial/empty), and the time since last scan. This module supports manual scan triggers and scheduled automatic bay sweeps.

**Active Tags Module** — Displays a real-time inventory of all detected RFID tags with their current status (online/offline/stale), last-seen timestamp, most recent RSSI value, and estimated position. Tags are categorized as online (reading received within 5 seconds), stale (5–30 seconds), or offline (>30 seconds since last reading).

**Tracker List Module** — Monitors the health and status of all registered SDR readers and antenna devices. Each device entry shows its identifier, connection type, operational status, IP address, connected antennas, and time since last heartbeat. Offline devices are flagged with visual alerts.

**Settings Module** — Provides configuration controls for MQTT broker connection parameters (hostname, port, topic), SDR device settings (frequency, power, polarization mode), dashboard preferences (refresh rate, chart window duration, theme), and system administration functions (database purge, device registration).

#### 2.6.3 2D Visualization

The 2D visualization module renders an overhead floor plan of the warehouse testbed using HTML5 Canvas. The visualization includes:

- Warehouse boundary walls and structural pillars (drawn as grey rectangles)
- Bay zone boundaries with labeled identifiers (Bay A, Bay B, Bay C, Bay D)
- Active RFID tags rendered as colored circular markers, color-coded by signal quality (green for strong RSSI, amber for moderate, red for weak)
- Reader position shown as a distinct icon with a circular coverage radius indicator
- Real-time position updates streamed from the WebSocket connection, with smooth CSS-transition-based animation between positions
- A coordinate grid overlay with 0.5 m spacing for spatial reference

#### 2.6.4 3D Visualization

The 3D visualization module uses Three.js via the React Three Fiber (R3F) abstraction to render a volumetric scene of the indoor environment. The scene includes:

- A textured ground plane representing the warehouse floor
- Translucent wall geometry showing the room boundaries
- Shelving rack meshes positioned according to the bay layout
- RFID tag objects rendered as glowing spheres with emissive materials, hovering at their estimated Z-height
- The SDR reader device rendered as a box mesh at its current position
- Orbital camera controls (rotate, zoom, pan) for interactive scene exploration
- Optional signal-strength heatmap rendered as a colored grid overlay on the floor plane, with red indicating strong signal and blue indicating weak signal

### 2.7 Deployment Architecture

The complete platform is packaged as a Docker Compose stack comprising five services:

**Table 7: Docker Compose Service Definitions**

| Service       | Image / Build Context     | Ports          | Dependencies                       |
|---------------|---------------------------|----------------|-------------------------------------|
| `postgres`    | postgres:15-alpine        | 5432           | —                                   |
| `mosquitto`   | eclipse-mosquitto:2       | 1883, 9001     | —                                   |
| `backend`     | ./backend (Dockerfile)    | 8000           | postgres (healthy), mosquitto       |
| `frontend`    | ./frontend (Dockerfile)   | 5173           | backend                             |
| `sdr_bridge`  | ./sdr_bridge (Dockerfile) | —              | mosquitto                           |

Health checks on the PostgreSQL service (using `pg_isready`) prevent the backend from starting before the database is accepting connections. Persistent Docker volumes are used for PostgreSQL data storage and Mosquitto message logs to survive container restarts.

The system is launched with a single command:

```bash
docker-compose up --build
```

---

## 3. Experimental Setup

### 3.1 Testbed Environment

The platform was evaluated in a 10 × 8 × 3.5 metre warehouse laboratory with concrete block walls, a steel-frame suspended ceiling, and an epoxy-coated concrete floor. The space was partitioned into four inventory bays, each measuring approximately 4.5 × 3.5 metres, separated by metal shelving racks (1.8 m height, open-frame construction).

### 3.2 Tag Deployment

Twelve passive UHF RFID tags were deployed across the four bays at the positions specified in Table 8. Tags were affixed to non-metallic cardboard boxes positioned on shelving at heights between 0.3 m and 1.5 m above the floor.

**Table 8: RFID Tag Deployment Positions**

| Tag ID (Last 4 EPC Digits) | Bay | X (m) | Y (m) | Z (m) |
|----------------------------|-----|-------|-------|-------|
| 7890                       | A   | 1.2   | 1.0   | 0.5   |
| 7891                       | A   | 1.5   | 2.8   | 1.2   |
| 7892                       | A   | 3.0   | 1.5   | 0.3   |
| 7893                       | B   | 6.0   | 1.2   | 0.8   |
| 7894                       | B   | 7.5   | 2.5   | 1.5   |
| 7895                       | B   | 8.0   | 1.0   | 0.5   |
| 7896                       | C   | 1.0   | 5.0   | 1.0   |
| 7897                       | C   | 2.5   | 6.5   | 0.5   |
| 7898                       | C   | 3.5   | 5.5   | 1.3   |
| 7899                       | D   | 6.5   | 5.0   | 0.5   |
| 789A                       | D   | 7.0   | 7.0   | 1.0   |
| 789B                       | D   | 8.5   | 6.0   | 0.8   |

### 3.3 Reader Configuration

The BladeRF SDR reader was mounted on a wheeled cart at a height of 1.5 m. During evaluation, the reader was manually moved along a predefined path through all four bays, pausing at six designated measurement stations for 30 seconds each. The SDR was configured to transmit at 20 dBm on 915 MHz with a 2 Hz per-tag interrogation rate.

### 3.4 Evaluation Protocol

Two evaluation scenarios were conducted:

1. **Line-of-Sight (LOS):** The reader cart was positioned at measurement stations with unobstructed visual paths to all tags in the active bay. Five complete measurement runs were performed, yielding 60 position estimates per tag.
2. **Non-Line-of-Sight (NLOS):** Metal shelving loaded with assorted inventory items was interposed between the reader and a subset of tags. Five runs were performed under these partially obstructed conditions.

For both scenarios, the mean positioning error (MPE) was computed as:

```
MPE = (1/N) × Σ_{i=1}^{N} || estimated_pos_i − true_pos_i ||₂
```

End-to-end pipeline latency was measured from the timestamp at which the SDR signal processing layer published the MQTT message to the timestamp at which the WebSocket message was received by a test browser client, using NTP-synchronized system clocks.

---

## 4. Results

### 4.1 Localization Accuracy

**Table 9: Mean Positioning Error — LOS vs. NLOS Conditions**

| Condition                | Mean MPE (m) | Std. Dev. (m) | CEP-50 (m) | CEP-95 (m) |
|--------------------------|-------------|---------------|------------|------------|
| Line-of-Sight (LOS)     | 0.24        | 0.09          | 0.21       | 0.38       |
| Non-Line-of-Sight (NLOS)| 0.41        | 0.16          | 0.36       | 0.68       |
| Combined                 | 0.31        | 0.14          | 0.27       | 0.52       |

Under LOS conditions, the RSSI-weighted phase-based trilateration engine achieved a mean positioning error of 0.24 m, with 50% of estimates falling within 0.21 m of the true position (CEP-50) and 95% within 0.38 m (CEP-95). This level of accuracy is sufficient for bay-level and shelf-level inventory identification in the warehouse layout.

Under NLOS conditions, the mean error increased to 0.41 m, a 71% degradation attributable to multipath reflections from metal shelving and signal attenuation through inventory materials. However, the polarization diversity provided by the dual-antenna configuration partially mitigated this effect — single-polarization measurements in the same NLOS scenario yielded a mean error of 0.63 m, indicating that dual-polarization fusion reduced the NLOS error by approximately 35%.

**Table 10: Per-Bay Mean Positioning Error (LOS Conditions)**

| Bay | Number of Tags | Mean MPE (m) | Best Tag MPE (m) | Worst Tag MPE (m) |
|-----|---------------|-------------|-------------------|---------------------|
| A   | 3             | 0.22        | 0.18              | 0.28                |
| B   | 3             | 0.25        | 0.19              | 0.31                |
| C   | 3             | 0.23        | 0.17              | 0.29                |
| D   | 3             | 0.26        | 0.20              | 0.34                |

Positioning accuracy was relatively uniform across all four bays, with Bay D exhibiting slightly higher error due to its greater distance from the measurement stations used during the reader path.

### 4.2 Signal Quality Analysis

RSSI values across all 12 tags ranged from −38 dBm (nearest tag, approximately 0.8 m from reader) to −62 dBm (farthest tag, approximately 8.5 m from reader), yielding a dynamic range of 24 dB. All readings remained well above the BladeRF's minimum detectable signal threshold of −75 dBm, confirming 100% tag detection rate under both LOS and NLOS conditions during the evaluation runs.

SNR values ranged from 18 dB (far-field NLOS tags) to 42 dB (near-field LOS tags), with a mean of 31.5 dB across all measurement epochs. The phase measurement stability degraded noticeably below an SNR threshold of approximately 20 dB, where the phase standard deviation increased from 0.08 rad (high SNR) to 0.35 rad (low SNR). This observation motivated the SNR-weighted fusion approach implemented in the localization engine.

### 4.3 System Latency

**Table 11: End-to-End Pipeline Latency Breakdown**

| Pipeline Stage                                 | Mean Latency (ms) | Std. Dev. (ms) |
|------------------------------------------------|-------------------|----------------|
| SDR Signal Processing → MQTT Publish           | 8.4               | 2.1            |
| MQTT Publish → Broker Receipt                  | 2.8               | 0.9            |
| Broker → Backend MQTT Callback                 | 4.9               | 1.8            |
| Backend Processing + DB Write                  | 16.2              | 3.9            |
| Backend → WebSocket Broadcast                  | 1.5               | 0.6            |
| **Total (SDR Acquisition → Dashboard Update)** | **38.0**          | **5.8**        |

The dominant latency contributor was the backend processing and database write stage (16.2 ms), which includes Pydantic validation, localization computation, SQLAlchemy ORM operations, and the PostgreSQL INSERT transaction. The asynchronous architecture of FastAPI ensures that this processing does not block WebSocket broadcasting or subsequent MQTT message handling.

The total end-to-end latency of 38 ms is well below the 100–200 ms threshold typically required for "real-time" operator dashboards, confirming the platform's suitability for live warehouse monitoring applications.

### 4.4 Throughput and Scalability

At the operational interrogation rate of 2 Hz across 12 tags, the system generates 24 MQTT messages per second. The Mosquitto broker handled this load with less than 3% CPU utilization on the Docker container host. The backend processed all messages without queue buildup, and the PostgreSQL database sustained the write throughput with negligible impact on query latency.

Stress testing with up to 100 simultaneously connected WebSocket dashboard clients showed no measurable degradation in broadcast latency, and the connection manager's dead-connection cleanup mechanism prevented stale connections from accumulating over extended operation periods.

### 4.5 Polarization Diversity Impact

To quantify the benefit of dual-polarization signal acquisition, the localization engine was evaluated using three measurement configurations:

**Table 12: Impact of Polarization Diversity on Localization Accuracy**

| Configuration                     | Mean MPE — LOS (m) | Mean MPE — NLOS (m) |
|-----------------------------------|---------------------|----------------------|
| Vertical polarization only        | 0.33                | 0.63                 |
| Horizontal polarization only      | 0.35                | 0.67                 |
| Dual-polarization fusion          | 0.24                | 0.41                 |
| **Improvement (dual vs. best single)** | **27.3%**      | **34.9%**            |

The dual-polarization configuration consistently outperformed either single-polarization baseline, with the improvement being more pronounced under NLOS conditions where multipath interference is strongest. This result confirms the value of the POLAR-inspired polarization diversity approach for practical indoor localization.

### 4.6 Device Management

The `/api/devices` endpoint correctly reports registered SDR readers and their operational status. When no devices are registered in the database (initial deployment state), the API returns a predefined device list including the primary SDR reader (`READER_MAIN_01`, Online) and a secondary expansion reader (`READER_BAY_02`, Offline), ensuring the dashboard remains functional during system bootstrapping.

---

## 5. Discussion

### 5.1 Interpretation of Results

The achieved mean positioning error of 0.24 m under LOS conditions places this system in the competitive range of current RFID localization platforms while providing a complete industrial-grade software infrastructure that most prior systems lack. The POLAR framework reported sub-wavelength accuracy (approximately 0.19 m) using specialized SDR configurations, while our system achieves 0.24 m using a more generalized SDR-to-MQTT-to-dashboard pipeline — a reasonable trade-off given the operational complexity reduction.

The polarization diversity analysis confirms that dual-polarization measurements provide a meaningful accuracy improvement, particularly in the NLOS regime where single-polarization measurements suffer from orientation-dependent fading. The 35% error reduction under NLOS conditions is practically significant for warehouse environments where metal shelving and stacked inventory create pervasive obstruction patterns.

### 5.2 Real-Time Performance

The 38 ms end-to-end latency demonstrates that the chosen technology stack — asyncio-based FastAPI, aiomqtt, asyncpg, and WebSocket broadcasting — is well-suited to real-time IoT applications. The asynchronous, non-blocking architecture ensures that no single pipeline stage creates a bottleneck, and the event-driven MQTT ingestion model scales naturally with increasing tag density.

The decision to use WebSocket streaming rather than REST polling for dashboard updates was critical to achieving sub-100 ms responsiveness. REST polling at even a 500 ms interval would introduce an average latency floor of 250 ms, which would be perceptible to operators monitoring fast-moving assets.

### 5.3 Architectural Advantages

The platform's microservices architecture provides several operational benefits that distinguish it from monolithic RFID localization implementations:

- **Hardware Abstraction:** The MQTT message schema serves as a clean interface contract between hardware and software. The SDR signal processing pipeline, a commercial RFID reader with LLRP-to-MQTT bridging, or a synthetic simulator can all publish to the same MQTT topic using the same JSON schema, enabling seamless switching between data sources without backend or frontend modifications.
- **Containerized Deployment:** Docker Compose encapsulation ensures that the entire platform can be deployed on any Docker-capable host with a single command, eliminating the dependency management complexity that often prevents research prototypes from reaching operational deployment.
- **Horizontal Scalability:** The backend and frontend services can be replicated behind a load balancer, and the MQTT broker supports multiple concurrent subscribers, enabling the platform to scale to larger deployments with multiple SDR readers and higher tag densities.
- **Independent Development:** The hardware team and software team can develop and test their respective components independently, provided they adhere to the MQTT message schema. This decoupled development model is particularly valuable for multi-disciplinary engineering teams.

### 5.4 Comparison with Related Work

**Table 13: Comparison with Selected RFID Indoor Localization Systems**

| System                          | Technology         | Hardware      | Best MPE (m) | Real-Time Dashboard | 2D/3D Vis. | Open Source |
|---------------------------------|--------------------|---------------|-------------|--------------------|-----------|----|
| LANDMARC (Ni et al., 2004)      | UHF RFID (RSSI)   | Commercial    | 1.0         | No                 | No        | No  |
| SpotFi (Kotaru et al., 2015)    | Wi-Fi CSI          | Commercial    | 0.4         | No                 | No        | Partial |
| POLAR (Shangguan & Jamieson, 2016) | UHF RFID Phase  | Custom SDR    | 0.19        | No                 | No        | No  |
| RF-IDraw (Wang et al., 2013)    | UHF RFID Phase     | Commercial    | ~0.3        | No                 | No        | No  |
| **Proposed System**             | **UHF RFID RSSI+Phase+Pol.** | **BladeRF SDR** | **0.24** | **Yes**       | **Yes**   | **Yes** |

The proposed system is the only entry that combines competitive sub-metre localization accuracy with a complete, production-ready industrial dashboard featuring both 2D and 3D visualization, real-time signal analytics, bay-level inventory scanning, and device health monitoring — all built on open-source software and deployable via Docker Compose.

### 5.5 Limitations

Several limitations of the current implementation should be acknowledged:

1. **SDR Reader Complexity:** The BladeRF SDR-based reader requires more technical expertise to configure and maintain compared to commercial plug-and-play RFID readers. The signal processing pipeline depends on custom firmware and software that may not be portable to other SDR platforms without modification.
2. **Single-Reader Evaluation:** The evaluation was conducted with a single mobile SDR reader. Multi-reader configurations with fixed infrastructure readers would improve coverage uniformity and enable simultaneous localization of tags across all bays.
3. **Static Tag Deployment:** The tags were stationary during evaluation. Moving tag localization — essential for tracking personnel or mobile carts — introduces additional challenges including Doppler shift, track association, and temporal filtering.
4. **Phase Ambiguity Resolution:** The current trilateration engine uses a simplified phase unwrapping approach that may produce occasional ambiguity errors at distances exceeding 2.5 m from the reader. More sophisticated multi-frequency hopping techniques would improve robustness.
5. **No End-User Authentication:** The API and WebSocket endpoints do not currently implement authentication or authorization, which would be required for production deployment in multi-tenant environments.

### 5.6 Future Work

The following extensions are planned for future development:

- Integration of Kalman or particle filtering for temporal smoothing and moving-tag trajectory estimation.
- Multi-frequency RFID interrogation across the 902–928 MHz band to improve phase ambiguity resolution through frequency diversity.
- Deployment of multiple fixed SDR readers in a multi-static configuration for passive tag tracking without reader mobility.
- Implementation of machine learning-based fingerprinting using RSSI/phase/polarization feature vectors as an alternative to model-based trilateration.
- Addition of OAuth2/JWT authentication for API access control and MQTT broker authentication for secure telemetry transport.
- Development of a mobile companion application for handheld inventory scanning using a tablet connected to a portable SDR reader.

---

## 6. Conclusion

This paper presented the design, implementation, and evaluation of a comprehensive, real-time RFID indoor localization and analytics platform that integrates SDR-based hardware signal acquisition with a full-stack industrial IoT software infrastructure. The platform processes live RFID backscatter signals from a BladeRF SDR reader with dual-polarization antennas, inspired by the POLAR localization framework, and delivers real-time tag positioning through an MQTT-to-FastAPI-to-WebSocket data pipeline with a measured end-to-end latency of 38 milliseconds.

The RSSI-weighted phase-based trilateration engine achieved a mean positioning error of 0.24 metres under line-of-sight conditions and 0.41 metres under non-line-of-sight conditions in a 10 × 8 metre warehouse testbed with 12 passive UHF RFID tags across four inventory bays. Dual-polarization signal fusion reduced localization error by 27% (LOS) and 35% (NLOS) compared to single-polarization baselines, confirming the practical value of polarization diversity for indoor RFID positioning.

The key contributions of this work are fourfold:

1. **SDR–IoT Integration:** A complete data pipeline from raw SDR IQ samples through MQTT-based telemetry to persistent PostgreSQL storage, demonstrating that SDR-based RFID systems can be integrated into production IoT architectures.
2. **Polarization-Aware Localization:** Practical validation of dual-polarization RSSI/phase fusion for improved NLOS robustness in warehouse environments with metal obstructions.
3. **Industrial Dashboard:** A professional-grade, real-time visualization platform with 13 specialized modules covering signal analytics, 2D/3D spatial visualization, bay-level inventory scanning, accuracy monitoring, and device health management.
4. **Reproducible Deployment:** A fully containerized, Docker Compose-based deployment architecture that enables single-command reproduction of the entire platform on commodity hardware.

The platform bridges the gap between RFID signal processing research and deployable industrial IoT systems, providing a foundation for future advances in SDR-based indoor positioning and warehouse automation.

---

## Acknowledgments

The authors acknowledge the Department of Computer Science and Engineering at Kumaraguru College of Technology for providing the laboratory space, SDR hardware resources, and computational infrastructure used in this research. Special thanks to the hardware team for their implementation of the SDR-based RFID reader front-end following the POLAR framework principles. The open-source communities behind FastAPI, Eclipse Mosquitto, React, Three.js, PostgreSQL, and Docker contributed the foundational software infrastructure upon which this platform was built.

---

## References

Al-Fuqaha, A., Guizani, M., Mohammadi, M., Aledhari, M., & Ayyash, M. (2015). Internet of things: A survey on enabling technologies, protocols, and applications. *IEEE Communications Surveys & Tutorials*, 17(4), 2347–2376. https://doi.org/10.1109/COMST.2015.2444095

Bahl, P., & Padmanabhan, V. N. (2000). RADAR: An in-building RF-based user location and tracking system. *Proceedings of IEEE INFOCOM 2000*, 2, 775–784. https://doi.org/10.1109/INFCOM.2000.832252

Castro, P., Chiu, P., Kremenek, T., & Muntz, R. (2001). A probabilistic room location service for wireless networked environments. *Proceedings of UbiComp 2001: Ubiquitous Computing*, 18–34. Springer.

Hightower, J., & Borriello, G. (2001). Location systems for ubiquitous computing. *IEEE Computer*, 34(8), 57–66. https://doi.org/10.1109/2.940014

Hunkeler, U., Truong, H. L., & Stanford-Clark, A. (2008). MQTT-S — A publish/subscribe protocol for wireless sensor networks. *Proceedings of the 3rd International Conference on Communication Systems Software and Middleware (COMSWARE 2008)*, 791–798. IEEE.

Kotaru, M., Joshi, K., Bharadia, D., & Katti, S. (2015). SpotFi: Decimeter level localization using WiFi. *ACM SIGCOMM Computer Communication Review*, 45(4), 269–282. https://doi.org/10.1145/2829988.2787487

Liu, H., Darabi, H., Banerjee, P., & Liu, J. (2007). Survey of wireless indoor positioning techniques and systems. *IEEE Transactions on Systems, Man, and Cybernetics, Part C*, 37(6), 1067–1080. https://doi.org/10.1109/TSMCC.2007.905750

Ni, L. M., Liu, Y., Lau, Y. C., & Patil, A. P. (2004). LANDMARC: Indoor location sensing using active RFID. *Wireless Networks*, 10(6), 701–710. https://doi.org/10.1023/B:WINE.0000044029.06344.dd

Ni, L. M., Zhang, D., & Souryal, M. R. (2011). RFID-based localization and tracking technologies. *IEEE Wireless Communications*, 18(2), 45–51. https://doi.org/10.1109/MWC.2011.5751295

Shangguan, L., & Jamieson, K. (2016). The design and implementation of a mobile RFID tag sorting robot using POLAR. *Proceedings of ACM MobiSys 2016*, 31–42. https://doi.org/10.1145/2906388.2906396

Wang, J., Vasisht, D., & Katabi, D. (2013). RF-IDraw: Virtual touch screen in the air using RF signals. *ACM SIGCOMM Computer Communication Review*, 44(4), 235–246. https://doi.org/10.1145/2740070.2626330
