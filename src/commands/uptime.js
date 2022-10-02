const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Thread = require('../util/models/thread.js');
module.exports = {
    category: "General",
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription("Show's the bot's current uptime."),

    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        const unixstamp = Math.floor((Date.now() / 1000) | 0) - Math.floor(client.uptime / 1000);

        let beforeCall = Date.now();
        await Thread.findOne();
        let dbPing = Date.now() - beforeCall;

        interaction.reply(`${client.config.emojis.greenTick} <t:${unixstamp}:R>`)
    },
};
