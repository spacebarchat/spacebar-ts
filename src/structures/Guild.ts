import { DiscordSnowflake } from "@sapphire/snowflake";
import {
	Ban,
	Channel,
	Emoji,
	Guild as GuildI,
	GuildWelcomeScreen,
	Invite,
	Member,
	Role,
	Sticker,
	VoiceState,
	Webhook,
} from "@spacebarchat/spacebar-types";
import isEqual from "lodash.isequal";
import {
	action,
	computed,
	makeAutoObservable,
	observable,
	runInAction,
} from "mobx";
import { Client } from "../Client";
import {
	GuildFeature,
	GuildMFALevel,
	GuildNSFWLevel,
	GuildPremiumTier,
	GuildSystemChannelFlags,
	GuildVerificationLevel,
} from "../interfaces/guild";
import Collection from "../util/Collection";
import { notEmpty } from "../util/utils";
import { CategoryChannel } from "./Channel";

// TODO: members
// TODO: roles
// TODO: emojis
// TODO: stickers

// fuck the discord dev that thought this was a good idea
export interface StupidFuckingGuildFromGateway {
	application_command_counts?: { 1: number; 2: number; 3: number }; // ????????????
	channels: Channel[];
	data_mode: string; // what is this
	emojis: Emoji[];
	guild_scheduled_events: unknown[]; // TODO
	id: string;
	large: boolean | undefined;
	lazy: boolean;
	member_count: number | undefined;
	members: Member[];
	premium_subscription_count: number | undefined;
	properties: {
		name: string;
		description?: string;
		icon?: string;
		splash?: string;
		banner?: string;
		features: GuildFeature[];
		preferred_locale?: string;
		owner_id?: string;
		application_id?: string;
		afk_channel_id?: string;
		afk_timeout: number | undefined;
		system_channel_id?: string;
		verification_level: GuildVerificationLevel;
		explicit_content_filter: number | undefined;
		default_message_notifications: number | undefined;
		mfa_level: number | undefined;
		vanity_url_code?: string;
		premium_tier: GuildPremiumTier;
		premium_progress_bar_enabled: boolean;
		system_channel_flags: GuildSystemChannelFlags;
		discovery_splash?: string;
		rules_channel_id?: string;
		public_updates_channel_id?: string;
		max_video_channel_users: number | undefined;
		max_members: number | undefined;
		nsfw_level: GuildNSFWLevel;
		hub_type?: unknown | null; // ????
	};
	roles: Role[];
	stage_instances: unknown[];
	stickers: Sticker[];
	threads: unknown[];
	version: string;
}

// FIXME: fix this in the server types
export type IGuildCustom = Omit<
	GuildI,
	| "afk_channel"
	| "owner"
	| "public_updates_channel"
	| "rules_channel"
	| "system_channel"
	| "widget_channel"
	| "template"
>;

// TODO: shouldn't this be in spacebar-api???
export enum ChannelType {
	GUILD_TEXT = 0, // a text channel within a guild
	DM = 1, // a direct message between users
	GUILD_VOICE = 2, // a voice channel within a guild
	GROUP_DM = 3, // a direct message between multiple users
	GUILD_CATEGORY = 4, // an organizational category that contains zero or more channels
	GUILD_NEWS = 5, // a channel that users can follow and crosspost into a guild or route
	GUILD_STORE = 6, // a channel in which game developers can sell their things
	ENCRYPTED = 7, // end-to-end encrypted channel
	ENCRYPTED_THREAD = 8, // end-to-end encrypted thread channel
	TRANSACTIONAL = 9, // event chain style transactional channel
	GUILD_NEWS_THREAD = 10, // a temporary sub-channel within a GUILD_NEWS channel
	GUILD_PUBLIC_THREAD = 11, // a temporary sub-channel within a GUILD_TEXT channel
	GUILD_PRIVATE_THREAD = 12, // a temporary sub-channel within a GUILD_TEXT channel that is only viewable by those invited and those with the MANAGE_THREADS permission
	GUILD_STAGE_VOICE = 13, // a voice channel for hosting events with an audience
	DIRECTORY = 14, // guild directory listing channel
	GUILD_FORUM = 15, // forum composed of IM threads
	TICKET_TRACKER = 33, // ticket tracker, individual ticket items shall have type 12
	KANBAN = 34, // confluence like kanban board
	VOICELESS_WHITEBOARD = 35, // whiteboard but without voice (whiteboard + voice is the same as stage)
	CUSTOM_START = 64, // start custom channel types from here
	UNHANDLED = 255, // unhandled unowned pass-through channel type
}

