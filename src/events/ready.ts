import { User } from "@puyodead1/fosscord-api";
import { runInAction } from "mobx";
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

  async execute(payload: GatewayReadyDispatchData) {
    const { users, guilds, user, private_channels, relationships } = payload;

    runInAction(() => {
      for (const user of users || []) {
        this.ws.client.users.create(user);
      }

      for (const channel of private_channels || []) {
        this.ws.client.channels.create(channel);
      }

      for (const guild of guilds || []) {
        this.ws.client.guilds.create(guild);
      }
    });

    this.ws.client.user = user as User;
    this.ws.ready = true;
    this.ws.client.emit("ready", payload);
  }
}
