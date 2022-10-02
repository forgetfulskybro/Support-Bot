const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Thread = require('../util/models/thread.js');
const Blocks = require("../util/models/blocked.js");

module.exports = {
    category: "Modmail",
    data: new SlashCommandBuilder()
        .setName('block')
        .setDescription('Blocks users from using tickets.'),

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

        const block = await Blocks.findOne({
            block: recipientThread.recipient
        });

        if (block) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} This user is already blocked on from using tickets!` })

        const blocking = new Blocks({
            block: recipientThread.recipient,
        });
        blocking.save()

        const blocked = new EmbedBuilder()
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.avatarURL()
            })
            .setDescription(`**Thread user blocked** \n\n **Thread User**: <@${recipientThread.recipient}> (${recipientThread.recipient}) \n **Thread Operator**: ${interaction.user} (${interaction.user.id}) \n **Thread Case**: ${recipientThread.id} \n **Thread User's Issue**: ${recipientThread.issue}`)
            .setColor("#FFBF40")

        client.channels.cache.get(client.config.blocks).send({
            embeds: [blocked]
        })
        interaction.reply(`${client.config.emojis.greenTick} Successfully blocked the user of this thread from using the ticket system!`);
    },
};