export class Guild {
	id: string;
	@observable afk_channel_id?: string;
	@observable afk_timeout?: number;
	@observable bans: Ban[];
	@observable banner?: string;
	@observable default_message_notifications?: number;
	@observable description?: string;
	@observable discovery_splash?: string;
	@observable explicit_content_filter?: number;
	@observable features: GuildFeature[];
	@observable primary_category_id?: string;
	@observable icon?: string;
	@observable large: boolean = false;
	@observable max_members?: number;
	@observable max_presences?: number;
	@observable max_video_channel_users?: number;
	@observable member_count?: number;
	@observable presence_count?: number;
	@observable member_ids: string[];
	@observable role_ids: string[];
	@observable channel_ids: string[] = [];
	@observable template_id?: string;
	@observable emoji_ids: string[];
	@observable sticker_ids: string[];
	@observable invites?: Invite[];
	@observable voice_states?: VoiceState[];
	@observable webhooks?: Webhook[];
	@observable mfa_level?: GuildMFALevel;
	@observable name: string;
	@observable owner_id?: string;
	@observable preferred_locale?: string;
	@observable premium_subscription_count?: number;
	@observable premium_tier?: GuildPremiumTier;
	@observable public_updates_channel_id?: string;
	@observable rules_channel_id?: string;
	@observable region?: string;
	@observable splash?: string;
	@observable system_channel_id?: string;
	@observable system_channel_flags?: GuildSystemChannelFlags;
	@observable unavailable: boolean = false;
	@observable verification_level?: GuildVerificationLevel;
	@observable welcome_screen?: GuildWelcomeScreen;
	@observable widget_channel_id?: string;
	@observable widget_enabled: boolean = true;
	@observable nsfw_level?: GuildNSFWLevel;
	@observable nsfw: boolean = false;
	@observable parent?: string;
	@observable permissions?: number;
	@observable premium_progress_bar_enabled: boolean = false;

	constructor(
		private readonly client: Client,
		data: IGuildCustom | StupidFuckingGuildFromGateway,
	) {
		this.id = data.id;
		this.member_count = data.member_count;
		this.member_ids = (data.members ?? []).map((x) => x.id);
		(data.members ?? []).forEach((x) => this.client.members.create(x));
		this.role_ids = (data.roles ?? []).map((x) => x.id); // TODO: store
		this.channel_ids = data.channels.map((x) => x.id); // TODO: store
		data.channels.forEach((x) => this.client.channels.create(x));
		this.emoji_ids = (data.emojis ?? []).map((x) => x.id); // TODO: store
		this.sticker_ids = (data.stickers ?? []).map((x) => x.id); // TODO: store
		this.premium_subscription_count = data.premium_subscription_count;
		this.large = data.large ?? false;

		if ("properties" in data) {
			this.afk_channel_id = data.properties.afk_channel_id;
			this.afk_timeout = data.properties.afk_timeout;
			// this.bans = data.bans; ?????????????
			this.bans = [];
			this.banner = data.properties.banner;
			this.default_message_notifications =
				data.properties.default_message_notifications;
			this.description = data.properties.description;
			this.discovery_splash = data.properties.discovery_splash;
			this.explicit_content_filter =
				data.properties.explicit_content_filter;
			this.features = data.properties.features;
			// this.primary_category_id = data.properties.primary_category_id; ??????????
			this.icon = data.properties.icon;
			this.max_members = data.properties.max_members;
			// this.max_presences = data.properties.max_presences; ??????????
			this.max_video_channel_users =
				data.properties.max_video_channel_users;
			this.premium_tier = data.properties.premium_tier;
			this.public_updates_channel_id =
				data.properties.public_updates_channel_id;
			this.rules_channel_id = data.properties.rules_channel_id;
			// this.region = data.properties.region; ????????????????
			this.splash = data.properties.splash;
			this.system_channel_id = data.properties.system_channel_id;
			this.system_channel_flags = data.properties.system_channel_flags;
			// this.unavailable = data.properties.unavailable; ????????????????
			this.verification_level = data.properties.verification_level;
			// this.welcome_screen = data.properties.welcome_screen; ????????????????
			// this.widget_channel_id = data.properties.widget_channel_id; ????????????????
			// this.widget_enabled = data.properties.widget_enabled; ????????????????
			this.nsfw_level = data.properties.nsfw_level;
			// this.nsfw = data.properties.nsfw; ????????????????
			// this.parent = data.properties.parent; ????????????????
			// this.permissions = data.properties.permissions; ????????????????
			this.premium_progress_bar_enabled =
				data.properties.premium_progress_bar_enabled;
			// this.invites = data.properties.invites; ????????????????
			// this.voice_states = data.properties.voice_states; ????????????????
			// this.webhooks = data.properties.webhooks; ????????????????
			this.mfa_level = data.properties.mfa_level;
			this.name = data.properties.name;
			this.owner_id = data.properties.owner_id;
			this.preferred_locale = data.properties.preferred_locale;
			// this.template_id = data.properties.template_id; ????????????????
		} else {
			this.afk_channel_id = data.afk_channel_id;
			this.afk_timeout = data.afk_timeout;
			this.bans = data.bans;
			this.banner = data.banner;
			this.default_message_notifications =
				data.default_message_notifications;
			this.description = data.description;
			this.discovery_splash = data.discovery_splash;
			this.explicit_content_filter = data.explicit_content_filter;
			this.features = data.features as GuildFeature[];
			this.primary_category_id = data.primary_category_id;
			this.icon = data.icon;
			this.max_members = data.max_members;
			this.max_presences = data.max_presences;
			this.max_video_channel_users = data.max_video_channel_users;
			this.premium_tier = data.premium_tier;
			this.public_updates_channel_id = data.public_updates_channel_id;
			this.rules_channel_id = data.rules_channel_id;
			this.region = data.region;
			this.splash = data.splash;
			this.system_channel_id = data.system_channel_id;
			this.system_channel_flags = data.system_channel_flags;
			this.unavailable = data.unavailable;
			this.verification_level = data.verification_level;
			this.welcome_screen = data.welcome_screen;
			this.widget_channel_id = data.widget_channel_id;
			this.widget_enabled = data.widget_enabled;
			this.nsfw_level = data.nsfw_level;
			this.nsfw = data.nsfw;
			this.parent = data.parent;
			this.permissions = data.permissions;
			this.premium_progress_bar_enabled =
				data.premium_progress_bar_enabled;
			this.invites = data.invites;
			this.voice_states = data.voice_states;
			this.webhooks = data.webhooks;
			this.mfa_level = data.mfa_level;
			this.name = data.name;
			this.owner_id = data.owner_id;
			this.preferred_locale = data.preferred_locale;
			this.template_id = data.template_id;
		}

		makeAutoObservable(this);
	}

