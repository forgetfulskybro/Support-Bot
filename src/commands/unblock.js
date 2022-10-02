const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Blocks = require("../util/models/blocked.js");

module.exports = {
    category: "Modmail",
    data: new SlashCommandBuilder()
        .setName('unblock')
        .setDescription('Unblocks users from the ticket system.')
        .addStringOption((option) => option
            .setName('user')
            .setRequired(true)
            .setDescription('Provide a user\'s ID to unblock them from the ticket system.')),

    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        if (!interaction.guild) return interaction.reply({ ephemeral: true, content: "You have to be in a channel to run this command!" })
        if (!interaction.member.roles.cache.has(client.config.supportRole)) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You must be apart of our support team to access this command!` })

        const block = await Blocks.findOne({
            block: interaction.options.getString("user")
        });

        if (!block) return interaction.reply({ ephemeral: true, content: "This user is either already unblocked or doesn't exist!" })

        block.delete()
        const blocked = new EmbedBuilder()
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.avatarURL()
            })
            .setDescription(`**User Unblocked** \n\n **User**: <@${interaction.options.getString("user")}> (${interaction.options.getString("user")}) \n **Support**: ${interaction.user} (${interaction.user.id})`)
            .setColor("#FFBF40")

        client.channels.cache.get(client.config.blocks).send({
            embeds: [blocked]
        })
        interaction.reply(`${client.config.emojis.greenTick} Successfully unblocked this user from the ticket system!`);
    },
};
