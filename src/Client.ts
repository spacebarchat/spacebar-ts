import {
  API,
  APIErrorOrCaptchaResponse,
  LoginSchema,
  User,
} from "@puyodead1/fosscord-api";
import EventEmitter from "eventemitter3";
import defaultsDeep from "lodash.defaultsdeep";
import { makeObservable, observable } from "mobx";
import UserCollection from "./structures/User";
import { WebSocketClient } from "./WebSocket";

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
    url: "https://staging.fosscord.com/api",
  },
  cdn: {
    url: "https://cdn.staging.fosscord.com",
  },
};

export class Client extends EventEmitter {
  api: API;
  options: ClientOptions;
  token?: string | null;
  domainConfig?: DomainConfig;
  ws: WebSocketClient;

  @observable user?: User;
  @observable users: UserCollection;

  constructor(options: Partial<ClientOptions> = {}) {
    super();

    this.users = new UserCollection(this);

    makeObservable(this);

    this.options = defaultsDeep(options, DEFAULT_CONFIG);
    this.api = new API({ baseURL: this.options.rest.url });
    this.ws = new WebSocketClient(this);
  }

  private setAuth(token: string) {
    this.api = new API({
      baseURL: this.options.rest.url,
      authentication: {
        token,
      },
    });
  }

  private async getConfig(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.api
        .get("/policies/instance/domains/")
        .then((res) => {
          this.domainConfig = res;
          resolve();
        })
        .catch(reject);
    });
  }

  private conenect() {
    if (!this.token) throw new Error("No token set");

    this.setAuth(this.token);
    this.ws.connect();
  }

  async login(data: LoginSchema): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.getConfig().catch(reject);
      this.api
        .post("/auth/login/", data)
        .then((res) => {
          if ("mfa" in res) {
            // OTP MFA
            return reject("MFA Not implemented");
          }
          if ("webauthn" in res) {
            // WebAuthn MFA
            return reject("MFA Not implemented");
          }
          // Success
          this.token = res.token;
          this.conenect();
          resolve();
        })
        .catch((e: APIErrorOrCaptchaResponse | Error) => {
          if ("captcha_sitekey" in e) {
            // Captcha
            return reject("Captcha Not implemented");
          }

          if ("message" in e) {
            // API Error
            return reject(e.message);
          }

          reject(e);
        });
    });
  }

  async loginWithToken(token: string) {
    await this.getConfig();
    this.token = token;
    this.conenect();
  }
}
