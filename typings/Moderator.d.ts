import { Client, Guild, PermissionString, GuildMember, TextChannel, Role, Collection } from 'discord.js';
import Emitter from 'discord-moderator/src/managers/Emitter.js';

declare module 'discord-moderator' { 
    class Moderator extends Emitter {
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

        public size: number;

        public managers: Array<string>;

        /**
         * Moderator Options
        */
        public options: ModeratorOptions;

        public utils: UtilsManager;
        public warns: WarnManager;
        public punishments: PunishmentManager;
        public mutes: MuteManager;
        public roles: RolesManager;

        constructor(client: Client, options?: ModeratorOptions);

        /**
         * Method for initialization module
         * @private
        */
        private initModerator(): void;

        on<K extends keyof ModeratorEvents>(
            event: K,
            listener: (...args: ModeratorEvents[K][]) => void
        ): this;

        once<K extends keyof ModeratorEvents>(
            event: K,
            listener: (...args: ModeratorEvents[K][]) => void
        ): this;

        emit<K extends keyof ModeratorEvents>(event: K, ...args: ModeratorEvents[K][]): boolean;
    }

    class ModeratorError extends Error {
        public name: 'ModeratorError'

        constructor(message: string | Error);
    }

    class UtilsManager {
        public size: number;

        public methods: Array<string>;
        
        constructor(client: Client, options: ModeratorOptions);

        /**
         * Method for check Moderator Options
         * @returns Correct Moderator Options
        */
        checkOptions(): ModeratorOptions;

        /**
         * Method for checking client permissions on the server
         * @param permissionsArray Array with permissions to check
         * @param guild Discord Guild
         * @returns Boolean value that will indicate the presence/absence of permissions
        */
        checkClientPermissions(permissionsArray: PermissionString, guild: Guild): boolean;

        /**
         * Method for checking member permissions on the server
         * @param permissionsArray Array with permissions to check
         * @param member Guild Member
         * @returns Boolean value that will indicate the presence/absence of permissions
        */
        checkMemberPermissions(permissionsArray: PermissionString, member: GuildMember): boolean;
    }

    class WarnManager extends Emitter {
        constructor(client: Client, options: ModeratorOptions);

        public size: number;

        public methods: Array<string>;

        /**
         * Method for adding warns to user
         * @param member Guild Member
         * @param channel Guild Channel
         * @param reason Warning Reason
         * @param authorID Warn Author ID
         * @param muteRoleID Mute Role ID
         * @returns Returns the warning status and warning data
        */
        add(member: GuildMember, channel: TextChannel, reason: string, authorID: string, muteRoleID: string): Promise<{ status: boolean, data: WarnData }>;
        
        /**
         * Method for getting warning information
         * @param member Guild Member
         * @param index Warn Index
         * @returns Returns information about the warning
        */
        get(member: GuildMember, index: number): Promise<WarnData>;

        /**
         * Method for getting all user warnings
         * @param member Guild Member
         * @returns Returns an array with all user warnings
        */
        getAll(member: GuildMember): Promise<{ status: boolean, warns: number, data: Array<WarnData> }>;

        /**
         * Method for removing warnings from a user
         * @param member Guild Member
         * @returns Returns the status of deleting warnings, their number and information
        */
        remove(member: GuildMember): Promise<{ status: boolean, warns: number, data: Array<WarnData> }>;

        /**
         * Method for removing warnings for a specific server
         * @param guild Discord Guild
         * @returns Removing Status
        */
        clearGuild(guild: Guild): boolean;

        /**
         * Method for removing all warns from the database
         * @returns Removing Status
        */
        clearAll(): boolean;
    }

    class PunishmentManager extends Emitter {
        constructor(client: Client, options: ModeratorOptions);

        public size: number;

        public methods: Array<string>;

        /**
         * Method for kicking users
         * @param member Guild Member
         * @param reason Kicking Reason
         * @param authorID Kick Author ID
         * @returns Returns kick status, reason and more
        */
        kick(member: GuildMember, reason: string, authorID: string): Promise<{ status: boolean, data: { userID: string, guildID: string, reason: string, authorID: string } }>;
        
        /**
         * Method for banning users
         * @param member Guild Member
         * @param reason Banning Reason
         * @param authorID Ban Author ID
         * @returns Returns ban status, reason and more
        */
        ban(member: GuildMember, reason: string, authorID: string): Promise<{ status: boolean, data: { userID: string, guildID: string, reason: string, authorID: string } }>;

