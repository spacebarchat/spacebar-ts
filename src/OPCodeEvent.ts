import { GatewayOpcodes } from "./interfaces/websocket";
import { WebSocketClient } from "./WebSocket";

export default abstract class OPCodeEvent {
  constructor(
    public readonly ws: WebSocketClient,
    public opcode: GatewayOpcodes
  ) {}

  abstract execute(...args: any[]): Promise<void>;
}
