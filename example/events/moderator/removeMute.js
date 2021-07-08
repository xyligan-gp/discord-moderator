const ModeratorBot = require('../../classes/Client.js');

module.exports = {
    name: 'removeMute',

    /**
     * @param {ModeratorBot} client Discord Client
     * @param {{ userID: String, guildID: String }} data Event Data
    */
    run: async(client, data) => {
        const guild = client.guilds.cache.get(data.guildID);
        const member = guild.members.cache.get(data.userID);

        return console.log(`User ${member.user.tag} unmuted on server ${guild.name}!`);
    }
}