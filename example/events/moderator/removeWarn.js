const ModeratorBot = require('../../classes/Client.js');

module.exports = {
    name: 'removeWarn',

    /**
     * @param {ModeratorBot} client Discord Client
     * @param {{ guildID: String, userID: String, warns: Number, data: Array<import('discord-moderator').WarnData> }} data Event Data
    */
    run: async(client, data) => {
        const guild = client.guilds.cache.get(data.guildID);
        const member = guild.members.cache.get(data.userID);

        return console.log(`User ${member.user.tag} unwarned on server ${guild.name}!`);
    }
}