	get channels() {
		return this.channel_ids
			.map((x) => this.client.channels.get(x))
			.filter(notEmpty);
	}

	get members() {
		return this.member_ids
			.map((x) => this.client.members.get(x))
			.filter(notEmpty);
	}

	get createdAt() {
		return new Date(
			Number(DiscordSnowflake.deconstruct(this.id).timestamp),
		);
	}

	@computed
	get orderedChannels() {
		const uncategorised = new Set(
			this.channel_ids
				.map((key) => this.client.channels.get(key))
				.filter(notEmpty),
		);

		const categories = Array.from(uncategorised)
			.filter((x) => x.type === ChannelType.GUILD_CATEGORY)
			.map((x) => ({ ...x, channels: [] } as CategoryChannel));

		const elements = [];
		let defaultCategory;

		for (const category of categories) {
			const channels = [];
			for (const x of category.channels) {
				if (uncategorised.delete(x)) {
					channels.push(x);
				}
			}

			const cat = {
				...category,
				channels,
			};

			if (cat.id === "uncategorised") {
				if (channels.length === 0) continue;

				defaultCategory = cat;
			}

			elements.push(cat);
		}

		if (uncategorised.size > 0) {
			if (defaultCategory) {
				defaultCategory.channels = [
					...defaultCategory.channels,
					...uncategorised,
				];
			} else {
				elements.unshift({
					id: "uncategorised",
					channels: [...uncategorised],
				} as unknown as CategoryChannel);
			}
		}

		return elements;
	}

	@computed
	get defaultChannel() {
		return this.orderedChannels.find((x) => x.channels.length)?.channels[0];
	}

	@computed
	// TODO: size option
	// TODO: format option
	get iconURL() {
		return this.icon
			? `${this.client.options.cdn.url}/icons/${this.id}/${this.icon}.png`
			: undefined;
	}

	@computed
	// TODO: size option
	// TODO: format option
	get bannerURL() {
		return this.banner
			? `${this.client.options.cdn.url}/banners/${this.id}/${this.icon}.png`
			: undefined;
	}

	@computed
	// TODO: size option
	// TODO: format option
	get splashURL() {
		return this.splash
			? `${this.client.options.cdn.url}/splashes/${this.id}/${this.icon}.png`
			: undefined;
	}

	@action
	update(data: Partial<IGuildCustom>) {
		const set = (key: keyof IGuildCustom) => {
			if (
				typeof data[key] !== "undefined" &&
				// @ts-expect-error: allow
				!isEqual(this[key], data[key])
			) {
				// @ts-expect-error: allow
				this[key] = data[key];
			}
		};

		const excludedKeys: (keyof IGuildCustom)[] = ["id"];
		for (const key of Object.keys(data)) {
			if (!excludedKeys.includes(key as keyof IGuildCustom))
				set(key as keyof IGuildCustom);
		}
	}
}

export default class GuildCollection extends Collection<string, Guild> {
	constructor(client: Client) {
		super(client);

		this.create = this.create.bind(this);
	}

	@action
	get(id: string) {
		return super.get(id);
	}

	async fetch(id: string, force = false) {
		if (this.has(id) && !force) return this.get(id);

		// FIXME: fix in server
		const data = (await this.client.api.get(
			`/guilds/${id}` as any,
		)) as IGuildCustom;

		runInAction(() => {
			this.create(data);
		});

		return data;
	}

	create(data: IGuildCustom) {
		if (this.has(data.id)) return this.get(data.id);
		const guild = new Guild(this.client, data);

		runInAction(() => {
			this.set(data.id, guild);
		});

		return guild;
	}

	// TODO: create guild
}
