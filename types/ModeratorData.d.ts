import { GuildMember, GuildResolvable, TextChannelResolvable, UserResolvable } from "discord.js";

import { ClearType, MuteType } from "./ModeratorEnums";

export interface DefaultObject {
    status: boolean;
    message?: string;
}

export interface CreationMuteOptions {
    time?: number;
    reason?: string;
    moderator?: string;
    
    member: GuildMember;
    channel: TextChannelResolvable;
}

export interface CreationWarnOptions {
    reason?: string;
    moderator?: string;

    channel: TextChannelResolvable;
}

export interface PunishOptions {
    time?: number;
    reason?: string;
    moderator?: string;

    member: GuildMember;
    channel: TextChannelResolvable;
}

export interface ClearOptions {
    type?: ClearType;
    user?: string;
    guild?: string;
}