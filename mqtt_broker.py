"""
Minimal MQTT 3.1.1 Broker — no external dependencies required.
Supports: CONNECT, CONNACK, SUBSCRIBE, SUBACK, PUBLISH, PINGREQ, PINGRESP, DISCONNECT
QoS 0 only. Sufficient for the RFID localization platform.
"""
import socket
import threading
import struct
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [BROKER] %(message)s")
logger = logging.getLogger("mqtt_broker")

HOST = "0.0.0.0"
PORT = 1883

# {client_id: socket}
clients = {}
# {client_id: [topic1, topic2, ...]}
subscriptions = {}
lock = threading.Lock()


def encode_remaining_length(length):
    result = []
    while True:
        byte = length % 128
        length //= 128
        if length > 0:
            byte |= 0x80
        result.append(byte)
        if length == 0:
            break
    return bytes(result)


def decode_remaining_length(data, offset):
    multiplier = 1
    value = 0
    while True:
        byte = data[offset]
        offset += 1
        value += (byte & 127) * multiplier
        multiplier *= 128
        if not (byte & 128):
            break
    return value, offset


def read_utf8(data, offset):
    length = struct.unpack_from("!H", data, offset)[0]
    offset += 2
    string = data[offset:offset + length].decode("utf-8")
    return string, offset + length


def topic_matches(pattern, topic):
    if pattern == topic:
        return True
    if pattern.endswith("#"):
        prefix = pattern[:-1]
        return topic.startswith(prefix)
    parts_p = pattern.split("/")
    parts_t = topic.split("/")
    if len(parts_p) != len(parts_t):
        return False
    return all(p == t or p == "+" for p, t in zip(parts_p, parts_t))


def send_connack(sock, return_code=0):
    sock.sendall(b"\x20\x02\x00" + bytes([return_code]))


def send_suback(sock, packet_id, qos_list):
    payload = bytes(qos_list)
    remaining = 2 + len(payload)
    sock.sendall(b"\x90" + encode_remaining_length(remaining) +
                 struct.pack("!H", packet_id) + payload)


def send_pingresp(sock):
    sock.sendall(b"\xd0\x00")


def broadcast_publish(topic, payload_bytes, exclude_id=None):
    msg_topic = topic.encode("utf-8")
    topic_len = struct.pack("!H", len(msg_topic))
    variable = topic_len + msg_topic + payload_bytes
    fixed = b"\x30" + encode_remaining_length(len(variable))
    packet = fixed + variable

    with lock:
        dead = []
        for cid, subs in subscriptions.items():
            if cid == exclude_id:
                continue
            if any(topic_matches(s, topic) for s in subs):
                try:
                    clients[cid].sendall(packet)
                except Exception:
                    dead.append(cid)
        for cid in dead:
            clients.pop(cid, None)
            subscriptions.pop(cid, None)


def handle_client(conn, addr):
    client_id = None
    buf = b""
    logger.info(f"New connection from {addr}")
    try:
        while True:
            chunk = conn.recv(4096)
            if not chunk:
                break
            buf += chunk

            while len(buf) >= 2:
                # Parse fixed header
                cmd = buf[0] >> 4
                offset = 1
                remaining, offset = decode_remaining_length(buf, offset)
                total = offset + remaining
                if len(buf) < total:
                    break  # wait for more data

                packet = buf[:total]
                buf = buf[total:]

                if cmd == 1:  # CONNECT
                    _, offset2 = read_utf8(packet, offset)  # protocol name
                    proto_level = packet[offset2]
                    connect_flags = packet[offset2 + 1]
                    offset2 += 4  # skip level, flags, keepalive(2)
                    client_id, offset2 = read_utf8(packet, offset2)
                    with lock:
                        clients[client_id] = conn
                        subscriptions.setdefault(client_id, [])
                    send_connack(conn)
                    logger.info(f"Client connected: {client_id}")

                elif cmd == 8:  # SUBSCRIBE
                    packet_id = struct.unpack_from("!H", packet, offset)[0]
                    pos = offset + 2
                    qos_list = []
                    topics = []
                    while pos < total:
                        topic, pos = read_utf8(packet, pos)
                        qos = packet[pos]; pos += 1
                        topics.append(topic)
                        qos_list.append(min(qos, 0))  # QoS 0 only
                    with lock:
                        subscriptions.setdefault(client_id, []).extend(topics)
                    send_suback(conn, packet_id, qos_list)
                    logger.info(f"{client_id} subscribed to: {topics}")

                elif cmd == 3:  # PUBLISH
                    flags = buf[0] & 0x0F if False else (packet[0] & 0x0F)
                    topic, pos = read_utf8(packet, offset)
                    payload_bytes = packet[pos:total]
                    logger.info(f"PUBLISH → '{topic}' ({len(payload_bytes)} bytes)")
                    broadcast_publish(topic, payload_bytes, exclude_id=None)

                elif cmd == 12:  # PINGREQ
                    send_pingresp(conn)

                elif cmd == 14:  # DISCONNECT
                    logger.info(f"Client disconnected: {client_id}")
                    break

    except Exception as e:
        logger.error(f"Client {client_id} error: {e}")
    finally:
        with lock:
            if client_id:
                clients.pop(client_id, None)
                subscriptions.pop(client_id, None)
        conn.close()
        logger.info(f"Connection closed: {addr}")


def run_broker():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((HOST, PORT))
    server.listen(50)
    logger.info(f"MQTT Broker listening on {HOST}:{PORT}")
    while True:
        conn, addr = server.accept()
        t = threading.Thread(target=handle_client, args=(conn, addr), daemon=True)
        t.start()


if __name__ == "__main__":
    run_broker()
