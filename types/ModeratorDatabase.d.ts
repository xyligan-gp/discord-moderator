import { MuteType } from "./ModeratorEnums";

export interface ModeratorGuildData {
    guildID: string;
    muteRole: string;

    mutes: Array<GuildMute>;
    warns: Array<GuildWarn>;
}

export interface GuildWarn {
    id: string;
    channelID:string;
    reason: string;
    warnedAt: number;
    unwarnedAt: number;
    users: ModeratorUsers;
}

export interface GuildMute {
    type: MuteType;
    channelID: string;
    
    time: number;
    reason: string;
    mutedAt: number;
    unmutedAt: number;
    users: ModeratorUsers;
}

export interface ModeratorUsers {
    target: string;
    moderator: string;
}