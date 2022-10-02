const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Thread = require('../util/models/thread.js');
module.exports = {
    category: "General",
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View all available commands that you have access to.'),

    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        if (!interaction.guild) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You have to be in a channel to use this command!` })

        if (interaction.member.roles.cache.has(client.config.developerRole)) {
            const embed = new EmbedBuilder()
                .setTitle("Help Menu")
                .addFields([{ name: "**General**", value: `\`\`\`fix\n${client.commands.filter(c => c.category === "General").map(c => c.data.name).join(", ")}\`\`\``, inline: false },
                { name: "**Modmail**", value: `\`\`\`fix\n${client.commands.filter(c => c.category === "Modmail").map(c => c.data.name).join(", ")}\`\`\``, inline: false },
                { name: "**Developer**", value: `\`\`\`fix\n${client.commands.filter(c => c.category === "Developer").map(c => c.data.name).join(", ")}\`\`\``, inline: false }])
                .setColor("#FFBF40")
            return interaction.reply({ embeds: [embed] });
        } else if (interaction.member.roles.cache.has(client.config.supportRole)) {
            const embed = new EmbedBuilder()
                .setTitle("Help Menu")
                .addFields([{ name: "**General**", value: `\`\`\`fix\n${client.commands.filter(c => c.category === "General").map(c => c.data.name).join(", ")}\`\`\``, inline: false },
                { name: "**Modmail**", value: `\`\`\`fix\n${client.commands.filter(c => c.category === "Modmail").map(c => c.data.name).join(", ")}\`\`\``, inline: false }])
                .setColor("#FFBF40")
            return interaction.reply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setTitle("Help Menu")
                .addFields([{ name: "**General**", value: `\`\`\`fix\n${client.commands.filter(c => c.category === "General").map(c => c.data.name).join(", ")}\`\`\``, inline: false }])
                .setColor("#FFBF40")
            interaction.reply({ embeds: [embed] });
        }
    },
};
