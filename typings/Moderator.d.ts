import { Client, Guild, PermissionString, GuildMember, TextChannel, Role, Collection, User } from 'discord.js';
import Emitter from 'discord-moderator/src/managers/Emitter.js';

declare module 'discord-moderator' { 
    class Moderator extends Emitter {
        constructor(client: Client, options?: ModeratorOptions);

        /**
         * Moderator Version
        */
        public version: string;

        /**
         * Moderator Author
        */
        public author: string;

        /**
         * Moderator Documentation Link
        */
        public docs: string;

        /**
         * Moderator Ready Status
        */
        public ready: boolean;

        /**
         * Moderator Managers Count
        */
        public size: number;

        /**
         * Moderator Managers
        */
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
        public blacklist: BlacklistManager;

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
        constructor(message: string | Error);

        public name: 'ModeratorError'
    }

    class UtilsManager {
        constructor(client: Client, options: ModeratorOptions);

        /**
         * Manager Methods Count
        */
        public size: number;

        /**
         * Manager Methods
        */
        public methods: Array<string>;

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
        checkClientPermissions(permissionsArray: Array<PermissionString>, guild: Guild): boolean;

        /**
         * Method for checking member permissions on the server
         * @param permissionsArray Array with permissions to check
         * @param member Guild Member
         * @returns Boolean value that will indicate the presence/absence of permissions
        */
        checkMemberPermissions(permissionsArray: Array<PermissionString>, member: GuildMember): boolean;

        /**
         * Method for getting a random number in between
         * @param min Minimum value
         * @param max Maximum value
         * @returns Returns a random number in a given range
        */
        getRundomNumber(min: number, max: number): number;

        /**
         * Method for getting a random string
         * @param stringsArray Strings Array
         * @returns Returns a random string
        */
        getRandomString(stringsArray: Array<string>): string;

        /**
         * Method for checking user existence
         * @param guild Discord Guild
         * @param member Guild Member or User ID
         * @returns Returns the user verification status and information about him
        */
        fetchMember(guild: Guild, member: GuildMember | string): { status: boolean, data: User | string };
    }

    class WarnManager extends Emitter {
        constructor(client: Client, options: ModeratorOptions);

        /**
         * Manager Methods Count
        */
        public size: number;

        /**
         * Manager Methods
        */
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
        clearGuild(guild: Guild): Promise<boolean>;

        /**
         * Method for removing all warns from the database
         * @returns Removing Status
        */
        clearAll(): Promise<boolean>;
    }

    class PunishmentManager extends Emitter {
        constructor(client: Client, options: ModeratorOptions);

        /**
         * Manager Methods Count
        */
        public size: number;

        /**
         * Manager Methods
        */
        public methods: Array<string>;

        /**
         * Method for kicking users
         * @param member Guild Member
         * @param reason Kicking Reason
         * @param authorID Kick Author ID
         * @returns Returns kick status, reason and more
        */
        kick(member: GuildMember, reason: string, authorID: string): Promise<{ status: boolean, data: KickData }>;
        
        /**
         * Method for banning users
         * @param member Guild Member
         * @param reason Banning Reason
         * @param authorID Ban Author ID
         * @returns Returns ban status, reason and more
        */
        ban(member: GuildMember, reason: string, authorID: string): Promise<{ status: boolean, data: BanData }>;

        /**
         * Method for punishment users
         * @param member Guild Member
         * @param channel Guild Channel
         * @param muteRoleID Mute Role ID
         * @param authorID Punish Author ID
         * @returns Returns the status of the punishment, its type, reason, and more
        */
        punish(member: GuildMember, channel: TextChannel, muteRoleID: string, authorID: string): Promise<{ status: boolean, data: PunishData }>;
    }

    class MuteManager extends Emitter {
        constructor(client: Client, options: ModeratorOptions);

        /**
         * Manager Methods Count
        */
        public size: number;

        /**
         * Manager Methods
        */
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
        clearGuild(guild: Guild): Promise<boolean>;

        /**
         * Method for removing all mutes from the database
         * @returns Removing Status
        */
        clearAll(): Promise<boolean>;
    }

    class RolesManager {
        constructor(client: Client, options: ModeratorOptions);

        /**
         * Manager Methods Count
        */
        public size: number;

        /**
         * Manager Methods
        */
        public methods: Array<string>;

        /**
         * Method for creating roles on the server
         * @param guild Discord Guild
         * @param options Role Options
         * @returns Returns the role creation status and information about it
        */
        create(guild: Guild, options: RoleOptions): Promise<{ status: boolean, role: Role }>;

        /**
         * Method for adding roles to server users
         * @param member Guild Member
         * @param role Guild Role or Role Name
         * @returns Returns the status of adding a role and other information
        */
        add(member: GuildMember, role: Role | string): Promise<{ status: boolean, member: GuildMember, role: Role }>;

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
         * @returns Returns the status of removing a role from a user and other information
        */
        remove(member: GuildMember, role: Role): Promise<{ status: boolean, member: GuildMember, role: Role }>;

