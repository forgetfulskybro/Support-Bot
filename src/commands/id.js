const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Thread = require('../util/models/thread.js');
module.exports = {
    category: "Modmail",
    data: new SlashCommandBuilder()
        .setName('id')
        .setDescription('Get ID of the thread user.'),

    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        if (!interaction.guild) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You have to be in a recipient's channel to run this command!` })
        if (!interaction.member.roles.cache.has(client.config.supportRole)) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You must be apart of our support team to access this command!` })

        const recipientThread = await Thread.findOne({
            channel: interaction.channel.id,
            closed: false
        });
        if (!recipientThread) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} There's no concurring thread in this channel!` })

        interaction.reply(`${client.config.emojis.greenTick} **ID**: ${recipientThread.recipient}`)
    },
};