        /**
         * Method for punishment users
         * @param member Guild Member
         * @param channel Guild Channel
         * @param muteRoleID Mute Role ID
         * @param authorID Punish Author ID
         * @returns Returns the status of the punishment, its type, reason, and more
        */
        punish(member: GuildMember, channel: TextChannel, muteRoleID: string, authorID: string): Promise<{ status: boolean, data: { punishType: string, userID: string, reason: string } }>;
    }

    class MuteManager extends Emitter {
        constructor(client: Client, options: ModeratorOptions);

        public size: number;

        public methods: Array<string>;

        /**
         * Method for issuing a mute to a user
         * @param member Guild Member
         * @param channel Guild Channel
         * @param muteRoleID Mute Role ID
         * @param muteReason Muting Reason
         * @returns Returns the mute status and information about it
        */
        add(member: GuildMember, channel: TextChannel, muteRoleID: string, muteReason?: string): Promise<{ status: boolean, data: MuteData }>;

        /**
         * Method for issuing a tempmute to a user
         * @param member Guild Member
         * @param channel Guild Channel
         * @param muteRoleID Mute Role ID
         * @param muteTime Muting Time
         * @param muteReason Muting Reason
         * @returns Returns the status of issuing a temporary mute and information about it
        */
        temp(member: GuildMember, channel: TextChannel, muteRoleID: string, muteTime: string, muteReason?: string): Promise<{ status: boolean, data: MuteData }>;

        /**
         * Method for getting information about a user mute on the server
         * @param member Guild Member
         * @returns Returns search status and mute information
        */
        get(member: GuildMember): Promise<{ status: boolean, searchGuild: boolean, searchUser: boolean, data: MuteData }>;

        /**
         * Method for getting user mutes on all bot servers
         * @param member Guild Member
         * @returns Returns the search status of the user and all his mutes on the bot servers
        */
        getAll(member: GuildMember): Promise<{ status: boolean, searchUser: boolean, data: Array<MuteData> }>;

        /**
         * Method for removing the mute to the user
         * @param member Guild Member
         * @returns Returns the status of removing a mutate from a user
        */
        remove(member: GuildMember): Promise<{ status: boolean }>;

        /**
         * Method for removing mutes from a specific server
         * @param guild Discord Guild
         * @returns Removing Status
        */
        clearGuild(guild: Guild): boolean;

        /**
         * Method for removing all mutes from the database
         * @returns Removing Status
        */
        clearAll(): boolean;
    }

    class RolesManager {
        constructor(client: Client, options: ModeratorOptions);

        public size: number;

        public methods: Array<string>;

        /**
         * Method for adding roles to server users
         * @param member Guild Member
         * @param role Guild Role or Role Name
        */
        add(member: GuildMember, role: Role | string): void;

        /**
         * Method for getting information about the server role
         * @param role Guild Role or Role Name
         * @returns Returns information about the server role
        */
        get(guild: Guild, role: Role | string): Promise<{ status: boolean, role: Role }>;

        /**
         * Method to get a collection of all server roles
         * @param guild Discord Guild
         * @returns Returns the collection of server roles
        */
        getAll(guild: Guild): Promise<Collection<string, Role>>;

        /**
         * Method for removing roles from server users
         * @param member Guild Member
         * @param role Guild Role or Role Name
        */
        remove(member: GuildMember, role: Role): void;
    }

    namespace Moderator {
        declare const version: '1.1.5'
    }
    
    export = Moderator;
}

/**
 * Moderator Options
 */
interface ModeratorOptions {
    /**
     * MuteManager Status
     */
    muteManager: boolean;

    /**
     * WarnManager Status
     */
    warnManager: boolean;

    /**
     * MuteManager Configuration
     */
    muteConfig: MuteManagerConfiguration;

    /**
     * WarnManager Configuration
     */
    warnConfig: WarnManagerConfiguration;
}

interface MuteManagerConfiguration {
    /**
     * Table Name For MuteManager
     */
    tableName: string;

    /**
     * Mutes Check Interval
     */
    checkCountdown: number;
}

interface WarnManagerConfiguration {
    /**
     * Table Name For WarnManager
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
     * Muting Time
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
     * Warning Reason
     */
    warnReason: string;

    /**
     * Warn By User
     */
    warnBy: string;
}

interface ModeratorEvents {
    /**
     * Emits when the Moderator is initialized
     */
    ready: Client;
    
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
    removeWarn: { guildID: string, userID: string, warns: number, data: Array<WarnData> };

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