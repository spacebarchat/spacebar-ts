// TODO:: add custom spacebar features
export enum GuildFeature {
	/**
	 * Guild has access to set an animated guild banner image
	 */
	AnimatedBanner = "ANIMATED_BANNER",
	/**
	 * Guild has access to set an animated guild icon
	 */
	AnimatedIcon = "ANIMATED_ICON",
	/**
	 * Guild is using the old permissions configuration behavior
	 *
	 * See https://discord.com/developers/docs/change-log#upcoming-application-command-permission-changes
	 */
	ApplicationCommandPermissionsV2 = "APPLICATION_COMMAND_PERMISSIONS_V2",
	/**
	 * Guild has set up auto moderation rules
	 */
	AutoModeration = "AUTO_MODERATION",
	/**
	 * Guild has access to set a guild banner image
	 */
	Banner = "BANNER",
	/**
	 * Guild can enable welcome screen, Membership Screening and discovery, and receives community updates
	 */
	Community = "COMMUNITY",
	/**
	 * Guild has enabled monetization
	 */
	CreatorMonetizableProvisional = "CREATOR_MONETIZABLE_PROVISIONAL",
	/**
	 * Guild has enabled the role subscription promo page
	 */
	CreatorStorePage = "CREATOR_STORE_PAGE",
	/*
	 * Guild has been set as a support server on the App Directory
	 */
	DeveloperSupportServer = "DEVELOPER_SUPPORT_SERVER",
	/**
	 * Guild is able to be discovered in the directory
	 */
	Discoverable = "DISCOVERABLE",
	/**
	 * Guild is able to be featured in the directory
	 */
	Featurable = "FEATURABLE",
	/**
	 * Guild is listed in a directory channel
	 */
	HasDirectoryEntry = "HAS_DIRECTORY_ENTRY",
	/**
	 * Guild is a Student Hub
	 *
	 * See https://support.discord.com/hc/articles/4406046651927
	 *
	 * @unstable This feature is currently not documented by Discord, but has known value
	 */
	Hub = "HUB",
	/**
	 * Guild has disabled invite usage, preventing users from joining
	 */
	InvitesDisabled = "INVITES_DISABLED",
	/**
	 * Guild has access to set an invite splash background
	 */
	InviteSplash = "INVITE_SPLASH",
	/**
	 * Guild is in a Student Hub
	 *
	 * See https://support.discord.com/hc/articles/4406046651927
	 *
	 * @unstable This feature is currently not documented by Discord, but has known value
	 */
	LinkedToHub = "LINKED_TO_HUB",
	/**
	 * Guild has enabled Membership Screening
	 */
	MemberVerificationGateEnabled = "MEMBER_VERIFICATION_GATE_ENABLED",
	/**
	 * Guild has enabled monetization
	 *
	 * @unstable This feature is no longer documented by Discord
	 */
	MonetizationEnabled = "MONETIZATION_ENABLED",
	/**
	 * Guild has increased custom sticker slots
	 */
	MoreStickers = "MORE_STICKERS",
	/**
	 * Guild has access to create news channels
	 */
	News = "NEWS",
	/**
	 * Guild is partnered
	 */
	Partnered = "PARTNERED",
	/**
	 * Guild can be previewed before joining via Membership Screening or the directory
	 */
	PreviewEnabled = "PREVIEW_ENABLED",
	/**
	 * Guild has access to create private threads
	 */
	PrivateThreads = "PRIVATE_THREADS",
	RelayEnabled = "RELAY_ENABLED",
	/**
	 * Guild is able to set role icons
	 */
	RoleIcons = "ROLE_ICONS",
	/**
	 * Guild has role subscriptions that can be purchased
	 */
	RoleSubscriptionsAvailableForPurchase = "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE",
	/**
	 * Guild has enabled role subscriptions
	 */
	RoleSubscriptionsEnabled = "ROLE_SUBSCRIPTIONS_ENABLED",
	/**
	 * Guild has enabled ticketed events
	 */
	TicketedEventsEnabled = "TICKETED_EVENTS_ENABLED",
	/**
	 * Guild has access to set a vanity URL
	 */
	VanityURL = "VANITY_URL",
	/**
	 * Guild is verified
	 */
	Verified = "VERIFIED",
	/**
	 * Guild has access to set 384kbps bitrate in voice (previously VIP voice servers)
	 */
	VIPRegions = "VIP_REGIONS",
	/**
	 * Guild has enabled the welcome screen
	 */
	WelcomeScreenEnabled = "WELCOME_SCREEN_ENABLED",
}

export enum GuildDefaultMessageNotifications {
	AllMessages,
	OnlyMentions,
}

export enum GuildExplicitContentFilter {
	Disabled,
	MembersWithoutRoles,
	AllMembers,
}

export enum GuildMFALevel {
	None,
	Elevated,
}

export enum GuildNSFWLevel {
	Default,
	Explicit,
	Safe,
	AgeRestricted,
}

export enum GuildVerificationLevel {
	/**
	 * Unrestricted
	 */
	None,
	/**
	 * Must have verified email on account
	 */
	Low,
	/**
	 * Must be registered on Discord for longer than 5 minutes
	 */
	Medium,
	/**
	 * Must be a member of the guild for longer than 10 minutes
	 */
	High,
	/**
	 * Must have a verified phone number
	 */
	VeryHigh,
}

export enum GuildPremiumTier {
	None,
	Tier1,
	Tier2,
	Tier3,
}

export enum GuildHubType {
	Default,
	HighSchool,
	College,
}

export enum GuildSystemChannelFlags {
	/**
	 * Suppress member join notifications
	 */
	SuppressJoinNotifications = 1 << 0,
	/**
	 * Suppress server boost notifications
	 */
	SuppressPremiumSubscriptions = 1 << 1,
	/**
	 * Suppress server setup tips
	 */
	SuppressGuildReminderNotifications = 1 << 2,
	/**
	 * Hide member join sticker reply buttons
	 */
	SuppressJoinNotificationReplies = 1 << 3,
}