        /**
         * Method for removing roles from the server
         * @param guild Discord Guild
         * @param role Guild Role or Name
         * @returns Returns the status of removing a role from the server and information about it
        */
        delete(guild: Guild, role: Role | string): Promise<{ status: boolean, role: Role }>;
    }

    class BlacklistManager {
        constructor(client: Client, options: ModeratorOptions);

        /**
         * Manager Methods Count
        */
        public size: number;

        /**
         * Manager Methods
        */
        public methods: Array<string>;

        /**
         * Method for blocking a user on the server
         * @param guild Discord Guild
         * @param member Guild Member
         * @param reason Blocking Reason
         * @param authorID Block Author ID
         * @returns Returns the user blocking status and information about it
        */
        add(guild: Guild, member: GuildMember | string, reason: string, authorID: string): Promise<{ status: boolean, data: BlockData }>;

        /**
         * Method for getting the status of a user blocking and information about it
         * @param guild Discord Guild
         * @param member Guild Member or User ID
         * @returns Returns the user block status and information about it
        */
        get(guild: Guild, member: GuildMember | string): Promise<{ status: boolean, data: BlockData }>;

        /**
         * Method for getting all server blocks
         * @param guild Discord Guild
         * @returns Returns information about server blocks
        */
        getAll(guild: Guild): Promise<{ status: boolean, data: Array<BlockData> }>;

        /**
         * Method for removing blocks from a specific server
         * @param guild Discord Guild
         * @returns Removing Status
        */
        clearGuild(guild: Guild): Promise<boolean>;

        /**
         * Method for removing all blocks from the database
         * @returns Removing Status
        */
        clearAll(): Promise<boolean>;

        /**
         * Method for removing a block to a user
         * @param guild Discord Guild
         * @param member Guild Member or User ID
         * @returns Returns the user unlock status and information about it
        */
        remove(guild: Guild, member: GuildMember | string): Promise<{ status: boolean, searchUser: boolean, data: BlockData }>;
    }

    namespace Moderator {
        declare const version: '1.1.6'
    }
    
    export = Moderator;

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
         * BlicklistManager Status
        */
        blacklistManager: boolean;
    
        /**
         * MuteManager Configuration
        */
        muteConfig: MuteManagerConfiguration;
    
        /**
         * WarnManager Configuration
        */
        warnConfig: WarnManagerConfiguration;
    
        /**
         * BlacklistManager Configuration
        */
        blacklistConfig: BlacklistManagerConfiguration;
    }
}

interface MuteManagerConfiguration {
    tableName: string;
    checkCountdown: number;
}

interface WarnManagerConfiguration {
    tableName: string;
    maxWarns: number;
    punishment: 'tempmute' | 'mute' | 'kick' | 'ban';
    muteTime: string;
}

interface BlacklistManagerConfiguration {
    tableName: string;
    punishment: 'kick' | 'ban';
}

interface MuteData {
    guildID: string;
    userID: string;
    channelID: string;
    muteRoleID: string;
    muteTime: number;
    nowTime: number;
    muteReason: string;
}

interface WarnData {
    guildID: string;
    userID: string;
    channelID: string;
    nowTime: number;
    warnNumber: number;
    warnReason: string;
    warnBy: string;
}

interface KickData {
    userID: string;
    guildID: string;
    reason: string;
    authorID: string;
}

interface BanData {
    userID: string;
    guildID: string;
    reason: string;
    authorID: string;
}

interface PunishData {
    punishType: string;
    userID: string;
    reason: string;
}

interface RoleOptions {
    roleName: string;
    roleColor?: 'DEFAULT' | 'WHITE' | 'AQUA' | 'GREEN' | 'BLUE' | 'YELLOW' | 'PURPLE' | 'LUMINOUS_VIVID_PINK' | 'GOLD' | 'ORANGE' | 'RED' | 'GREY' | 'DARKER GREY' | 'NAVY' | 'DARK_AQUA' | 'DARK_GREEN' | 'DARK_BLUE' | 'DARK_PURPLE' | 'DARK_VIVID_PINK' | 'DARK_GOLD' | 'DARK_ORANGE' | 'DARK_RED' | 'DARK_GREY' | 'LIGHT_GREY' | 'DARK_NAVY' | 'BLURPLE' | 'GREYPLE' | 'DARK_BUT_NOT_BLACK' | 'NOT_QUITE_BLACK' | 'RANDOM';
    hoisted?: boolean;
    position?: number;
    permissionsArray?: Array<PermissionString>;
    mentionable?: boolean;
}

interface BlockData {
    guildID: string;
    userID: string;
    nowTime: number;
    blockNumber: number;
    blockReason: string;
    blockedBy: string;
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