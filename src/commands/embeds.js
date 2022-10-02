const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const Thread = require('../util/models/thread.js');
module.exports = {
    category: "Developer",
    data: new SlashCommandBuilder()
        .setName('embeds')
        .setDescription('Random embeds')
        .addStringOption(option => option
            .setName('option')
            .setDescription("Pick which option you a want to do")
            .setRequired(true)
            .addChoices(
                { name: "roles", value: "roles" },
                { name: "suggest", value: "suggest" },
            )
        ),

    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        if (!interaction.member.roles.cache.has(client.config.supportRole)) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You must be apart of the developer team to access this command!` })

        switch (interaction.options._hoistedOptions[0].value) {
            case "roles": {
                const embed = new EmbedBuilder()
                    .setTitle("Ping Roles")
                    .setDescription("Ping roles are a good way to keep up to date with the server and its services. Press any button you'd like to get mentioned on periodically. ")
                    .setColor("#FFBF40")

                const button = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('giveaway')
                            .setLabel("Giveaway Ping")
                            .setStyle('Primary'),
                        new ButtonBuilder()
                            .setCustomId('announcement')
                            .setLabel("Announcement Ping")
                            .setStyle('Primary'),
                        new ButtonBuilder()
                            .setCustomId('changelog')
                            .setLabel("Changelog Ping")
                            .setStyle('Primary'),
                    );

                const button2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('bump')
                            .setLabel("Bump Reminder")
                            .setStyle('Primary'),
                        new ButtonBuilder()
                            .setCustomId('status')
                            .setLabel("Status Update Ping")
                            .setStyle('Primary'),
                    );

                interaction.channel.send({
                    embeds: [embed],
                    components: [button, button2]
                });
                break;
            }

            case "suggest": {
                const embed = new EmbedBuilder()
                    .setTitle("Feature Requests")
                    .setColor("#FFBF40")
                    .setDescription(`To submit a **feature request**, head over to <#1009932626938826782> and use the </suggest:1> command which will bring up a modal for you to type your suggestion. Once you're done, press the **Submit** button and head back into <#1009932624728440842> to upvote your request!\n\nIf your suggest was accepted, the developers will either reply to your suggestion in this channel or it'll be displayed in the <#1009932614024568842>.`)
                    .setImage("https://cdn.discordapp.com/attachments/857797178596524045/1025889232209842268/DiscordCanary_ykBU9RAvMw_Video.gif")
                interaction.channel.send({ embeds: [embed] })
                break;
            }
        }

    },
};
