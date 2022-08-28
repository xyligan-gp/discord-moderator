import Enmap from "enmap";
import { Client, GuildMember, TextChannelResolvable } from "discord.js";

import { ModeratorEmitter } from "./ModeratorEmitter";

import { MuteManager } from "./managers/MuteManager";
import { WarnManager } from "./managers/WarnManager";
import { FetchManager } from "./managers/FetchManager";
import { UtilsManager } from "./managers/UtilsManager";

import { ModeratorOptions } from "../types/ModeratorOptions";

import { DefaultObject, PunishOptions } from "../types/ModeratorData";
import { ModeratorGuildData, ModeratorUsers } from "../types/ModeratorDatabase";

import { Events, MuteType, PunishmentType } from "./ModeratorEnums";

import { author, version, homepage } from "../package.json";

/**
 * Class that controls Moderation System
 * 
 * @class
 * @classdesc Moderator Class
 * @extends {ModeratorEmitter}
 */
export class Moderator extends ModeratorEmitter {
    public client: Client;
    public database: Enmap<string, ModeratorGuildData>;

    public author: string;
    public website: string;
    public version: string;

    public ready: boolean;
    public readyTimestamp: number;
    public options: ModeratorOptions;

    public mutes: MuteManager | null;
    public warns: WarnManager | null;
    public fetcher: FetchManager;
    public utils: UtilsManager;

    /**
     * @constructor
     *
     * @param {Client} client Discord Client
     * @param {ModeratorOptions} [options] Module Options
     */
    constructor(client: Client, options?: ModeratorOptions) {
        super();
        
        /**
         * Discord Client
         * 
         * @type {Client}
         * @private
         */
        this.client = client;

        /**
         * Moderator Database
         * 
         * @type {Enmap<string, ModeratorGuildData>}
         */
        this.database = null;

        /**
         * Moderator Author
         * 
         * @type {string}
         */
        this.author = author;

        /**
         * Moderator WebSite URL
         * 
         * @type {string}
         */
        this.website = homepage;

        /**
         * Moderator Version
         * 
         * @type {string}
         */
        this.version = version;

        /**
         * Moderator Ready Status
         * 
         * @type {boolean}
         */
        this.ready = null;

        /**
         * Moderator Options
         * 
         * @type {ModeratorOptions}
         */
        this.options = null;

        /**
         * Moderator Mute Manager
         * 
         * @type {?MuteManager}
         */
        this.mutes = null;

        /**
         * Moderator Warn Manager
         * 
         * @type {?WarnManager}
         */
        this.warns = null;

        /**
         * Moderator Fetch Manager
         * 
         * @type {FetchManager}
         */
        this.fetcher = null;

        /**
         * Moderator Utils Manager
         * 
         * @type {UtilsManager}
         */
        this.utils = new UtilsManager(this);
        
        this.init(options);
    }

    /**
     * Method for kicking Discord guild users
     * 
     * @param {GuildMember} member Discord Guild Member
     * @param {string} [reason] Kick Reason
     * 
     * @returns {Promise<DefaultObject>} Returns the state of the action or an object with an error
     */
    public kick(member: GuildMember, reason?: string): Promise<DefaultObject> {
        return new Promise(async (res, rej) => {
            if(!member.kickable) return res(
                {
                    status: false,
                    message: `A target with ID '${member.id}' cannot be kicked!`
                }
            )

            try {
                await member.kick(reason);
            } catch(error) {
                return res(
                    {
                        status: false,
                        message: error.message
                    }
                )
            }

            this.emit(Events.KICK, member.guild, member);

            return res({ status: true });
        })
    }

    /**
     * Method for banning Discord guild users
     * 
     * @param {GuildMember} member Discord Guild Member
     * @param {string} [reason] Ban Reason
     * 
     * @returns {Promise<DefaultObject>} Returns the state of the action or an object with an error
     */
    public ban(member: GuildMember, reason?: string): Promise<DefaultObject> {
        return new Promise(async (res, rej) => {
            if(!member.bannable) return res(
                {
                    status: false,
                    message: `The target with ID '${member.id}' cannot be banned!`
                }
            )

            try {
                await member.ban({ reason: reason });
            } catch(error) {
                return res(
                    {
                        status: false,
                        message: error.message
                    }
                )
            }

            this.emit(Events.BAN, member.guild, member);

            return res({ status: true });
        })
    }

    /**
     * Method for removing bans from Discord guild users
     * 
     * @param {string} guildID Discord Guild ID
     * @param {string} memberID Discord Guild Member ID
     * 
     * @returns {Promise<DefaultObject>} Returns the state of the action or an object with an error
     */
    public unban(guildID: string, memberID: string): Promise<DefaultObject> {
        return new Promise(async (res, rej) => {
            const guild = await this.fetcher.guild(guildID);
            const guildBans = await guild?.bans.fetch();

            const guildMemberBan = guildBans?.find(guildBan => guildBan.user.id === memberID);
            
            if(!guildMemberBan) return res(
                {
                    status: false,
                    message: `The target with ID '${memberID}' has no bans on the server with ID '${guildID}'!`
                }
            )

            try {
                await guild?.members?.unban(guildMemberBan.user);
            } catch(error) {
                return res(
                    {
                        status: false,
                        message: error.message
                    }
                )
            }

            this.emit(Events.UNBAN, guildMemberBan.guild, guildMemberBan.user);

            return res({ status: true });
        })
    }

