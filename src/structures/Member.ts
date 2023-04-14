import { Member as IMember, Role, UserGuildSettings } from "spacebar-types";
import isEqual from "lodash.isequal";
import {
	action,
	computed,
	makeAutoObservable,
	observable,
	runInAction,
} from "mobx";
import { Client } from "../Client";
import Collection from "../util/Collection";

export type IMemberCustom = Omit<IMember, "index" | "user" | "guild">;

export class Member {
	id: string;
	guild_id: string;
	@observable nick?: string;
	@observable roles: Role[];
	@observable joined_at: string;
	@observable premium_since?: number;
	@observable deaf: boolean;
	@observable mute: boolean;
	@observable pending: boolean;
	@observable settings: UserGuildSettings;
	@observable last_message_id?: string;
	@observable joined_by: string;
	@observable avatar: string;
	@observable banner: string;
	@observable bio: string;
	@observable theme_colors?: number[];
	@observable pronouns?: string;
	@observable communication_disabled_until: string;

	constructor(public readonly client: Client, data: IMember) {
		this.id = data.id;
		this.guild_id = data.guild_id;
		this.nick = data.nick;
		this.roles = data.roles;
		this.joined_at = data.joined_at;
		this.premium_since = data.premium_since;
		this.deaf = data.deaf;
		this.mute = data.mute;
		this.pending = data.pending;
		this.settings = data.settings;
		this.last_message_id = data.last_message_id;
		this.joined_by = data.joined_by;
		this.avatar = data.avatar;
		this.banner = data.banner;
		this.bio = data.bio;
		this.theme_colors = data.theme_colors;
		this.pronouns = data.pronouns;
		this.communication_disabled_until = data.communication_disabled_until;

		makeAutoObservable(this);
	}

	get user() {
		return this.client.users.get(this.id);
	}

	get guild() {
		return this.client.guilds.get(this.guild_id);
	}

	@computed
	get orderedRoles() {
		return this.roles.sort((a, b) => b.position - a.position);
	}

	@computed
	get hoistedRole() {
		return this.orderedRoles.find((role) => role.hoist);
	}

	// TODO: file type option
	// TODO: size option
	get avatarURL() {
		return this.avatar
			? `${this.client.options.cdn.url}/avatars/${this.id}/${this.avatar}.png`
			: this.user?.avatarURL;
	}

	// TODO: permissions

	@action
	update(data: Partial<IMemberCustom>) {
		const set = (key: keyof IMemberCustom) => {
			if (
				typeof data[key] !== "undefined" &&
				!isEqual(this[key], data[key])
			) {
				// @ts-expect-error: allow
				this[key] = data[key];
			}
		};

		const excludedKeys: (keyof IMemberCustom)[] = ["id"];
		for (const key of Object.keys(data)) {
			if (!excludedKeys.includes(key as keyof IMemberCustom))
				set(key as keyof IMemberCustom);
		}
	}
}

export default class MemberCollection extends Collection<string, Member> {
	constructor(client: Client) {
		super(client);

		this.create = this.create.bind(this);
	}

	@action
	get(id: string) {
		return super.get(id);
	}

	create(data: IMember) {
		if (this.has(data.id)) return this.get(data.id);
		const member = new Member(this.client, data);

		runInAction(() => {
			this.set(data.id, member);
		});

		return member;
	}
}
