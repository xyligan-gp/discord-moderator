import { Guild, GuildMember, User } from "discord.js";

import { Moderator } from "./Moderator";

import { GuildMute, GuildWarn } from "./ModeratorDatabase";

export interface ModeratorEvents {
    ready: [moderator: Moderator];
    
    ban: [guild: Guild, member: GuildMember];
    kick: [guild: Guild, member: GuildMember];
    unban: [guild: Guild, user: User];

    addWarn: [guild: Guild, warn: GuildWarn];
    removeWarn: [guild: Guild, warn: GuildWarn];

    muteEnded: [guild: Guild, mute: GuildMute];
    muteStarted: [guild: Guild, mute: GuildMute];
}