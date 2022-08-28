/**
 * @typedef {object} Events
 * 
 * @prop {string} READY Module 'ready' event
 * @prop {string} BAN Module 'ban' event
 * @prop {string} KICK Module 'kick' event
 * @prop {string} UNBAN Module 'unban' event
 * @prop {string} WARN_ADD Module 'warnAdd' event
 * @prop {string} WARN_REMOVE Module 'warnRemove' event
 * @prop {string} MUTE_ENDED Module 'muteEnded' event
 * @prop {string} MUTE_STARTED Module 'muteStarted' event
 */
export enum Events {
    READY = "ready",
    BAN = "ban",
    KICK = "kick",
    UNBAN = "unban",
    WARN_ADD = "addWarn",
    WARN_REMOVE = "removeWarn",
    MUTE_ENDED = "muteEnded",
    MUTE_STARTED = "muteStarted"
}

/**
 * @typedef {object} MuteType
 * 
 * @prop {string} TEMPORARY Temporary mute type
 * @prop {string} PERMANENT Permanent mute type
 */
export enum MuteType {
    TEMPORARY = "MUTE_TEMPORARY",
    PERMANENT = "MUTE_PERMANENT"
}

/**
 * @typedef {object} PunishmentType
 * 
 * @prop {string} MUTE Punishment 'mute' type
 * @prop {string} TEMPMUTE Punishment 'tempmute' type
 * @prop {string} BAN Punishment 'ban' type
 * @prop {string} KICK Punishment 'kick' type
 */
export enum PunishmentType {
    MUTE = "PUNISHMENT_MUTE",
    TEMPMUTE = "PUNISHMENT_TEMPMUTE",
    BAN = "PUNISHMENT_BAN",
    KICK = "PUNISHMENT_KICK"
}

/**
 * @typedef {object} ClearType
 * 
 * @prop {string} ALL Clear all data mode
 * @prop {string} USER Clear user data mode
 * @prop {string} GUILD Clear guild data mode
 */
export enum ClearType {
    ALL = "CLEAR_ALL",
    USER = "CLEAR_USER",
    GUILD = "CLEAR_GUILD"
}