const ModeratorBot = require('../../classes/Client.js');

module.exports = {
    name: 'kick',

    /**
     * @param {ModeratorBot} client Discord Client
     * @param {{ userID: String, guildID: String, reason: String, authorID: String }} data Event Data
    */
    run: async(client, data) => {
        const guild = client.guilds.cache.get(data.guildID);
        const member = guild.members.cache.get(data.userID);

        return console.log(`User ${member.user.tag} kicked on server ${guild.name} for ${data.reason}!`);
    }
}