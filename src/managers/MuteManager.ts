import { Role, TextChannel } from "discord.js";

import { Moderator } from "../Moderator";

import { Events, MuteType } from "../ModeratorEnums";

import { GuildMute } from "../../types/ModeratorDatabase";
import { CreationMuteOptions, DefaultObject } from "../../types/ModeratorData";

/**
 * Class that controls Moderation Mute System
 * 
 * @class
 * @classdesc Moderator Mute Manager Class
 */
export class MuteManager {
    private moderator: Moderator;

    /**
     * @constructor
     *
     * @param {Moderator} moderator Moderator Class
     */
    constructor(moderator: Moderator) {
        /**
         * Moderator Class
         * 
         * @type {Moderator}
         * @private
         */
        this.moderator = moderator;

        this.moderator.client.on("guildMemberAdd", async guildMember => {
            if(this.moderator.options.managers.mute.isMutingOnJoin) {
                const guildMuteRole = this.moderator.database.get(guildMember.guild.id)?.muteRole;
                const guildMemberMute = await this.get(guildMember.guild.id, guildMember.id);

                if(guildMemberMute) await guildMember.roles.add(guildMuteRole);
            }
        })

        this.moderator.on(Events.READY, (moderator: Moderator) => {
            if(moderator.options.managers.mute.isEnabled) {
                setInterval(() => {
                    const moderatorData = moderator.database.array();

                    moderatorData.forEach(guildData => {
                        const guildMutesData = guildData.mutes;

                        guildMutesData.forEach(async guildMute => {
                            if(!guildMute.unmutedAt && (Date.now() - guildMute.mutedAt) > guildMute.time) {
                                const guild = await this.moderator.fetcher.guild(guildData.guildID);

                                if(guild) {
                                    const unmuteTarget = await this.moderator.fetcher.member(guild.id, guildMute.users.target);

                                    await this.delete(guild.id, unmuteTarget.id);
                                }
                            }
                        })
                    })
                }, this.moderator.options.managers.mute.interval)
            }
        })
    }

    /**
     * Method for setting the server role mute
     * 
     * @param {string} guildID Discord Guild ID
     * @param {string} roleID Discord Guild Mute Role ID
     * 
     * @returns {Promise<DefaultObject>} Returns the state of action execution
     */
    public setRole(guildID: string, roleID: string): Promise<DefaultObject> {
        return new Promise(async (res, rej) => {
            this.moderator.utils.fetchGuild(guildID);

            const guilData = this.moderator.database.get(guildID);

            guilData.muteRole = roleID;

            this.moderator.database.set(guildID, guilData);

            return res({ status: guilData.muteRole != null });
        })
    }

    /**
     * A method to get a server role mute
     * 
     * @param {string} guildID Discord Guild ID
     * 
     * @returns {Promise<Role>} Discord Guild Mute Role Object
     */
    public getRole(guildID: string): Promise<Role> {
        return new Promise(async (res, rej) => {
            this.moderator.utils.fetchGuild(guildID);

            const guilData = this.moderator.database.get(guildID);

            const muteRole = await this.moderator.fetcher.role(guildID, guilData?.muteRole);

            return res(muteRole || null);
        })
    }

    /**
     * Method for removing the server role mute
     * 
     * @param {string} guildID Discord Guild ID
     * 
     * @returns {Promise<DefaultObject>} Returns the state of action execution
     */
    public deleteRole(guildID: string): Promise<DefaultObject> {
        return new Promise(async (res, rej) => {
            this.moderator.utils.fetchGuild(guildID);

            const guilData = this.moderator.database.get(guildID);

            guilData.muteRole = null;

            this.moderator.database.set(guildID, guilData);

            return res({ status: guilData.muteRole === null });
        })
    }

