const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Thread = require('../util/models/thread.js');
module.exports = {
    category: "Developer",
    data: new SlashCommandBuilder()
        .setName('admins')
        .setDescription('Only allows admins to view the current ticket.'),

    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        if (!interaction.guild) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You have to be in a recipient's channel to run this command!` })
        if (!interaction.member.roles.cache.has(client.config.developerRole)) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You must be apart of our support team to access this command!` })

        const recipientThread = await Thread.findOne({
            channel: interaction.channel.id,
            closed: false
        });
        if (!recipientThread) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} There's no concurring thread in this channel!` })

        if (!recipientThread.admin) {
            const channel = interaction.channel;
            const ML = interaction.guild.roles.cache.get(client.config.supportRole);
            await channel.permissionOverwrites.edit(ML, {
                ViewChannel: false
            }).catch(e => {
                console.log(e)
            });
            interaction.reply({ ephemeral: true, content: `${client.config.emojis.greenTick} Successfully transferred to only administration view.` })
            await recipientThread.updateOne({
                admin: true
            });
            recipientThread.save();
        } else {
            const channel = interaction.channel;
            const ML = interaction.guild.roles.cache.get(client.config.supportRole);
            await channel.permissionOverwrites.edit(ML, {
                ViewChannel: true
            }).catch(e => {
                console.log(e)
            });
            interaction.reply({ ephemeral: true, content: `${client.config.emojis.greenTick} Successfully disabled administrative view.` })
            await recipientThread.updateOne({
                admin: false
            });
            recipientThread.save();
        }
    },
};
