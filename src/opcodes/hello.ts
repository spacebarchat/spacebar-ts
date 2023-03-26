import {
  GatewayHeartbeat,
  GatewayHelloData,
  GatewayOpcodes,
} from "../interfaces/websocket";
import OPCodeEvent from "../OPCodeEvent";
import { WebSocketClient } from "../WebSocket";

export default class extends OPCodeEvent {
  constructor(ws: WebSocketClient) {
    super(ws, GatewayOpcodes.Hello);
  }

  async execute(data: GatewayHelloData) {
    this.ws.heartbeatInterval = setInterval(() => {
      this.ws.send({
        op: GatewayOpcodes.Heartbeat,
        d: this.ws.seq,
      } as GatewayHeartbeat);
    }, data.heartbeat_interval * Math.random());

    // TODO: handle ack timeouts
  }
}