    /**
     * Method for issuing a muth to a Discord Guild user
     * 
     * @param {MuteType} type Mute Type
     * @param {CreationMuteOptions} options Creation Mute Options
     * 
     * @returns {Promise<GuildMute | DefaultObject>} Returns an object with muta data or an object with an error
     */
    public create(type: MuteType, options: CreationMuteOptions): Promise<GuildMute | DefaultObject> {
        return new Promise(async (res, rej) => {
            this.moderator.utils.fetchGuild(options.member.guild.id);
            
            const guilData = this.moderator.database.get(options.member.guild.id);
            const guildMemberMute = guilData?.mutes?.find(mute => mute.users.target === options.member.id && !mute.unmutedAt);

            const member = {
                target: options.member,
                moderator: (await this.moderator.fetcher.member(options.member.guild.id, options.moderator ?? this.moderator.client.user.id))
            }

            if(!guilData.muteRole) return res(
                {
                    status: false,
                    message: `To issue mutes to server users with ID '${options.member.guild.id}' you must set the role with <MuteManager>.setRole()`
                }
            )

            if([MuteType.TEMPORARY].includes(type) && !options.time) return res(
                {
                    status: false,
                    message: "To issue a temporary mute it is necessary to specify the time for which it will be issued!"
                }
            )

            if(guildMemberMute) return res(
                {
                    status: false,
                    message: `The user with ID '${options.member.id}' already has a lock on the server with ID '${options.member.guild.id}'!`
                }
            )

            if(member.target.roles.highest.position >= member.moderator.roles.highest.position) return res(
                {
                    status: false,
                    message: `The target role with ID '${member.target.id}' is above and overlaps the moderator role '${member.moderator.id}'!`
                }
            )

            if(member.target.permissions.has("Administrator")) return res(
                {
                    status: false,
                    message: `The target with ID '${member.target.id}' has administrator permissions, which does not allow to give out a mute!`
                }
            )

            const defaultMuteData: GuildMute = {
                type: type,
                channelID: options.channel instanceof TextChannel ? options.channel.id : options.channel,

                users: {
                    target: options.member.id,
                    moderator: options.moderator ?? this.moderator.client.user.id
                },

                time: options.time ?? null,
                reason: options.reason ?? null,
                mutedAt: Date.now(),
                unmutedAt: null
            }

            try {
                await options.member.roles.add(guilData.muteRole);
            } catch(error) {
                return res(
                    {
                        status: false,
                        message: error.message
                    }
                )
            }

            guilData.mutes.push(defaultMuteData);

            this.moderator.database.set(options.member.guild.id, guilData);

            this.moderator.emit(Events.MUTE_STARTED, options.member.guild, defaultMuteData);
            
            return res(defaultMuteData);
        })
    }

    /**
     * A method for obtaining data on the user's active mute on the Discord guild
     * 
     * @param {string} guildID Discord Guild ID
     * @param {string} memberID Discord Guild Member ID
     * 
     * @returns {Promise<GuildMute>} Returns the object with the data of the active mute or the null
     */
    public get(guildID: string, memberID: string): Promise<GuildMute> {
        return new Promise(async (res, rej) => {
            this.moderator.utils.fetchGuild(guildID);

            const guilData = this.moderator.database.get(guildID);
            const guildMemberMute = guilData?.mutes?.find(mute => mute.users.target === memberID && !mute.unmutedAt);

            return res(guildMemberMute);
        })
    }

    /**
     * A method for obtaining an array of mutes of a specific Discord guild or user from it
     * 
     * @param {string} guildID Discord Guild ID
     * @param {string} memberID Discord Guild Member ID
     * 
     * @returns {Promise<Array<GuildMute>>} Returns an array of Discord mutes of a guild or user
     */
    public list(guildID: string, memberID?: string): Promise<Array<GuildMute>> {
        return new Promise(async (res, rej) => {
            this.moderator.utils.fetchGuild(guildID);

            const guilData = this.moderator.database.get(guildID);

            if(memberID) {
                const guildMemberMutes = guilData?.mutes?.filter(mute => mute.users.target === memberID);

                return res(guildMemberMutes || []);
            }else return res(guilData?.mutes || []);
        })
    }

    /**
     * A method for removing muths from Discord guild users
     * 
     * @param {string} guildID Discord Guild ID
     * @param {string} memberID Discord Guild Member ID
     * 
     * @returns {Promise<DefaultObject>} Returns the state of the action or an object with an error
     */
    public delete(guildID: string, memberID: string): Promise<DefaultObject> {
        return new Promise(async (res, rej) => {
            this.moderator.utils.fetchGuild(guildID);

            const guilData = this.moderator.database.get(guildID);
            const guildMemberMute = guilData?.mutes?.find(mute => mute.users.target === memberID && !mute.unmutedAt);

            if(!guilData.muteRole) return res(
                {
                    status: false,
                    message: `To remove mutes from server users with ID '${guildID}', you must set the role with <MuteManager>.setRole()`
                }
            )

            if(!guildMemberMute) return res(
                {
                    status: false,
                    message: `The target with ID '${memberID}' has no locks on the server with ID '${guildID}'!`
                }
            )

            const guild = await this.moderator.fetcher.guild(guildID);
            const guildMember = await this.moderator.fetcher.member(guildID, memberID);
            
            try {
                await guildMember?.roles?.remove(guilData.muteRole);
            } catch(error) {
                return res(
                    {
                        status: false,
                        message: error.message
                    }
                )
            }

            guildMemberMute.unmutedAt = Date.now();

            guilData?.mutes?.filter(mute => mute.users.target != memberID && !mute.unmutedAt);
            guilData?.mutes?.push(guildMemberMute);

            this.moderator.database.set(guildID, guilData);

            this.moderator.emit(Events.MUTE_ENDED, guild, guildMemberMute);

            return res({ status: guildMember?.roles?.cache.has(guilData.muteRole) });
        })
    }
}