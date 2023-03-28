import {
  Channel as IChannel,
  ChannelPermissionOverwrite,
  ChannelType,
  Invite,
  Message,
  ReadState,
  Recipient,
  VoiceState,
  Webhook,
} from "@puyodead1/fosscord-api";
import isEqual from "lodash.isequal";
import { action, makeAutoObservable, observable, runInAction } from "mobx";
import { Client } from "../Client";
import Collection from "../util/Collection";

// FIXME: fix this in the server types
type IChannelCustom = Omit<IChannel, "guild" | "parent" | "owner">;

export type CategoryChannel = IChannelCustom & {
  channels: Channel[];
};

export class Channel {
  id: string;
  @observable created_at: string;
  @observable name?: string;
  @observable icon?: string | null;
  @observable type: ChannelType;
  @observable recipients?: Recipient[];
  @observable last_message_id?: string;
  guild_id?: string;
  @observable parent_id: string;
  owner_id?: string;
  @observable last_pin_timestamp?: number;
  @observable default_auto_archive_duration?: number;
  @observable position?: number;
  @observable permission_overwrites?: ChannelPermissionOverwrite[];
  @observable video_quality_mode?: number;
  @observable bitrate?: number;
  @observable user_limit?: number;
  @observable nsfw: boolean = false;
  @observable rate_limit_per_user?: number;
  @observable topic?: string;
  @observable invites?: Invite[];
  @observable retention_policy_id?: string;
  @observable messages?: Message[];
  @observable voice_states?: VoiceState[];
  @observable read_states?: ReadState[];
  @observable webhooks?: Webhook[];
  @observable flags: number = 0;
  @observable default_thread_rate_limit_per_user: number = 0;

  constructor(public readonly client: Client, data: IChannelCustom) {
    this.id = data.id;
    this.created_at = data.created_at;
    this.name = data.name;
    this.icon = data.icon;
    this.type = data.type;
    this.recipients = data.recipients;
    this.last_message_id = data.last_message_id;
    this.guild_id = data.guild_id;
    this.parent_id = data.parent_id;
    this.owner_id = data.owner_id;
    this.last_pin_timestamp = data.last_pin_timestamp;
    this.default_auto_archive_duration = data.default_auto_archive_duration;
    this.position = data.position;
    this.permission_overwrites = data.permission_overwrites;
    this.video_quality_mode = data.video_quality_mode;
    this.bitrate = data.bitrate;
    this.user_limit = data.user_limit;
    this.nsfw = data.nsfw;
    this.rate_limit_per_user = data.rate_limit_per_user;
    this.topic = data.topic;
    this.invites = data.invites;
    this.retention_policy_id = data.retention_policy_id;
    this.messages = data.messages;
    this.voice_states = data.voice_states;
    this.read_states = data.read_states;
    this.webhooks = data.webhooks;
    this.flags = data.flags;
    this.default_thread_rate_limit_per_user =
      data.default_thread_rate_limit_per_user;

    makeAutoObservable(this);
  }

  async sendMessage(data: string | Partial<Message>) {
    // TODO:
  }

  async fetchMessage(id: string) {
    // FIXME: fix in server
    const message = await this.client.api.get(
      `/channels/${this.id}/messages/${id}` as any
    );

    // TODO: add message to cache
  }

  async fetchMessages() {
    // FIXME: fix in server
    const messages = await this.client.api.get(
      `/channels/${this.id}/messages` as any
    );

    // TODO: add messages to cache
  }

  async sendTyping() {
    await this.client.api.post(`/channels/${this.id}/typing/`);
  }

  // TODO: permissions

  @action
  update(data: Partial<IChannelCustom>) {
    const set = (key: keyof IChannelCustom) => {
      if (typeof data[key] !== "undefined" && !isEqual(this[key], data[key])) {
        // @ts-expect-error
        this[key] = data[key];
      }
    };

    const excludedKeys: (keyof IChannelCustom)[] = ["id"];
    for (const key of Object.keys(data)) {
      if (!excludedKeys.includes(key as keyof IChannelCustom))
        set(key as keyof IChannelCustom);
    }
  }
}

export default class ChannelCollection extends Collection<String, Channel> {
  constructor(client: Client) {
    super(client);

    this.create = this.create.bind(this);
  }

  @action
  get(id: string) {
    return super.get(id);
  }

  // FIXME: ???
  async fetch(id: string, fetch = false) {
    if (this.has(id) && !fetch) return this.get(id);
    const channel = await this.client.api.get(`/channels/${id}` as any);

    return this.create(channel);
  }

  create(data: IChannelCustom) {
    if (this.has(data.id)) return this.get(data.id);
    const channel = new Channel(this.client, data);

    runInAction(() => {
      this.set(data.id, channel);
    });

    return channel;
  }
}
