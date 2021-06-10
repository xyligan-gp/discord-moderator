declare module 'discord-moderator' { 
    import { EventEmitter } from 'events';
    import { Client, Guild, PermissionString, GuildMember, Channel } from 'discord.js';

    /**
     * Moderator Class
     */
    class Moderator extends EventEmitter {
        /**
         * Moderator Version
         */
        public version: string;

        /**
         * Moderator Author
         */
        public author: string;

        /**
         * Moderator Ready Status
         */
        public ready: boolean;

        /**
         * Moderator Options
         */
        public options: ModeratorOptions;

        constructor(client: Client, options?: ModeratorOptions);

        /**
         * Method for kicking users
         * @param {GuildMember} member Discord GuildMember
         * @param {string} reason Kick Reason
         * @param {string} authorID Kick Author ID
         * @returns {Promise<{ status: boolean, data: { userID: string, guildID: string, reason: string, authorID: string } }>} Kick Object
         */
        kick(member: GuildMember, reason: string, authorID: string): Promise<{ status: boolean, data: { userID: string, guildID: string, reason: string, authorID: string } }>;

        /**
         * Method for banning users
         * @param {GuildMember} member Discord GuildMember
         * @param {string} reason Ban Reason
         * @param {string} authorID Ban Author ID
         * @returns {Promise<{ status: boolean, data: { userID: string, guildID: string, reason: string,  authorID: string } }>} Ban Object
         */
        ban(member: GuildMember, reason: string, authorID: string): Promise<{ status: boolean, data: { userID: string, guildID: string, reason: string, authorID: string } }>;

        /**
         * Method for adding warns to user
         * @param {GuildMember} member Discord GuildMember
         * @param {Channel} channel Discord Channel
         * @param {string} reason Warn Reason
         * @param {string} authorID Warn Author ID
         * @param {string} muteRoleID Mute Role ID
         * @returns {Promise<{ status: boolean, data: WarnData }>} Warn Object
         */
        addWarn(member: GuildMember, channel: Channel, reason: string, authorID: string, muteRoleID: string): Promise<{ status: boolean, data: WarnData }>;

        /**
         * Method for getting user warnings
         * @param {GuildMember} member Discord GuildMember
         * @returns {Promise<{ status: boolean, warns: number, data: Array<WarnData> }>} User Warns Object
         */
        getWarns(member: GuildMember): Promise<{ status: boolean, warns: number, data: Array<WarnData> }>;

        /**
         * Method for removing warnings from a user.
         * @param {GuildMember} member Discord GuildMember
         * @returns {Promise<{ status: boolean, warns: number, data: Array<WarnData> }>} User Warns Object
         */
        removeWarn(member: GuildMember): Promise<{ status: boolean, warns: number, data: Array<WarnData> }>;

        /**
         * Method for issuing a mute to a user
         * @param {GuildMember} member Discord GuildMember
         * @param {Channel} channel Discord Channel
         * @param {string} muteRoleID Mute Role ID
         * @param {string} muteReason Mute reason
         * @returns {Promise<{ status: boolean, data: MuteData }>} Mute Object
         */
        mute(member: GuildMember, channel: Channel, muteRoleID: string, muteReason: string): Promise<{ status: boolean, data: MuteData }>;

        /**
         * Method for issuing a tempmute to a user
         * @param {GuildMember} member Discord GuildMember
         * @param {Channel} channel Discord Channel
         * @param {string} muteRoleID Mute Role ID
         * @param {string} muteTime Mute Time
         * @param {string} muteReason Mute Reason
         * @returns {Promise<{ status: boolean, data: MuteData }>} Tempmute Object
         */
        tempmute(member: GuildMember, channel: Channel, muteRoleID: string, muteTime: number, muteReason: string): Promise<{ status: boolean, data: MuteData }>;

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

        /**
         * Method for initialization module
         * @returns {void} Returns Moderator Status
         * @private
         */
        private _init(): void;

        /**
         * Method for check Moderator Options
         * @returns {ModeratorError} Moderator Error
         * @private
         */
        private _checkConstructorOptions(): ModeratorError;

        /**
         * Method for checking all mutes
         * @private
         */
        private _checkMutes(): void;

        /**
         * Method for punishment users.
         * @param {GuildMember} member Discord GuildMember
         * @param {Channel} channel Discord Channel
         * @param {number} warnsLength User Warns Count
         * @param {string} muteRoleID Mute Role ID
         * @param {string} authorID Author ID
         * @returns {Promise<{ status: boolean, data: { punishType: string, userID: string, reason: string } }>} Punish Object
         * @private
         */
        private _punishUser(member: GuildMember, channel: Channel, warnsLength: number, muteRoleID: string, authorID: string): Promise<{ status: boolean, data: { punishType: string, userID: string, reason: string } }>;

        /**
        * Method for checking permissions on the server
         * @param {Array<PermissionsString>} permissionsArray Permissions Array
         * @param {Guild} guild Discord Guild
         * @returns {boolean} Boolean
         */
        private _checkPermissions(permissionsArray: Array<PermissionString>, guild: Guild): boolean;

        on<K extends keyof ModeratorEvents>(
            event: K,
            listener: (...args: ModeratorEvents[K][]) => void
        ): this;

        emit<K extends keyof ModeratorEvents>(event: K, ...args: ModeratorEvents[K][]): boolean;
    }

    class ModeratorError extends Error {
        /**
         * Name of the Error
         */
        public name: 'ModeratorError'

        constructor(message: string | Error) { }
    }

    namespace Moderator {
        declare const version: '1.1.1'
    }
    
    export = Moderator;
}

/**
 * Moderator Options
 */
interface ModeratorOptions {
    /**
     * Mute System Status
     */
    muteSystem: boolean;

    /**
     * Warn System Status
     */
    warnSystem: boolean;

    /**
     * Mute System Configuration
     */
    muteConfig: MuteConfiguration;

    /**
     * Warn System Configuration
     */
    warnConfig: WarnConfiguration;
}

/**
 * Mute System Configuration
 */
interface MuteConfiguration {
    /**
     * Table Name For Mute System
     */
    tableName: string;

    /**
     * Mutes Check Interval
     */
    checkCountdown: number;
}

/**
 * Warn System Configuration
 */
interface WarnConfiguration {
    /**
     * Table Name For Warn System
     */
    tableName: string;

    /**
     * Maximum number of warns for punishment
     */
    maxWarns: number;

    /**
     * User punishment type
     */
    punishment: 'tempmute' | 'mute' | 'kick' | 'ban';

    /**
     * Mute time when reaching the warnings limit
     */
    muteTime: string;
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

interface WarnData {
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
     * Current Time
     */
    nowTime: number;

    /**
     * Warn Index
     */
    warnNumber: number;

    /**
     * Warn Reason
     */
    warnReason: string;

    /**
     * Warn By User
     */
    warnBy: string;
}

/**
 * All module events
 */
interface ModeratorEvents {
    /**
     * Emits when the user is kicked from the server
     */
    kick: { userID: string, guildID: string, reason: string, authorID: string };

    /**
     * Emits when a user is banned from the server
     */
    ban: { userID: string, guildID: string, reason: string, authorID: string };

    /**
     * Emits when a warning is given to the user
     */
    addWarn: WarnData;

    /**
     * Emits when warnings are taken from the user
     */
    removeWarn: { warns: number, data: Array<WarnData> };

    /**
     * Emits when the user is given a mute
     */
    addMute: MuteData;

    /**
     * Emits when the user has removed a mute
     */
    removeMute: { userID: string, guildID: string };

    /**
     * Emits when the user's temporary mute ends
     */
    muteEnded: MuteData;
}