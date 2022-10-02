const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Thread = require('../util/models/thread.js');
const moment = require("moment");
module.exports = {
    category: "Modmail",
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Closes a ticket from further use.'),

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

        let type;
        if (interaction.member.roles.cache.has(client.config.developerRole)) {
            type = "Developer";
        } else if (interaction.member.roles.cache.has(client.config.supportRole)) {
            type = "Support"
        }

        const embed = new EmbedBuilder()
            .setAuthor({
                name: "Ticket Closed: " + interaction.user.tag, iconURL: interaction.user.avatarURL({
                    dynamic: true,
                    format: 'png'
                })
            })
            .addFields([{ name: "Recipient:", value: `<@${recipientThread.recipient}> (${recipientThread.recipient})`, inline: false },
            { name: "Channel ID:", value: `${recipientThread.channel}`, inline: false },
            { name: "Issue:", value: `"${recipientThread.issue}"`, inline: false },
            { name: "Time Lasted:", value: `${moment(recipientThread.timestamp).from(Date.now()).replace("ago", "")}`, inline: false },
            { name: "Thread ID:", value: `#${recipientThread.id}`, inline: false }])

        const closed = new EmbedBuilder()
            .setAuthor({
                name: type, iconURL: client.user.avatarURL({
                    format: 'png'
                })
            })
            .setDescription("**Ticket Closed!** \n\nYour ticket has been closed from further use, if you got any other issues don't be afraid to DM us again!\n\nCheers!\n**Would You Support**")
            .setColor("#FFBF40")

        client.users.cache.get(recipientThread.recipient).send({ embeds: [closed] }).catch(() => { })
        client.channels.cache.get(client.config.log).send({ embeds: [embed] }).catch(() => { });
        recipientThread.closed = true;
        await recipientThread.save()

        await interaction.channel.delete({
            reason: `${interaction.user.tag}: Deleting ticket chnanel.`
        });
    },
};
