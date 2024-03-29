import {
	API,
	APIErrorOrCaptchaResponse,
	LoginSchema,
	PublicUser,
	RegisterSchema,
} from "@spacebarchat/spacebar-types";
import EventEmitter from "eventemitter3";
import defaultsDeep from "lodash.defaultsdeep";
import { action, makeObservable, observable } from "mobx";
import { WebSocketClient } from "./WebSocket";
import { APIError, CaptchaError, MFAError } from "./errors";
import ChannelCollection from "./structures/Channel";
import GuildCollection from "./structures/Guild";
import MemberCollection from "./structures/Member";
import UserCollection from "./structures/User";
import { getAxiosErrorContent } from "./util/utils";

export interface ClientOptions {
	rest: {
		url: string;
	};
	cdn: {
		url: string;
	};
}

export interface DomainConfig {
	cdn: string;
	gateway: string;
	defaultApiVersion: string;
	apiEndpoint: string;
}

export const DEFAULT_CONFIG: ClientOptions = {
	rest: {
		url: "https://api.old.server.spacebar.chat/api",
	},
	cdn: {
		url: "https://cdn.old.server.spacebar.chat",
	},
};

export class Client extends EventEmitter {
	@observable token?: string | null;
	api: API;
	options: ClientOptions;
	domainConfig?: DomainConfig;
	ws: WebSocketClient;

	@observable user:
		| (PublicUser & {
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
		  })
		| null = null;
	@observable users: UserCollection;
	@observable guilds: GuildCollection;
	@observable channels: ChannelCollection;
	@observable members: MemberCollection;

	constructor(options: Partial<ClientOptions> = {}) {
		super();

		this.users = new UserCollection(this);
		this.guilds = new GuildCollection(this);
		this.channels = new ChannelCollection(this);
		this.members = new MemberCollection(this);

		makeObservable(this);

		this.options = defaultsDeep(options, DEFAULT_CONFIG);
		this.api = new API({ baseURL: this.options.rest.url });
		this.ws = new WebSocketClient(this);
	}

	private setAuth(token: string) {
		this.api = new API({
			baseURL: this.options.rest.url,
			authentication: {
				bearer: token,
			},
		});
	}

	private async getConfig(): Promise<DomainConfig> {
		return new Promise((resolve, reject) => {
			this.api
				.get("/policies/instance/domains/")
				.then((res) => {
					this.domainConfig = res;
					resolve(res);
				})
				.catch(reject);
		});
	}

	private conenect() {
		if (!this.token) throw new Error("No token set");

		this.setAuth(this.token);
		this.ws.connect();
	}

	@action
	async login(data: LoginSchema): Promise<string> {
		await this.getConfig();
		return this.api
			.post("/auth/login/", data)
			.then((res) => {
				if ("mfa" in res) {
					// MFA
					throw new MFAError(res);
				}
				// Success
				this.token = res.token;
				this.conenect();
				return this.token;
			})
			.catch((e) => {
				if (typeof e === "object" && e instanceof MFAError) throw e;

				const content = getAxiosErrorContent<
					APIErrorOrCaptchaResponse | Error
				>(e);

				if (content instanceof Error) throw content;

				if ("captcha_sitekey" in content)
					// Captcha
					throw new CaptchaError(content);

				throw new APIError(content);
			});
	}

	@action
	async loginWithToken(token: string) {
		await this.getConfig();
		this.token = token;
		this.conenect();
	}

	@action
	register(data: RegisterSchema): Promise<string> {
		return new Promise((resolve, reject) => {
			this.api
				.post("/auth/register/", data)
				.then((res) => {
					this.token = res.token;
					this.conenect();
					resolve(this.token);
				})
				.catch((e) => {
					const content = getAxiosErrorContent<
						APIErrorOrCaptchaResponse | Error
					>(e);

					if ("captcha_sitekey" in content) {
						// Captcha
						return reject(new CaptchaError(content));
					}

					if (content instanceof Error) {
						return reject(content);
					}

					reject(new APIError(content));
				});
		});
	}

	async logout(skipRequest = false) {
		this.user = null;
		this.emit("logout");
		if (!skipRequest) {
			await this.api.post("/auth/logout/");
		}

		this.reset();
	}

	reset() {
		this.user = null;
		this.ws.disconnect();
		delete this.token;

		this.users = new UserCollection(this);
		this.guilds = new GuildCollection(this);
		this.channels = new ChannelCollection(this);
		this.members = new MemberCollection(this);
	}
}
