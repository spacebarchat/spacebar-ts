import {
  Channel,
  ConnectedAccount,
  Guild,
  IdentifySchema,
  Invite,
  Member,
  Message,
  PublicUser,
  ReadState,
  Relationship,
  Role,
  User,
  UserGuildSettings,
  UserSettings,
} from "@puyodead1/spacebar-api";
import { Nullable } from "../util/utils";

// modified from discord.js, strips stuff that spacebar doesn't implement: stages, threads, stickers, voice, presence (no types)

export type PublicMemberKeys =
  | "id"
  | "guild_id"
  | "nick"
  | "roles"
  | "joined_at"
  | "pending"
  | "deaf"
  | "mute"
  | "premium_since";

export type PublicMember = Omit<Pick<Member, PublicMemberKeys>, "roles"> & {
  user: PublicUser;
  roles: string[]; // only role ids not objects
};

export enum GatewayOpcodes {
  Dispatch = 0,
  Heartbeat = 1,
  Identify = 2,
  PresenceUpdate = 3,
  VoiceStateUpdate = 4,
  VoiceServerPing = 5, // ? What is opcode 5?
  Resume = 6,
  Reconnect = 7,
  RequestGuildMembers = 8,
  InvalidSession = 9,
  Hello = 10,
  HeartbeatAck = 11,
  GuildSync = 12,
  DMUpdate = 13,
  LazyRequest = 14,
  LobbyConnect = 15,
  LobbyDisconnect = 16,
  LobbyVoiceStatesUpdate = 17,
  StreamCreate = 18,
  StreamDelete = 19,
  StreamWatch = 20,
  StreamPing = 21,
  StreamSetPaused = 22,
  RequestApplicationCommands = 24,
}

export enum GatewayCloseCodes {
  UnknownError = 4000,
  UnknownOPCode,
  DecodeError,
  NotAuthenticated,
  AuthenticationFailed,
  AlreadyAuthenticated,
  InvalidSession,
  InvalidSeq,
  RateLimited,
  SessionTimedOut,
  InvalidShard,
  ShardingRequired,
  InvalidAPIVersion,
  InvalidIntent,
  DisallowedIntent,
}

export enum GatewayDispatchEvents {
  Ready = "READY",
  Resumed = "RESUMED", // TODO: not implemented in server
  ChannelCreate = "CHANNEL_CREATE",
  ChannelUpdate = "CHANNEL_UPDATE",
  ChannelDelete = "CHANNEL_DELETE",
  ChannelPinsUpdate = "CHANNEL_PINS_UPDATE",
  ChannelRecipientAdd = "CHANNEL_RECIPIENT_ADD",
  ChannelRecipientRemove = "CHANNEL_RECIPIENT_REMOVE",
  GuildCreate = "GUILD_CREATE",
  GuildUpdate = "GUILD_UPDATE",
  GuildDelete = "GUILD_DELETE",
  GuildBanAdd = "GUILD_BAN_ADD",
  GuildBanRemove = "GUILD_BAN_REMOVE",
  GuildEmojUpdate = "GUILD_EMOJI_UPDATE",
  GuildIntegrationsUpdate = "GUILD_INTEGRATIONS_UPDATE",
  GuildMemberAdd = "GUILD_MEMBER_ADD",
  GuildMemberRemove = "GUILD_MEMBER_REMOVE",
  GuildMemberUpdate = "GUILD_MEMBER_UPDATE",
  GuildMemberSpeaking = "GUILD_MEMBER_SPEAKING",
  GuildMembersChunk = "GUILD_MEMBERS_CHUNK",
  GuildMemberListUpdate = "GUILD_MEMBER_LIST_UPDATE",
  GuildRoleCreate = "GUILD_ROLE_CREATE",
  GuildRoleDelete = "GUILD_ROLE_DELETE",
  GuildRoleUpdate = "GUILD_ROLE_UPDATE",
  InviteCreate = "INVITE_CREATE",
  InviteDelete = "INVITE_DELETE",
  MessageCreate = "MESSAGE_CREATE",
  MessageUpdate = "MESSAGE_UPDATE",
  MessageDelete = "MESSAGE_DELETE",
  MessageDeleteBulk = "MESSAGE_DELETE_BULK",
  MessageReactionAdd = "MESSAGE_REACTION_ADD",
  MessageReactionRemove = "MESSAGE_REACTION_REMOVE",
  MessageReactionRemoveAll = "MESSAGE_REACTION_REMOVE_ALL",
  MessageReactionRemoveEmoji = "MESSAGE_REACTION_REMOVE_EMOJI",
  PresenceUpdate = "PRESENCE_UPDATE",
  TypingStart = "TYPING_START",
  UserUpdate = "USER_UPDATE",
  UserDelete = "USER_DELETE",
  WebhooksUpdate = "WEBHOOKS_UPDATE",
  InteractionCreate = "INTERACTION_CREATE",
  VoiceStateUpdate = "VOICE_STATE_UPDATE",
  VoiceServerUpdate = "VOICE_SERVER_UPDATE",
  ApplicationCommandCreate = "APPLICATION_COMMAND_CREATE",
  ApplicationCommandUpdate = "APPLICATION_COMMAND_UPDATE",
  ApplicationCommandDelete = "APPLICATION_COMMAND_DELETE",
  SessionsReplace = "SESSIONS_REPLACE",
}

