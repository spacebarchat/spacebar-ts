import { User } from "@puyodead1/fosscord-api";
import { runInAction } from "mobx";
import {
  GatewayDispatchEvents,
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
    switch (payload.t) {
      case GatewayDispatchEvents.Ready:
        const { users, guilds, user, private_channels, relationships } =
          payload.d;

        console.log(guilds);

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
        this.ws.client.emit("ready", payload.d);
        break;
    }
  }
}
