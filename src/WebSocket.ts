import { User } from "@puyodead1/fosscord-api";
import EventEmitter from "eventemitter3";
import WebSocket from "isomorphic-ws";
import { runInAction } from "mobx";
import { Client } from "./Client";
import {
  GatewayDispatchEvents,
  GatewayHeartbeat,
  GatewayIdentify,
  GatewayOpcodes,
  GatewayReadyDispatchData,
  GatewayReceivePayload,
  GatewaySendPayload,
} from "./interfaces/websocket";

export class WebSocketClient extends EventEmitter {
  ws?: WebSocket;
  ready: boolean;
  heartbeatInterval: number = 0;
  heartbeater?: NodeJS.Timeout;
  timeouts: Record<string, number> = {};
  queue: Buffer[] = [];
  processing: boolean = false;
  initialized = false;
  seq: number = 0;
  heartbeatAcked = false;

  constructor(public readonly client: Client) {
    super();
    this.ready = false;

    this.init();
  }

  init() {
    if (this.initialized) return;
    this.on(GatewayDispatchEvents.Ready, this.onReady.bind(this));

    this.initialized = true;
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.client.emit("warn", "[WS] Already connected");
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

    // this.ws.on("open", this.open.bind(this));
    // this.ws.on("close", this.close.bind(this));
    // this.ws.on("error", this.error.bind(this));
    // this.ws.on("message", this.message.bind(this));
    this.ws.onopen = this.open.bind(this);
    this.ws.onclose = this.close.bind(this);
    this.ws.onerror = this.error.bind(this);
    this.ws.onmessage = this.message.bind(this);
  }

  disconnect() {
    this.stopHeartbeater();
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
  }

  private close(event: WebSocket.CloseEvent) {
    const { code, reason } = event;
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

  private error(event: WebSocket.ErrorEvent) {
    const { error } = event;
    console.error("[WS] Error", error);
    this.client.emit("error", error);
  }

  private async handleMessage(msg: Buffer) {
    const data = msg.toString();

    // this.client.emit("debug", "[WS] Recieved message: ", data);
    const payload = JSON.parse(data) as GatewayReceivePayload;

    switch (payload.op) {
      case GatewayOpcodes.Dispatch:
        this.client.emit("debug", "[WS] Recieved Dispatch Payload", payload.t);
        this.emit(payload.t, payload.d);
        break;

      case GatewayOpcodes.Hello:
        this.heartbeatInterval = payload.d.heartbeat_interval;
        this.client.emit(
          "debug",
          "[WS] Recieved Hello Payload; Interval: " +
            payload.d.heartbeat_interval
        );

        this.sendIdentify();

        const initialTimeout = this.heartbeatInterval * Math.random();
        setTimeout(() => {
          // send the initial heartbeat after heartbeat_interval * jitter
          this.sendHeartbeat();

          // start the heartbeater every heartbeat_interval
          this.startHeartbeater();
        }, initialTimeout);
        break;

      case GatewayOpcodes.Heartbeat:
        this.client.emit("debug", "[WS] Recieved Heartbeat Request");
        this.sendHeartbeat();
        break;

      case GatewayOpcodes.HeartbeatAck:
        this.client.emit("debug", "[WS] Recieved Heartbeat Ack");
        this.heartbeatAcked = true;
        break;
      default:
        console.warn("[WS] Unknown opcode", payload.op);
        break;
    }
  }

  private async message(event: WebSocket.MessageEvent) {
    const msg = event.data as Buffer;
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

  private startHeartbeater() {
    this.client.emit("debug", "[WS] Starting Heartbeater");
    this.heartbeater = setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatInterval);
  }

  private stopHeartbeater() {
    clearInterval(this.heartbeater);
  }

  private sendHeartbeat() {
    if (!this.heartbeatAcked) {
      this.client.emit("debug", "[WS] Heartbeat not acked, reconnecting");
      // TODO: proper cleanup?
      this.disconnect();
      this.connect();
      return;
    }

    this.client.emit("debug", "[WS] Sending Heartbeat");
    this.send({
      op: GatewayOpcodes.Heartbeat,
      d: this.seq,
    } as GatewayHeartbeat);
    this.heartbeatAcked = false;
  }

  // Dispatch event listeners
  private onReady(payload: GatewayReadyDispatchData) {
    const { users, guilds, user, private_channels, relationships } = payload;

    runInAction(() => {
      for (const user of users || []) {
        this.client.users.create(user);
      }

      for (const channel of private_channels || []) {
        this.client.channels.create(channel);
      }

      for (const guild of guilds || []) {
        this.client.guilds.create(guild);
      }
    });

    this.client.user = user as User;
    this.ready = true;
    this.client.emit("ready", payload);
  }
}
