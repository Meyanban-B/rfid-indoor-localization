class WebSocketService {
    constructor() {
      this.socket = null;
      this.listeners = new Set();
    }
  
    connect(url) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) return;
  
      this.socket = new WebSocket(url);
  
      this.socket.onopen = () => {
        console.log("WebSocket connected");
      };
  
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach((listener) => listener(data));
        } catch (err) {
          console.error("Failed to parse websocket message", err);
        }
      };
  
      this.socket.onclose = () => {
        console.log("WebSocket disconnected. Reconnecting in 5s...");
        setTimeout(() => this.connect(url), 5000);
      };
  
      this.socket.onerror = (err) => {
        console.error("WebSocket error:", err);
      };
    }
  
    subscribe(listener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }
  }
  
  export const wsService = new WebSocketService();
