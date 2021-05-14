declare module 'discord-moderator' {
    import { EventEmitter } from 'events';
    import { Client, GuildMember, Channel } from 'discord.js';

    /**
     * Moderator Class
     */
    class Moderator extends EventEmitter {
        /**
         * Moderator version
         */
        public version: string;

        /**
         * Moderator author
         */
        public author: string;

        /**
         * Moderator ready status
         */
        public ready: boolean;

        /**
         * Moderator options
         */
        public options: Options;

        constructor(client: Client, options?: Options);

        /**
         * Method for adding warns to user
         * @param {GuildMember} member Discord GuildMember
         * @param {Channel} channel Discord Channel
         * @param {String} reason Warn Reason
         * @returns {Promise<{ status: boolean, data: { guildID: string, userID: string, channelID: string, nowTime: number, warnNumber: number, warnReason: string, warnBy: string } }>} Warn Object
         */
        addWarn(member: GuildMember, channel: Channel, reason: string, authorID: string): Promise<{ status: boolean, data: { guildID: string, userID: string, channelID: string, nowTime: number, warnNumber: number, warnReason: string, warnBy: string } }>;

        /**
         * Method for getting user warnings
         * @param {GuildMember} member Discord GuildMember
         * @returns {Promise<{ status: boolean, warns: number, data: [{ guildID: string, userID: string, channelID: string, nowTime: number, warnNumber: number, warnReason: string, warnBy: string }] }>} User Warns Object
         */
        getWarns(member: GuildMember): Promise<{ status: boolean, warns: number, data: [{ guildID: string, userID: string, channelID: string, nowTime: number, warnNumber: number, warnReason: string, warnBy: string }] }>;

        /**
         * Method for removing warnings from a user.
         * @param {GuildMember} member Discord GuildMember
         * @return {Promise<{ status: boolean, warns: number, data: [{ guildID: string, userID: string, channelID: string, nowTime: number, warnNumber: number, warnReason: string, warnBy: string }] }>} User Warns Object
         */
        removeWarn(member): Promise<{ status: boolean, warns: number, data: [{ guildID: string, userID: string, channelID: string, nowTime: number, warnNumber: number, warnReason: string, warnBy: string }] }>;

        /**
         * Method for issuing a mute to a user
         * @param {GuildMember} member Discord GuildMember
         * @param {Channel} channel Discord Channel
         * @param {String} muteRoleID Mute Role ID
         * @param {String} muteReason Mute reason
         * @returns {Promise<{ status: boolean, data: { guildID: string, userID: string, channelID: string, muteRoleID: string, muteTime: number, nowTime: number, muteReason: string } }>} Mute Object
         */
        mute(member: GuildMember, channel: Channel, muteRoleID: string, muteReason: string): Promise<{ status: boolean, data: { guildID: string, userID: string, channelID: string, muteRoleID: string, muteTime: number, nowTime: number, muteReason: string } }>;

        /**
         * Method for issuing a tempmute to a user
         * @param {GuildMember} member Discord GuildMember
         * @param {Channel} channel Discord Channel
         * @param {String} muteRoleID Mute Role ID
         * @param {String} muteTime Mute Time
         * @param {String} muteReason Mute Reason
         * @returns {Promise<{ status: boolean, data: { guildID: string, userID: string, channelID: string, muteRoleID: string, muteTime: number, muteReason: string } }>} Tempmute Object
         */
        tempmute(member: GuildMember, channel: Channel, muteRoleID: string, muteTime: number, muteReason: string): Promise<{ status: boolean, data: { guildID: string, userID: string, channelID: string, muteRoleID: string, muteTime: number, nowTime: number, muteReason: string } }>;

        /**
         * Method for removing the mute to the user
         * @param {GuildMember} member Discord GuildMember
         * @returns {Promise<{ status: boolean }>} Unmute Status
         */
        unmute(member: GuildMember): Promise<{ status: boolean }>

        /**
         * Method for removing all mutes from the database
         * @returns {boolean} Clearing Status
         */
        clearMutes(): boolean

        /**
         * Method for removing all warns from the database
         * @returns {boolean} Clearing Status
         */
        clearWarns(): boolean;

        on<K extends keyof ModuleEvents>(
            event: K,
            listener: (...args: ModuleEvents[K][]) => void
        ): this;

        emit<K extends keyof ModuleEvents>(event: K, ...args: ModuleEvents[K][]): boolean;
    }

    class ModeratorError extends Error {
        /**
         * Name of the Error
         */
        public name: 'ModeratorError'

        /**
         * 
         */
        constructor(message: string | Error) { }
    }

    namespace Moderator {
        declare const version: '1.1'
    }
    export = Moderator;
}

/**
 * Moderator Options
 */
interface Options {

    /**
     * Table name for mutes
     */
    mutesTableName?: string;

    /**
     * Mutes check interval
     */
    checkMutesCountdown?: number;

    /**
     * Table name for warns
     */
    warnsTableName: ?string;
}

/**
 * Mute Object
 */
interface MuteData {
    /**
     * Guild ID
     */
    guildID: string;

    /**
     * User ID
     */
    userID: string;

    /**
     * Channel ID
     */
    channelID: string;

    /**
     * Mute Role ID
     */
    muteRoleID: string;

    /**
     * Mute Time
     */
    muteTime: number;

    /**
     * Current Time
     */
    nowTime: number;

    /**
     * Mute Reason
     */
    muteReason: string;
}

/**
 * All module events
 */
interface ModuleEvents {
    /**
     * Emits when someone adds a mute to the user
     */
    muteEnded: MuteData;
}