import {
  GatewayDispatchPayload,
  GatewayOpcodes,
} from "../interfaces/websocket";
import OPCodeEvent from "../OPCodeEvent";
import { WebSocketClient } from "../WebSocket";

export default class extends OPCodeEvent {
  constructor(ws: WebSocketClient) {
    super(ws, GatewayOpcodes.Dispatch);
  }

  async execute(payload: GatewayDispatchPayload) {
    console.debug("Dispatch", payload.t);
    this.ws.seq = payload.s;
    this.ws.emit(payload.t, payload.d);
  }
}
