import DispatchEvent from "../DispatchEvent";
import {
  GatewayDispatchEvents,
  GatewayReadyDispatchData,
} from "../interfaces/websocket";
import { WebSocketClient } from "../WebSocket";

export default class extends DispatchEvent {
  constructor(ws: WebSocketClient) {
    super(ws, GatewayDispatchEvents.Ready);
  }

  async execute(data: GatewayReadyDispatchData) {
    console.log("Ready", data);
  }
}
