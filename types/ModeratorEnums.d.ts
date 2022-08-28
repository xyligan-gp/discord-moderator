export enum Events {
    READY = "ready",
    BAN = "ban",
    KICK = "kick",
    UNBAN = "unban",
    MUTE_ENDED = "muteEnded",
    MUTE_STARTED = "muteStarted"
}

export enum MuteType {
    TEMPORARY = "MUTE_TEMPORARY",
    PERMANENT = "MUTE_PERMANENT"
}

export enum PunishmentType {
    MUTE = "PUNISHMENT_MUTE",
    TEMPMUTE = "PUNISHMENT_TEMPMUTE",
    BAN = "PUNISHMENT_BAN",
    KICK = "PUNISHMENT_KICK"
}

export enum ClearType {
    ALL = "CLEAR_ALL",
    GUILD = "CLEAR_GUILD",
    USER_GUILD = "CLEAR_USER_GUILD",
    USER_GLOBAL = "CLEAR_USER_GLOBAL"
}