const { EventEmitter } = require('events'), base = require('quick.db'), { Client, GuildMember, Channel, Guild } = require('discord.js'),
ms = require('discord-moderator/src/modules/ms.js'), ModeratorErrors = require('discord-moderator/src/ModeratorErrors.js'), ModeratorError = require('discord-moderator/src/ModeratorError.js'), { Mute, Warn } = require('discord-moderator/structures/Moderator.js');

/**
 * Moderator Class
*/
module.exports = class Moderator extends EventEmitter {
    /**
     * @param {Client} client Discord Client
     * @param {object} options Moderator Options
     * @param {boolean} options.muteSystem Mute System Status
     * @param {boolean} options.warnSystem Warn System Status
     * @param {object} options.muteConfig Mute System Configuration
     * @param {string} options.muteConfig.tableName Table Name For Mute System
     * @param {number} options.muteConfig.checkCountdown Mutes Check Interval
     * @param {object} options.warnConfig Warn System Configuration
     * @param {string} options.warnConfig.tableName Table Name For Warn System
     * @param {number} options.warnConfig.maxWarns Maximum number of warns for punishment
     * @param {string} options.warnConfig.punishment User punishment type
     * @param {string} options.warnConfig.muteTime Mute time when reaching the warnings limit
    */
    constructor(client, options) {
        super();
        if (!client) return new ModeratorError(ModeratorErrors.requireClient);

        /**
         * Discord Client
        */
        this.client = client;

        /**
         * Whether the manager is ready
        */
        this.ready = false;

        /**
         * Moderator Options Manager
        */
        this.options = options;

        client.on('guildMemberAdd', async member => {
            if(!this._checkPermissions(['MANAGE_ROLES'], member.guild)) return new ModeratorError(ModeratorErrors.MissingPermissions);

            const mutesData = base.fetch(this.options.muteConfig.tableName);

            if(!mutesData || mutesData === null) return;

            const searchMutes = mutesData.find(data => data.userID === member.id);
            if(!searchMutes) return;

            if(searchMutes.guildID != member.guild.id) return;

            const muteRolePosition = member.guild.roles.cache.get(searchMutes.muteRoleID).position;
            const clientRolePosition = member.guild.members.cache.get(client.user.id).roles.highest.position;

            if(muteRolePosition > clientRolePosition) return new ModeratorError(ModeratorErrors.MissingAccess);

            member.roles.add(searchMutes.muteRoleID);
        })

        client.once('ready', () => {
            this._checkConstructorOptions();

            this._checkMutes();
        })
    }

    /**
     * Method for kicking users
     * @param {GuildMember} member Discord GuildMember
     * @param {string} reason Kick Reason
     * @param {string} authorID Kick Author ID
     * @returns {Promise<{ status: boolean, data: { userID: string, guildID: string, reason: string, authorID: string } }>} Kick Object
    */
    kick(member, reason, authorID) {
        return new Promise(async (resolve, reject) => {
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!reason) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'reason')));
            if(!authorID) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'authorID')));

            if(!this._checkPermissions(['KICK_MEMBERS'], member.guild)) return reject(new ModeratorError(ModeratorErrors.MissingPermissions));

            const guild = this.client.guilds.cache.get(member.guild.id);
            const memberRolePosition = member.roles.highest.position;
            const clientRolePosition = guild.members.cache.get(this.client.user.id).roles.highest.position;

            if(memberRolePosition > clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));
            
            guild.members.cache.get(member.id).kick(reason);

            this.emit('kick', { userID: member.id, guildID: guild.id, reason: reason, authorID: authorID });
            return resolve({ status: true, data: { userID: member.id, guildID: guild.id, reason: reason, authorID: authorID } });
        })
    }

    /**
     * Method for banning users
     * @param {GuildMember} member Discord GuildMember
     * @param {string} reason Ban Reason
     * @param {string} authorID Ban Author ID
     * @returns {Promise<{ status: boolean, data: { userID: string, guildID: string, reason: string, authorID: string } }>} Ban Object
    */
    ban(member, reason, authorID) {
        return new Promise(async (resolve, reject) => {
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!reason) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'reason')));
            if(!authorID) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'authorID')));

            if(!this._checkPermissions(['BAN_MEMBERS'], member.guild)) return reject(new ModeratorError(ModeratorErrors.MissingPermissions));

            const guild = this.client.guilds.cache.get(member.guild.id);
            const memberRolePosition = member.roles.highest.position;
            const clientRolePosition = guild.members.cache.get(this.client.user.id).roles.highest.position;

            if(memberRolePosition > clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

            guild.members.cache.get(member.id).ban({ reason: reason, days: 7 });

            this.emit('ban', { userID: member.id, guildID: guild.id, reason: reason, authorID: authorID });
            return resolve({ status: true, data: { userID: member.id, guildID: guild.id, reason: reason, authorID: authorID } });
        })
    }

    /**
     * Method for adding warns to user
     * @param {GuildMember} member Discord GuildMember
     * @param {Channel} channel Discord Channel
     * @param {string} reason Warn Reason
     * @param {string} authorID Warn Author ID
     * @param {string} muteRoleID Mute Role ID
     * @returns {Promise<{ status: boolean, data: Warn }>} Warn Object
    */
    addWarn(member, channel, reason, authorID, muteRoleID) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.warnSystem) return reject(new ModeratorError(ModeratorErrors.warnSystemDisabled));

            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!channel) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'channel')));
            if(!reason) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'reason')));
            if(!authorID) return reject(new ModeratorError(ModeratorError.parameterNotFound.replace('{parameter}', 'authorID')));
            if(!muteRoleID) return reject(new ModeratorError(ModeratorError.parameterNotFound.replace('{parameter}', 'muteRoleID')));

            const warnsData = base.fetch(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

            Warn.guildID = member.guild.id;
            Warn.userID = member.id;
            Warn.channelID = channel.id;
            Warn.nowTime = new Date().getTime();
            Warn.warnReason = reason;
            Warn.warnBy = authorID;

            if(!warnsData || warnsData == null) {
                Warn.warnNumber = 1;

                base.set(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`, [Warn]);

                this.emit('addWarn', Warn);
                return resolve({ status: true, data: Warn });
            }else{
                Warn.warnNumber = warnsData.length + 1;
                base.push(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`, Warn);

                this.emit('addWarn', Warn);
                resolve({ status: true, data: Warn });
                return this._punishUser(member, channel, Warn.warnNumber, muteRoleID, authorID);
            }
        })
    }

    /**
     * Method for getting user warnings
     * @param {GuildMember} member Discord GuildMember
     * @returns {Promise<{ status: boolean, warns: number, data: Array<Warn> }>} User Warns Object
    */
    getWarns(member) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.warnSystem) return reject(new ModeratorError(ModeratorErrors.warnSystemDisabled));

            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));

            const warnsData = base.fetch(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

            if(!warnsData || warnsData == null) {
                Warn.guildID = member.guild.id;
                Warn.userID = member.id;
                Warn.channelID = null,
                Warn.nowTime = null,
                Warn.warnNumber = null,
                Warn.warnReason = null,
                Warn.warnBy = null

                return resolve({ status: true, warns: 0, data: [Warn] });
            }else{
                var warns = [];

                for(let i = 0; i < warnsData.length; i++) {
                    await warns.push({
                        guildID: warnsData[i].guildID,
                        userID: warnsData[i].userID,
                        channelID: warnsData[i].channelID,
                        nowTime: warnsData[i].nowTime,
                        warnNumber: warnsData[i].warnNumber,
                        warnReason: warnsData[i].warnReason,
                        warnBy: warnsData[i].warnBy
                    });
                }

                return resolve({ status: true, warns: warns.length, data: warns })
            }
        })
    }

    /**
     * Method for removing warnings from a user
     * @param {GuildMember} member Discord GuildMember
     * @returns {Promise<{ status: boolean, warns: number, data: Array<Warn> }>} User Warns Object
    */
    removeWarn(member) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.warnSystem) return reject(new ModeratorError(ModeratorErrors.warnSystemDisabled));

            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));

            const warnsData = base.fetch(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

            if(!warnsData || warnsData == null) return resolve({ status: false, warns: 0, data: [] });

            if(warnsData.length < 2) {
                base.delete(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

                this.emit('removeWarn', { warns: 0, data: [] });
                return resolve({ status: true, warns: 0, data: [] });
            }else{
                const newWarns = warnsData.filter(data => data.warnNumber != warnsData.length);
                base.set(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`, newWarns);

                this.emit('removeWarn', { warns: newWarns.length, data: newWarns });
                return resolve({ status: true, warns: newWarns.length, data: newWarns });
            }
        })
    }

    /**
     * Method for issuing a mute to a user
     * @param {GuildMember} member Discord GuildMember
     * @param {Channel} channel Discord Channel
     * @param {string} muteRoleID Mute Role ID
     * @param {string} muteReason Mute reason
     * @returns {Promise<{ status: boolean, data: Mute }>} Object
    */
    mute(member, channel, muteRoleID, muteReason) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.muteSystem) return reject(new ModeratorError(ModeratorErrors.muteSystemDisabled));

            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!channel) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'channel')));
            if(!muteRoleID) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'muteRoleID')));
            if(!muteReason) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'muteReason')));

            if(!this._checkPermissions(['MANAGE_ROLES'], member.guild)) return reject(new ModeratorError(ModeratorErrors.MissingPermissions));

            Mute.guildID = member.guild.id;
            Mute.userID = member.id;
            Mute.channelID = channel.id;
            Mute.muteRoleID = muteRoleID;
            Mute.muteTime = null;
            Mute.nowTime = new Date().getTime();
            Mute.muteReason = muteReason;

            const mutesData = base.fetch(this.options.muteConfig.tableName);
            const muteRolePosition = member.guild.roles.cache.get(muteRoleID).position;
            const clientRolePosition = member.guild.members.cache.get(this.client.user.id).roles.highest.position;

            if(muteRolePosition > clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

            if(!mutesData || mutesData == null) {
                try {
                    await member.roles.add(muteRoleID);

                    await base.set(this.options.muteConfig.tableName, [Mute]);

                    this.emit('addMute', Mute);
                    return resolve({ status: true, data: Mute });
                }catch(error){
                    return reject(error);
                }
            }else{
                const searchMute = mutesData.find(data => data.userID === member.id);
                if(searchMute) return reject(new ModeratorError(ModeratorErrors.mute.userAlreadyMuted.replace('{ID}', member.id)));

                try {
                    await member.roles.add(muteRoleID);

                    await base.push(this.options.muteConfig.tableName, Mute);

                    this.emit('addMute', Mute);
                    return resolve({ status: true, data: Mute });
                }catch(error){
                    return reject(error);
                }
            }
        })
    }

    /**
     * Method for issuing a tempmute to a user
     * @param {GuildMember} member Discord GuildMember
     * @param {Channel} channel Discord Channel
     * @param {string} muteRoleID Mute Role ID
     * @param {string} muteTime Mute Time
     * @param {string} muteReason Mute Reason
     * @returns {Promise<{ status: boolean, data: Mute }>} Object
    */
    tempmute(member, channel, muteRoleID, muteTime, muteReason) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.muteSystem) return reject(new ModeratorError(ModeratorErrors.muteSystemDisabled));

            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));
            if(!channel) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'channel')));
            if(!muteRoleID) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'muteRoleID')));
            if(!muteTime) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'muteTime')));
            if(!muteReason) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'muteReason')));

            if(!ms(muteTime)) return reject(new ModeratorError(ModeratorErrors.tempmute.invalidValue));

            if(!this._checkPermissions(['MANAGE_ROLES'], member.guild)) return reject(new ModeratorError(ModeratorErrors.MissingPermissions));

            Mute.guildID = member.guild.id;
            Mute.userID = member.id;
            Mute.channelID = channel.id;
            Mute.muteRoleID = muteRoleID;
            Mute.muteTime = ms(muteTime);
            Mute.nowTime = new Date().getTime();
            Mute.muteReason = muteReason;

            const mutesData = base.fetch(this.options.muteConfig.tableName);
            const muteRolePosition = member.guild.roles.cache.get(muteRoleID).position;
            const clientRolePosition = member.guild.members.cache.get(this.client.user.id).roles.highest.position;

            if(muteRolePosition > clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

            if(!mutesData || mutesData == null) {
                try {
                    await member.roles.add(muteRoleID);

                    await base.set(this.options.muteConfig.tableName, [Mute]);

                    this.emit('addMute', Mute);
                    return resolve({ status: true, data: Mute });
                }catch(error){
                    return reject(error);
                }
            }else{
                const searchMute = mutesData.find(data => data.userID === member.id);
                if(searchMute) return reject(new ModeratorError(ModeratorErrors.mute.userAlreadyMuted.replace('{ID}', member.id)));

                try {
                    await member.roles.add(muteRoleID);

                    await base.push(this.options.muteConfig.tableName, Mute);

                    this.emit('addMute', Mute);
                    return resolve({ status: true, data: Mute });
                }catch(error){
                    return reject(error);
                }
            }
        })
    }

    /**
     * Method for removing the mute to the user
     * @param {GuildMember} member Discord GuildMember
     * @returns {Promise<{ status: boolean }>} Unmute Status
    */
    unmute(member) {
        return new Promise(async (resolve, reject) => {
            if(!this.options.muteSystem) return reject(new ModeratorError(ModeratorErrors.muteSystemDisabled));

            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));

            if(!this._checkPermissions(['MANAGE_ROLES'], member.guild)) return reject(new ModeratorError(ModeratorErrors.MissingPermissions));

            const mutesData = base.fetch(this.options.muteConfig.tableName);

            if(!mutesData || mutesData == null) return reject(new ModeratorError(ModeratorErrors.cleanBase.replace('{parameter}', 'Mutes')));

            const searchMute = mutesData.find(data => data.userID === member.id);
            if(!searchMute) return reject(new ModeratorError(ModeratorErrors.unmute.userAlreadyUnMuted.replace('{ID}', member.id)));

            try {
                const muteRolePosition = member.guild.roles.cache.get(searchMute.muteRoleID).position;
                const clientRolePosition = member.guild.members.cache.get(this.client.user.id).roles.highest.position;

                if(muteRolePosition > clientRolePosition) return reject(new ModeratorError(ModeratorErrors.MissingAccess));

                await member.roles.remove(searchMute.muteRoleID).catch(error => { return reject(error) });

                const newBase = mutesData.filter(data => data.userID != member.id);
                await base.set(this.options.muteConfig.tableName, newBase);

                this.emit('removeMute', { userID: member.id, guildID: member.guild.id })
                return resolve({ status: true });
            }catch(error){
                return reject(error);
            }
        })
    }

    /**
     * Method for removing all mutes from the database
     * @returns {boolean} Clearing Status
    */
    clearMutes() {
        if(!this.options.muteSystem) return new ModeratorError(ModeratorErrors.muteSystemDisabled);

        const mutesData = base.fetch(this.options.muteConfig.tableName);
        if(!mutesData || mutesData == null) return false;

        base.delete(this.options.muteConfig.tableName);

        return true;
    }

    /**
     * Method for removing all warns from the database
     * @returns {boolean} Clearing Status
    */
    clearWarns() {
        if(!this.options.warnSystem) return new ModeratorError(ModeratorErrors.warnSystemDisabled);

        const warnsData = base.fetch(this.options.warnConfig.tableName);
        if(!warnsData || warnsData == null) return false;

        base.delete(this.options.warnConfig.tableName);

        return true;
    }

    /**
     * Method for initialization module
     * @returns {void} Returns Moderator Status
     * @private 
    */
    _init() {
        this.ready = true;
        this.version = require('../package.json').version;
        this.author = require('../package.json').author;
    }

    /**
     * Method for checking permissions on the server
     * @param {Array<>} permissionsArray Permissions Array
     * @param {Guild} guild Discord Guild
     * @returns {Boolean} Boolean
     * @private
    */
    _checkPermissions(permissionsArray, guild) {
        const user = guild.members.cache.get(this.client.user.id);
        return user.roles.highest.permissions.has(permissionsArray);
    }

    /**
     * Method for check Moderator Options
     * @returns {ModeratorError} Moderator Error
     * @private
    */
    _checkConstructorOptions() {
        if(typeof this.options.muteSystem != 'boolean') {
            console.log(new ModeratorError(ModeratorErrors.constructorOptions.invalidOptionType.replace('{option}', 'muteSystem').replace('{type}', 'boolean')));
            process.exit();
        }

        if(typeof this.options.warnSystem != 'boolean') {
            console.log(new ModeratorError(ModeratorErrors.constructorOptions.invalidOptionType.replace('{option}', 'warnSystem').replace('{type}', 'boolean')));
            process.exit();
        }

        if(!this.options.muteConfig.tableName) {
            console.log(new ModeratorError(ModeratorErrors.constructorOptions.optionNotFound.replace('{option}', 'muteConfig.tableName')))
            process.exit();
        }

        if(typeof this.options.muteConfig.tableName != 'string') {
            console.log(new ModeratorError(ModeratorErrors.constructorOptions.invalidOptionType.replace('{option}', 'muteConfig.tableName').replace('{type}', 'string')))
            process.exit();
        }

        if(!this.options.muteConfig.checkCountdown) {
            console.log(new ModeratorError(ModeratorErrors.constructorOptions.optionNotFound.replace('{option}', 'muteConfig.checkCdountdown')))
            process.exit();
        }

        if(typeof this.options.muteConfig.checkCountdown != 'number') {
            console.log(new ModeratorError(ModeratorErrors.constructorOptions.invalidOptionType.replace('{option}', 'muteConfig.checkCountdown').replace('{type}', 'number')))
            process.exit();
        }

        if(!this.options.warnConfig.tableName) {
            console.log(new ModeratorError(ModeratorErrors.constructorOptions.optionNotFound.replace('{option}', 'warnconfig.tableName')))
            process.exit();
        }

        if(typeof this.options.warnConfig.tableName != 'string') {
            console.log(new ModeratorError(ModeratorErrors.constructorOptions.invalidOptionType.replace('{option}', 'warnConfig.tableName').replace('{type}', 'string')))
            process.exit();
        }

        if(!this.options.warnConfig.maxWarns) {
            console.log(new ModeratorError(ModeratorErrors.constructorOptions.optionNotFound.replace('{option}', 'warnconfig.maxWarns')))
            process.exit();
        }

        if(typeof this.options.warnConfig.maxWarns != 'number') {
            console.log(new ModeratorError(ModeratorErrors.constructorOptions.invalidOptionType.replace('{option}', 'warnConfig.maxWarns').replace('{type}', 'number')))
            process.exit();
        }

        if(this.options.warnConfig.maxWarns < 3) {
            console.log(new ModeratorError(ModeratorErrors.constructorOptions.invalidValue.replace('{option}', 'warnConfig.maxWarns').replace('{value}', 3)))
            process.exit();
        }

        if(!this.options.warnConfig.muteTime) {
            console.log(new ModeratorError(ModeratorErrors.constructorOptions.optionNotFound.replace('{option}', 'warnconfig.muteTime')))
            process.exit();
        }

        if(typeof this.options.warnConfig.muteTime != 'string') {
            console.log(new ModeratorError(ModeratorErrors.constructorOptions.invalidOptionType.replace('{option}', 'warnConfig.muteTime').replace('{type}', 'string')))
            process.exit();
        }
    }

    /**
     * Method for checking all mutes
     * @private
    */
    _checkMutes() {
        if(!this.options.muteSystem) return;

        setInterval(async () => {
            const mutesData = base.fetch(this.options.muteConfig.tableName);

            if(!mutesData || mutesData == null) return;

            for(var i = 0; i < mutesData.length; i++) {
                const nowTime = new Date().getTime();
                const muteNowTime = mutesData[i].nowTime;
                const muteTime = mutesData[i].muteTime;

                if(muteTime === null) return;

                if(nowTime - muteNowTime > muteTime) {
                    const guild = this.client.guilds.cache.get(mutesData[i].guildID);
                    if(!guild) return;

                    const member = guild.members.cache.get(mutesData[i].userID);
                    if(!member) return;

                    if(!member.roles.cache.has(mutesData[i].muteRoleID)) {
                        const newBase = mutesData.filter(obj => obj.nowTime != muteNowTime);
                        base.set(this.options.muteConfig.tableName, newBase);

                        this.emit('muteEnded', mutesData[i]);
                    }else{
                        const muteRolePosition = member.guild.roles.cache.get(mutesData[i].muteRoleID).position;
                        const clientRolePosition = member.guild.members.cache.get(this.client.user.id).roles.highest.position;

                        if(muteRolePosition > clientRolePosition) return new ModeratorError(ModeratorErrors.MissingAccess);

                        await member.roles.remove(mutesData[i].muteRoleID);
                        
                        const newBase = mutesData.filter(obj => obj.nowTime != muteNowTime);
                        base.set(this.options.muteConfig.tableName, newBase);

                        this.emit('muteEnded', mutesData[i]);
                    }
                }
            }
        }, this.options.muteConfig.checkCountdown);
    }

    /**
     * Method for punishment users
     * @param {GuildMember} member Discord GuildMember
     * @param {Channel} channel Discord Channel
     * @param {тumber} warnsLength User Warns Count
     * @param {string} muteRoleID Mute Role ID
     * @param {string} authorID Author ID
     * @returns {Promise<{ status: boolean, data: { punishType: string, userID: string, reason: string } }>} Punish Object
     * @private
    */
    _punishUser(member, channel, warnsLength, muteRoleID, authorID) {
        return new Promise(async (resolve, reject) => {
            if(!member) return reject(new ModeratorError(ModeratorErrors.parameterNotFound.replace('{parameter}', 'member')));

            if(warnsLength < this.options.warnConfig.maxWarns) return;

            switch(this.options.warnConfig.punishment) {
                case 'tempmute': {
                    Mute.userID = member.id;
                    Mute.channelID = channel.id;
                    Mute.guildID = member.guild.id;
                    Mute.muteReason = 'Exceeded the maximum number of warnings';
                    Mute.muteRoleID = muteRoleID;
                    Mute.muteTime = this.options.warnConfig.muteTime;
                    Mute.nowTime = new Date().getTime();

                    await this.tempmute(member, channel, muteRoleID, this.options.warnConfig.muteTime, 'Exceeded the maximum number of warnings');
                    base.delete(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

                    return resolve({ status: true, data: { punishType: this.options.warnConfig.punishment, userID: member.id, reason: 'Exceeded the maximum number of warnings' } });
                }

                case 'mute': {
                    Mute.userID = member.id;
                    Mute.channelID = channel.id;
                    Mute.guildID = member.guild.id;
                    Mute.muteReason = 'Exceeded the maximum number of warnings';
                    Mute.muteRoleID = muteRoleID;
                    Mute.muteTime = null;
                    Mute.nowTime = new Date().getTime();

                    await this.mute(member, channel, muteRoleID, 'Exceeded the maximum number of warnings');
                    base.delete(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

                    return resolve({ status: true, data: { punishType: this.options.warnConfig.punishment, userID: member.id, reason: 'Exceeded the maximum number of warnings' } });
                }

                case 'kick': {
                    await this.kick(member, 'Exceeded the maximum number of warnings', authorID);
                    base.delete(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

                    return resolve({ status: true, data: { punishType: this.options.warnConfig.punishment, userID: member.id, reason: 'Exceeded the maximum number of warnings' }  });
                }

                case 'ban': {
                    await this.ban(member, 'Exceeded the maximum number of warnings', authorID);
                    base.delete(`${this.options.warnConfig.tableName}.${member.guild.id}.${member.id}`);

                    return resolve({ status: true, data: { punishType: this.options.warnConfig.punishment, userID: member.id, reason: 'Exceeded the maximum number of warnings' }  });
                }
            }
        })
    }
}
