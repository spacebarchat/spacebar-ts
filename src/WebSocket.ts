import WebSocket from "isomorphic-ws";
import { Client } from "./Client";
import {
  GatewayIdentify,
  GatewayReceivePayload,
  GatewaySendPayload,
} from "./interfaces/websocket";

export class WebSocketClient {
  client: Client;
  ws?: WebSocket;
  ready: boolean;
  heartbeatInterval?: NodeJS.Timeout;
  timeouts: Record<string, number> = {};
  queue: WebSocket.MessageEvent[] = [];
  processing: boolean = false;

  constructor(client: Client) {
    this.client = client;
    this.ready = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          console.warn("[WS] Already connected");
          throw new Error("Already connected");
        }

        if (!this.client.domainConfig) throw new Error("no domain config");
        if (!this.client.token) throw new Error("no token");

        this.client.emit(
          "debug",
          "[WS] Connecting to",
          this.client.domainConfig.gateway
        );
        this.ws = new WebSocket(this.client.domainConfig.gateway);

        this.ws.on("open", this.open.bind(this));
        this.ws.on("close", this.close.bind(this));
        this.ws.on("error", this.error.bind(this));
        this.ws.on("message", this.message.bind(this));
      } catch (e) {
        console.debug("regect", e);
        reject(e);
      }
    });
  }

  disconnect() {
    clearInterval(this.heartbeatInterval);
    this.ready = false;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.close();
  }

  send(data: GatewaySendPayload) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN)
      throw new Error("Websocket not open");

    this.ws.send(JSON.stringify(data));
  }

  private open() {
    this.client.emit("debug", "[WS] Open");
    this.sendIdentify();
  }

  private close(code: number, reason: Buffer) {
    this.client.emit("debug", "[WS] Close", code, reason.toString());
    this.ready = false;

    Object.keys(this.timeouts)
      .map((k) => this.timeouts[k])
      .forEach(clearTimeout);

    // TODO: handle resume
    // TODO: determine if we should reconnect

    // backOff(() => this.connect()).catch((err: any) => {
    //   console.error("[WS] Error while reconnecting", err);
    // });
  }

  private error(err: Error) {
    console.error("[WS] Error", err);
  }

  private async handleMessage(msg: WebSocket.MessageEvent) {
    const data = msg.data;
    if (typeof data !== "string") return;

    this.client.emit("debug", "[WS] Recieved message: ", data);
    const packet = JSON.parse(data) as GatewayReceivePayload;
    // await this.processPayload(packet);
  }

  private async message(msg: WebSocket.MessageEvent) {
    this.queue.push(msg);

    if (!this.processing) {
      this.processing = true;
      while (this.queue.length > 0) {
        await this.handleMessage(this.queue.shift()!);
      }
      this.processing = false;
    }
  }

  private sendIdentify() {
    this.client.emit("debug", "[WS] Sending Identify Payload");
    this.send({
      op: 2,
      d: {
        token: this.client.token,
        presence: {
          status: "online",
          since: 0,
          afk: false,
        },
        compress: false,
      },
    } as GatewayIdentify);
  }
}
