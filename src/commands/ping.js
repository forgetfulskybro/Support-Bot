const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Thread = require('../util/models/thread.js');
module.exports = {
    category: "General",
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('See how fast/slow the bot is currently.'),

    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        let beforeCall = Date.now();
        await Thread.findOne();
        let dbPing = Date.now() - beforeCall;

        interaction.reply(`${client.ws.ping > 200 ? client.config.emojis.redTick : client.config.emojis.greenTick} **Latency**: ${client.ws.ping}ms\n${dbPing > 30 ? client.config.emojis.redTick : client.config.emojis.greenTick} **Database**: ${dbPing}ms`)
    },
};