interface BasePayload {
  /**
   * Opcode for the payload
   */
  op: GatewayOpcodes;
  /**
   * Event data
   */
  d?: unknown;
  /**
   * Sequence number, used for resuming sessions and heartbeats
   */
  s: number;
  /**
   * The event name for this payload
   */
  t?: string;
}

type NonDispatchPayload = Omit<BasePayload, "t" | "s"> & {
  t: null;
  s: null;
};

interface DataPayload<Event extends GatewayDispatchEvents, D = unknown>
  extends BasePayload {
  op: GatewayOpcodes.Dispatch;
  t: Event;
  d: D;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#hello
 */
export interface GatewayHello extends NonDispatchPayload {
  op: GatewayOpcodes.Hello;
  d: GatewayHelloData;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#hello
 */
export interface GatewayHelloData {
  /**
   * The interval (in milliseconds) the client should heartbeat with
   */
  heartbeat_interval: number;
}

/**
 * https://discord.com/developers/docs/topics/gateway#sending-heartbeats
 */
export interface GatewayHeartbeatRequest extends NonDispatchPayload {
  op: GatewayOpcodes.Heartbeat;
  d: never;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#heartbeat
 */
export interface GatewayHeartbeatAck extends NonDispatchPayload {
  op: GatewayOpcodes.HeartbeatAck;
  d: never;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#invalid-session
 */
export interface GatewayInvalidSession extends NonDispatchPayload {
  op: GatewayOpcodes.InvalidSession;
  d: GatewayInvalidSessionData;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#invalid-session
 */
export type GatewayInvalidSessionData = boolean;

/**
 * https://discord.com/developers/docs/topics/gateway-events#reconnect
 */
export interface GatewayReconnect extends NonDispatchPayload {
  op: GatewayOpcodes.Reconnect;
  d: never;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#ready
 */
export type GatewayReadyDispatch = DataPayload<
  GatewayDispatchEvents.Ready,
  GatewayReadyDispatchData
>;

export interface GatewayReadyDispatchData {
  v: number;
  user: PublicUser & {
    mobile: boolean;
    desktop: boolean;
    email: string | undefined;
    flags: string;
    mfa_enabled: boolean;
    nsfw_allowed: boolean;
    phone: string | undefined;
    premium: boolean;
    premium_type: number;
    verified: boolean;
    bot: boolean;
  };
  private_channels: Channel[]; // this will be empty for bots
  session_id: string; // resuming
  guilds: Guild[];
  analytics_token?: string;
  connected_accounts?: ConnectedAccount[];
  consents?: {
    personalization?: {
      consented?: boolean;
    };
  };
  country_code?: string; // e.g. DE
  friend_suggestion_count?: number;
  geo_ordered_rtc_regions?: string[]; // ["europe","russie","india","us-east","us-central"]
  experiments?: [number, number, number, number, number][];
  guild_experiments?: [
    // ? what are guild_experiments?
    // this is the structure of it:
    number,
    null,
    number,
    [[number, { e: number; s: number }[]]],
    [number, [[number, [number, number]]]],
    { b: number; k: bigint[] }[]
  ][];
  guild_join_requests?: unknown[]; // ? what is this? this is new
  shard?: [number, number];
  user_settings?: UserSettings;
  relationships?: Relationship[]; // TODO: private relationship type
  read_state: {
    entries: ReadState[]; // TODO
    partial: boolean;
    version: number;
  };
  user_guild_settings?: {
    entries: UserGuildSettings[];
    version: number;
    partial: boolean;
  };
  application?: {
    id: string;
    flags: number;
  };
  merged_members?: PublicMember[][];
  // probably all users who the user is in contact with
  users?: PublicUser[];
  sessions: unknown[];
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#resumed
 */
export type GatewayResumedDispatch = DataPayload<
  GatewayDispatchEvents.Resumed,
  never
>;

/**
 * https://discord.com/developers/docs/topics/gateway-events#guild-member-add
 */
export type GatewayGuildMemberAddDispatch = DataPayload<
  GatewayDispatchEvents.GuildMemberAdd,
  GatewayGuildMemberAddDispatchData
>;

/**
 * https://discord.com/developers/docs/topics/gateway-events#guild-member-add
 */
export interface GatewayGuildMemberAddDispatchData extends PublicMember {
  /**
   * The id of the guild
   */
  guild_id: string;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#guild-member-remove
 */
export type GatewayGuildMemberRemoveDispatch = DataPayload<
  GatewayDispatchEvents.GuildMemberRemove,
  GatewayGuildMemberRemoveDispatchData
>;

/**
 * https://discord.com/developers/docs/topics/gateway-events#guild-member-remove
 */
export interface GatewayGuildMemberRemoveDispatchData {
  /**
   * The id of the guild
   */
  guild_id: string;
  /**
   * The user who was removed
   *
   * See https://discord.com/developers/docs/resources/user#user-object
   */
  user: User;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#guild-member-update
 */
export type GatewayGuildMemberUpdateDispatch = DataPayload<
  GatewayDispatchEvents.GuildMemberUpdate,
  GatewayGuildMemberUpdateDispatchData
>;

/**
 * https://discord.com/developers/docs/topics/gateway-events#guild-member-update
 */
export type GatewayGuildMemberUpdateDispatchData = Omit<
  Member,
  "deaf" | "mute" | "user" | "joined_at"
> &
  Partial<Pick<Member, "deaf" | "mute">> &
  Required<Pick<Member, "user">> &
  Nullable<Pick<Member, "joined_at">> & {
    /**
     * The id of the guild
     */
    guild_id: string;
  };

/**
 * https://discord.com/developers/docs/topics/gateway-events#guild-members-chunk
 */
export type GatewayGuildMembersChunkDispatch = DataPayload<
  GatewayDispatchEvents.GuildMembersChunk,
  GatewayGuildMembersChunkDispatchData
>;

/**
 * https://discord.com/developers/docs/topics/gateway-events#guild-members-chunk
 */
export interface GatewayGuildMembersChunkDispatchData {
  /**
   * The id of the guild
   */
  guild_id: string;
  /**
   * Set of guild members
   *
   * See https://discord.com/developers/docs/resources/guild#guild-member-object
   */
  members: PublicMember[];
  /**
   * The chunk index in the expected chunks for this response (`0 <= chunk_index < chunk_count`)
   */
  chunk_index: number;
  /**
   * The total number of expected chunks for this response
   */
  chunk_count: number;
  /**
   * If passing an invalid id to `REQUEST_GUILD_MEMBERS`, it will be returned here
   */
  not_found?: string[];
  /**
   * If passing true to `REQUEST_GUILD_MEMBERS`, presences of the returned members will be here
   *
   * See https://discord.com/developers/docs/topics/gateway-events#update-presence
   */
  // presences?: Presence[];
  presences?: unknown[]; // TODO: missing type
  /**
   * The nonce used in the Guild Members Request
   *
   * See https://discord.com/developers/docs/topics/gateway-events#request-guild-members
   */
  nonce?: string;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#guild-role-create
 * https://discord.com/developers/docs/topics/gateway-events#guild-role-update
 */
export type GatewayGuildRoleModifyDispatch = DataPayload<
  GatewayDispatchEvents.GuildRoleCreate | GatewayDispatchEvents.GuildRoleUpdate,
  GatewayGuildRoleModifyDispatchData
>;

/**
 * https://discord.com/developers/docs/topics/gateway-events#guild-role-create
 * https://discord.com/developers/docs/topics/gateway-events#guild-role-update
 */
export interface GatewayGuildRoleModifyDispatchData {
  /**
   * The id of the guild
   */
  guild_id: string;
  /**
   * The role created or updated
   *
   * See https://discord.com/developers/docs/topics/permissions#role-object
   */
  role: Role;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#guild-role-create
 */
export type GatewayGuildRoleCreateDispatch = GatewayGuildRoleModifyDispatch;

/**
 * https://discord.com/developers/docs/topics/gateway-events#guild-role-create
 */
export type GatewayGuildRoleCreateDispatchData =
  GatewayGuildRoleModifyDispatchData;

/**
 * https://discord.com/developers/docs/topics/gateway-events#guild-role-update
 */
export type GatewayGuildRoleUpdateDispatch = GatewayGuildRoleModifyDispatch;

/**
 * https://discord.com/developers/docs/topics/gateway-events#guild-role-update
 */
export type GatewayGuildRoleUpdateDispatchData =
  GatewayGuildRoleModifyDispatchData;

/**
 * https://discord.com/developers/docs/topics/gateway-events#guild-role-delete
 */
export type GatewayGuildRoleDeleteDispatch = DataPayload<
  GatewayDispatchEvents.GuildRoleDelete,
  GatewayGuildRoleDeleteDispatchData
>;

/**
 * https://discord.com/developers/docs/topics/gateway-events#guild-role-delete
 */
export interface GatewayGuildRoleDeleteDispatchData {
  /**
   * The id of the guild
   */
  guild_id: string;
  /**
   * The id of the role
   */
  role_id: string;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#invite-create
 */
export type GatewayInviteCreateDispatch = DataPayload<
  GatewayDispatchEvents.InviteCreate,
  GatewayInviteCreateDispatchData
>;

/**
 * https://discord.com/developers/docs/topics/gateway-events#invite-create
 */
export type GatewayInviteCreateDispatchData = Omit<
  Invite,
  "guild" | "channel"
> & {
  channel_id: string;
  guild_id?: string;
};

/**
 * https://discord.com/developers/docs/topics/gateway-events#invite-delete
 */
export type GatewayInviteDeleteDispatch = DataPayload<
  GatewayDispatchEvents.InviteDelete,
  GatewayInviteDeleteDispatchData
>;

/**
 * https://discord.com/developers/docs/topics/gateway-events#invite-delete
 */
export interface GatewayInviteDeleteDispatchData {
  /**
   * The channel of the invite
   */
  channel_id: string;
  /**
   * The guild of the invite
   */
  guild_id?: string;
  /**
   * The unique invite code
   *
   * See https://discord.com/developers/docs/resources/invite#invite-object
   */
  code: string;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#message-create
 */
export type GatewayMessageCreateDispatch = DataPayload<
  GatewayDispatchEvents.MessageCreate,
  GatewayMessageCreateDispatchData
>;

/**
 * https://discord.com/developers/docs/topics/gateway-events#message-create
 */
export type GatewayMessageCreateDispatchData = Omit<Message, "mentions"> &
  GatewayMessageEventExtraFields;

/**
 * https://discord.com/developers/docs/topics/gateway-events#message-update
 */
export type GatewayMessageUpdateDispatch = DataPayload<
  GatewayDispatchEvents.MessageUpdate,
  GatewayMessageUpdateDispatchData
>;

/**
 * https://discord.com/developers/docs/topics/gateway-events#message-update
 */
export type GatewayMessageUpdateDispatchData = Omit<
  Partial<Message>,
  "mentions"
> &
  GatewayMessageEventExtraFields & {
    /**
     * ID of the message
     */
    id: string;
    /**
     * ID of the channel the message was sent in
     */
    channel_id: string;
  };

export interface GatewayMessageEventExtraFields {
  /**
   * ID of the guild the message was sent in
   */
  guild_id?: string;
  /**
   * Member properties for this message's author
   *
   * The member object exists in `MESSAGE_CREATE` and `MESSAGE_UPDATE` events
   * from text-based guild channels
   *
   * See https://discord.com/developers/docs/resources/guild#guild-member-object
   */
  member?: PublicMember;
  /**
   * Users specifically mentioned in the message
   *
   * The `member` field is only present in `MESSAGE_CREATE` and `MESSAGE_UPDATE` events
   * from text-based guild channels
   *
   * See https://discord.com/developers/docs/resources/user#user-object
   * See https://discord.com/developers/docs/resources/guild#guild-member-object
   */
  mentions: (PublicUser & { member?: Omit<PublicMember, "user"> })[];
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#message-delete
 */
export type GatewayMessageDeleteDispatch = DataPayload<
  GatewayDispatchEvents.MessageDelete,
  GatewayMessageDeleteDispatchData
>;

/**
 * https://discord.com/developers/docs/topics/gateway-events#message-delete
 */
export interface GatewayMessageDeleteDispatchData {
  /**
   * The id of the message
   */
  id: string;
  /**
   * The id of the channel
   */
  channel_id: string;
  /**
   * The id of the guild
   */
  guild_id?: string;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#message-delete-bulk
 */
export type GatewayMessageDeleteBulkDispatch = DataPayload<
  GatewayDispatchEvents.MessageDeleteBulk,
  GatewayMessageDeleteBulkDispatchData
>;

/**
 * https://discord.com/developers/docs/topics/gateway-events#message-delete-bulk
 */
export interface GatewayMessageDeleteBulkDispatchData {
  /**
   * The ids of the messages
   */
  ids: string[];
  /**
   * The id of the channel
   */
  channel_id: string;
  /**
   * The id of the guild
   */
  guild_id?: string;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#typing-start
 */
export type GatewayTypingStartDispatch = DataPayload<
  GatewayDispatchEvents.TypingStart,
  GatewayTypingStartDispatchData
>;

/**
 * https://discord.com/developers/docs/topics/gateway-events#typing-start
 */
export interface GatewayTypingStartDispatchData {
  /**
   * The id of the channel
   */
  channel_id: string;
  /**
   * The id of the guild
   */
  guild_id?: string;
  /**
   * The id of the user
   */
  user_id: string;
  /**
   * Unix time (in seconds) of when the user started typing
   */
  timestamp: number;
  /**
   * The member who started typing if this happened in a guild
   *
   * See https://discord.com/developers/docs/resources/guild#guild-member-object
   */
  member?: PublicMember;
}

// #region Sendable Payloads

/**
 * https://discord.com/developers/docs/topics/gateway#sending-heartbeats
 */
export interface GatewayHeartbeat {
  op: GatewayOpcodes.Heartbeat;
  d: GatewayHeartbeatData;
}

/**
 * https://discord.com/developers/docs/topics/gateway#sending-heartbeats
 */
export type GatewayHeartbeatData = number | null;

/**
 * https://discord.com/developers/docs/topics/gateway-events#identify
 */
export interface GatewayIdentify {
  op: GatewayOpcodes.Identify;
  d: IdentifySchema;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#resume
 */
export interface GatewayResume {
  op: GatewayOpcodes.Resume;
  d: GatewayResumeData;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#resume
 */
export interface GatewayResumeData {
  /**
   * Session token
   */
  token: string;
  /**
   * Session id
   */
  session_id: string;
  /**
   * Last sequence number received
   */
  seq: number;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#request-guild-members
 */
export interface GatewayRequestGuildMembers {
  op: GatewayOpcodes.RequestGuildMembers;
  d: GatewayRequestGuildMembersData;
}

export interface GatewayRequestGuildMembersDataBase {
  /**
   * ID of the guild to get members for
   */
  guild_id: string;
  /**
   * Used to specify if we want the presences of the matched members
   */
  presences?: boolean;
  /**
   * Nonce to identify the Guild Members Chunk response
   *
   * Nonce can only be up to 32 bytes. If you send an invalid nonce it will be ignored and the reply member_chunk(s) will not have a `nonce` set.
   *
   * See https://discord.com/developers/docs/topics/gateway-events#guild-members-chunk
   */
  nonce?: string;
}

export interface GatewayRequestGuildMembersDataWithUserIds
  extends GatewayRequestGuildMembersDataBase {
  /**
   * Used to specify which users you wish to fetch
   */
  user_ids: string | string[];
}

export interface GatewayRequestGuildMembersDataWithQuery
  extends GatewayRequestGuildMembersDataBase {
  /**
   * String that username starts with, or an empty string to return all members
   */
  query: string;
  /**
   * Maximum number of members to send matching the `query`;
   * a limit of `0` can be used with an empty string `query` to return all members
   */
  limit: number;
}

/**
 * https://discord.com/developers/docs/topics/gateway-events#request-guild-members
 */
export type GatewayRequestGuildMembersData =
  | GatewayRequestGuildMembersDataWithUserIds
  | GatewayRequestGuildMembersDataWithQuery;

/**
 * https://discord.com/developers/docs/topics/gateway-events#user-update
 */
export type GatewayUserUpdateDispatch = DataPayload<
  GatewayDispatchEvents.UserUpdate,
  GatewayUserUpdateDispatchData
>;

/**
 * https://discord.com/developers/docs/topics/gateway-events#user-update
 */
export type GatewayUserUpdateDispatchData = Omit<User, "data">;

export type GatewaySendPayload =
  | GatewayHeartbeat
  | GatewayIdentify
  | GatewayResume
  | GatewayRequestGuildMembers;

export type GatewayReceivePayload =
  | GatewayHello
  | GatewayHeartbeatRequest
  | GatewayHeartbeatAck
  | GatewayInvalidSession
  | GatewayReconnect
  | GatewayDispatchPayload;

export type GatewayDispatchPayload =
  | GatewayGuildMemberAddDispatch
  | GatewayGuildMemberRemoveDispatch
  | GatewayGuildMembersChunkDispatch
  | GatewayGuildMemberUpdateDispatch
  | GatewayGuildRoleDeleteDispatch
  | GatewayGuildRoleModifyDispatch
  | GatewayInviteCreateDispatch
  | GatewayInviteDeleteDispatch
  | GatewayMessageCreateDispatch
  | GatewayMessageDeleteBulkDispatch
  | GatewayMessageDeleteDispatch
  | GatewayMessageUpdateDispatch
  | GatewayReadyDispatch
  | GatewayResumedDispatch
  | GatewayTypingStartDispatch
  | GatewayUserUpdateDispatch;
