const { EmbedBuilder } = require('discord.js');
const Threading = require("../util/modules/threading.js");
module.exports = async (client, message) => {
    Threading.message(client, message);
};
