import { PublicUser } from "@puyodead1/spacebar-api";
import { DiscordSnowflake } from "@sapphire/snowflake";
import isEqual from "lodash.isequal";
import { action, makeAutoObservable, observable, runInAction } from "mobx";
import { Client } from "../Client";
import { UserFlags, UserPremiumType } from "../interfaces/user";
import Collection from "../util/Collection";
import { Nullable, toNullable } from "../util/utils";

export class User {
  client: Client;
  id: string;
  @observable premium_since: string;
  @observable username: string;
  @observable discriminator: string;
  @observable public_flags: UserFlags;
  @observable avatar: Nullable<string>;
  @observable accent_color: Nullable<number>;
  @observable banner: Nullable<string>;
  @observable bio: string;
  @observable bot: boolean;
  @observable premium_type: UserPremiumType;
  @observable theme_colors: Nullable<number[]>;
  @observable pronouns: Nullable<string>;

  constructor(client: Client, data: PublicUser) {
    this.client = client;
    this.id = data.id;
    this.username = data.username;
    this.discriminator = data.discriminator;
    this.avatar = toNullable(data.avatar);
    this.accent_color = toNullable(data.accent_color);
    this.banner = toNullable(data.banner);
    this.bio = data.bio;
    this.bot = data.bot;
    this.premium_type = data.premium_type;
    this.theme_colors = toNullable(data.theme_colors);
    this.pronouns = toNullable(data.pronouns);
    this.public_flags = data.public_flags;
    this.premium_since = data.premium_since;

    makeAutoObservable(this);
  }

  get createdAt() {
    return new Date(Number(DiscordSnowflake.deconstruct(this.id).timestamp));
  }

  async getProfile() {
    return await this.client.api.get(`/users/${this.id}/`);
  }

  // TODO: file type option
  // TODO: size option
  get defaultAvatarURL() {
    return `${this.client.options.cdn.url}/embed/avatars/${
      Number(this.discriminator) % 5
    }.png`;
  }

  // TODO: file type option
  // TODO: size option
  get avatarURL() {
    return this.avatar
      ? `${this.client.options.cdn.url}/avatars/${this.id}/${this.avatar}.png`
      : this.defaultAvatarURL;
  }

  @action
  update(data: Partial<PublicUser>) {
    const set = (key: keyof PublicUser) => {
      if (typeof data[key] !== "undefined" && !isEqual(this[key], data[key])) {
        // @ts-expect-error
        this[key] = data[key];
      }
    };

    const excludedKeys: (keyof PublicUser)[] = ["id"];
    for (const key of Object.keys(data)) {
      if (!excludedKeys.includes(key as keyof PublicUser))
        set(key as keyof PublicUser);
    }
  }
}

export default class UserCollection extends Collection<string, User> {
  constructor(client: Client) {
    super(client);

    this.set(
      "00000000000000000000000000",
      new User(client, {
        id: "00000000000000000000000000",
        username: "Spacebar Ghost",
        discriminator: "0000",
        bio: "",
        bot: false,
        premium_since: "",
        premium_type: 0,
        public_flags: 0,
        // system???
      })
    );
  }

  @action
  get(id: string) {
    return super.get(id);
  }

  async fetch(id: string, force: boolean = false) {
    if (this.has(id) && !force) return this.get(id);
    const user = await this.client.api.get(`/users/${id}/`);
    // response is PublicUserResponse which is a type for PublicUser
    return this.create(user as PublicUser);
  }

  create(data: PublicUser) {
    if (this.has(data.id)) return this.get(data.id);
    const user = new User(this.client, data);

    runInAction(() => {
      this.set(user.id, user);
    });

    return user;
  }
}
