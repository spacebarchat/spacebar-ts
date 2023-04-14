export enum UserFlags {
  /**
   * Discord Employee
   */
  Staff = 1 << 0,
  /**
   * Partnered Server Owner
   */
  Partner = 1 << 1,
  /**
   * HypeSquad Events Member
   */
  Hypesquad = 1 << 2,
  /**
   * Bug Hunter Level 1
   */
  BugHunterLevel1 = 1 << 3,
  /**
   * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
   */
  MFASMS = 1 << 4,
  /**
   * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
   */
  PremiumPromoDismissed = 1 << 5,
  /**
   * House Bravery Member
   */
  HypeSquadOnlineHouse1 = 1 << 6,
  /**
   * House Brilliance Member
   */
  HypeSquadOnlineHouse2 = 1 << 7,
  /**
   * House Balance Member
   */
  HypeSquadOnlineHouse3 = 1 << 8,
  /**
   * Early Nitro Supporter
   */
  PremiumEarlySupporter = 1 << 9,
  /**
   * User is a [team](https://discord.com/developers/docs/topics/teams)
   */
  TeamPseudoUser = 1 << 10,
  /**
   * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
   */
  HasUnreadUrgentMessages = 1 << 13,
  /**
   * Bug Hunter Level 2
   */
  BugHunterLevel2 = 1 << 14,
  /**
   * Verified Bot
   */
  VerifiedBot = 1 << 16,
  /**
   * Early Verified Bot Developer
   */
  VerifiedDeveloper = 1 << 17,
  /**
   * Moderator Programs Alumni
   */
  CertifiedModerator = 1 << 18,
  /**
   * Bot uses only [HTTP interactions](https://discord.com/developers/docs/interactions/receiving-and-responding#receiving-an-interaction) and is shown in the online member list
   */
  BotHTTPInteractions = 1 << 19,
  /**
   * User has been identified as spammer
   *
   * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
   */
  Spammer = 1 << 20,
  /**
   * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
   */
  DisablePremium = 1 << 21,
  /**
   * User is an [Active Developer](https://support-dev.discord.com/hc/articles/10113997751447)
   */
  ActiveDeveloper = 1 << 22,
  /**
   * User's account has been [quarantined](https://support.discord.com/hc/articles/6461420677527) based on recent activity
   *
   * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
   *
   * @privateRemarks
   *
   * This value would be 1 << 44, but bit shifting above 1 << 30 requires bigints
   */
  Quarantined = 17592186044416,
  /**
   * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
   *
   * @privateRemarks
   *
   * This value would be 1 << 50, but bit shifting above 1 << 30 requires bigints
   */
  Collaborator = 1125899906842624,
  /**
   * @unstable This user flag is currently not documented by Discord but has a known value which we will try to keep up to date.
   *
   * @privateRemarks
   *
   * This value would be 1 << 51, but bit shifting above 1 << 30 requires bigints
   */
  RestrictedCollaborator = 2251799813685248,
}

export enum UserPremiumType {
  None,
  NitroClassic,
  Nitro,
  NitroBasic,
}