    /**
     * Method for punishing Discord guild users
     * 
     * @param {PunishmentType} type Punihment Type
     * @param {GuildMember} member Discord Guild Member
     * @param {PunishOptions} options Punish Options
     * 
     * @returns {Promise<DefaultObject>} Returns the state of the action or an object with an error
     */
    public punish(type: PunishmentType, member: GuildMember, options: PunishOptions): Promise<DefaultObject> {
        return new Promise(async (res, rej) => {
            let isSuccess = false;

            switch(type) {
                case PunishmentType.BAN: {
                    await this.ban(member, options.reason);

                    isSuccess = true;

                    break;
                }

                case PunishmentType.KICK: {
                    await this.kick(member, options.reason);

                    isSuccess = true;

                    break;
                }

                case PunishmentType.MUTE: {
                    await this.mutes?.create(MuteType.PERMANENT, {
                        reason: options.reason,
                        moderator: options.moderator,

                        member: member,
                        channel: options.channel
                    })

                    isSuccess = true;

                    break;
                }

                case PunishmentType.TEMPMUTE: {
                    await this.mutes?.create(MuteType.PERMANENT, {
                        time: options.time,
                        reason: options.reason,
                        moderator: options.moderator,

                        member: member,
                        channel: options.channel
                    })

                    isSuccess = true;

                    break;
                }
            }

            return res({ status: isSuccess });
        })
    }

    /**
     * Method for module initialization
     * 
     * @param {ModeratorOptions} [options] Moderator Options
     * 
     * @private
     */
    private init(options?: ModeratorOptions): void {
        const interval = setInterval(async () => {
            if(this.client.isReady()) {
                this.utils.fetchIntents();

                this.ready = true;
                this.readyTimestamp = Date.now();
                this.options = this.utils.fetchOptions(options ?? {});

                this.initDatabase();
                this.initManagers();

                this.emit(Events.READY, this);

                clearInterval(interval);
            }
        }, 100)
    }

    /**
     * Method for initializing the module database
     * 
     * @private
     */
    private initDatabase(): void {
        this.database = new Enmap({
            name: this.options.database.name,
            dataDir: this.options.database.path,
            wal: false
        })
    }

    /**
     * Method for initializing all module managers
     * 
     * @private
     */
    private initManagers(): void {
        if(this.options.managers.mute.isEnabled) this.mutes = new MuteManager(this);
        if(this.options.managers.warn.isEnabled) this.warns = new WarnManager(this);

        this.fetcher = new FetchManager(this);
    }
}

/**
 * @typedef {object} ModeratorOptions
 * 
 * @prop {DatabaseConfig} [database] Moderator Database Configuration
 * @prop {ModeratorManagers} [managers] Moderator Managers Configuration
 */

/**
 * @typedef {object} DatabaseConfig
 * 
 * @prop {string} [path="./"] Database Path
 * @prop {string} [name="moderator"] Database Name
 */

/**
 * @typedef {object} ModeratorManagers
 * 
 * @prop {MuteManagerConfig} [mute] Moderator Mute Manager
 */

/**
 * @typedef {object} MuteManagerConfig
 * 
 * @prop {boolean} [isEnabled=true] Mute Manager State
 * @prop {number} [interval=5000] Mute Manager Check Interval
 */

/**
 * @typedef {object} ModeratorGuildData
 * 
 * @prop {string} guildID Discord Guild ID
 * @prop {string} muteRole Discord Guild Mute Role ID
 * @prop {Array<GuildMute>} mutes Discord Guild Mutes Array
 * @prop {Array<GuildWarn>} warns Discord Guild Warns Array
 */

/**
 * @typedef {object} GuildMute
 * 
 * @prop {string} guildID Discord Guild ID
 * @prop {string} channelID Discord Guild Channel ID
 * @prop {ModeratorUsers} users Mute Users
 * @prop {number} time Mute Time
 * @prop {string} reason Mute Reason
 * @prop {number} mutedAt Date and time of mute in milliseconds
 * @prop {number} unmutedAt Date and time of mute removal in milliseconds
 */

/**
 * @typedef {object} ModeratorUsers
 * 
 * @prop {string} target Mute Target ID
 * @prop {string} moderator Mute Moderator ID
 */

/**
 * @typedef {object} DefaultObject
 * 
 * @prop {boolean} status Status of a specific operation
 * @prop {string} [message] Text of the error, if any
 */

/**
 * @typedef {object} CreationMuteOptions
 * 
 * @prop {number} [time] Mute Time
 * @prop {string} [reason] Mute Reason
 * @prop {string} [moderator] Mute Moderator ID
 * @prop {GuildMember} member Mute Target
 * @prop {TextChannelResolvable} channel Guild Text Channel Resolvable
 */