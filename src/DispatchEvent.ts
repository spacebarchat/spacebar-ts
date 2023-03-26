import { GatewayDispatchEvents } from "./interfaces/websocket";
import { WebSocketClient } from "./WebSocket";

export default abstract class DispatchEvent {
  constructor(
    public readonly ws: WebSocketClient,
    public event: GatewayDispatchEvents
  ) {}

  abstract execute(...args: any[]): Promise<void>;
}
