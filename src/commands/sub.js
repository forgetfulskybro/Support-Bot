const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Thread = require('../util/models/thread.js');
module.exports = {
    category: "Modmail",
    data: new SlashCommandBuilder()
        .setName('sub')
        .setDescription('Subscribe to a thread to be mentioned on every message.')
        .addStringOption(option => option
            .setName('option')
            .setDescription("Pick which option you a want to do")
            .setRequired(true)
            .addChoices(
                { name: 'sub', value: 'sub' },
                { name: "unsub", value: "unsub" },
            )
        )
        .addStringOption(option => option
            .setName('override')
            .setDescription("Let's administrators override a subscribed thread.")
            .addChoices(
                { name: 'true', value: 'true' },
            )
        ),

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

        if (interaction.options._hoistedOptions[0].value === "sub") {
            if (interaction.options._hoistedOptions[1] && interaction.options._hoistedOptions[1].value === "true") {
                if (!interaction.member.roles.cache.has(client.config.developerRole)) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You must be a developer to access this sub-command!` })
                if (recipientThread.sub === interaction.user.id) {
                    return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You are already subscribed to this thread!` })
                }

                if (recipientThread.sub === "none") {
                    return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} No one is currently subscribed to this thread!` })
                }

                await recipientThread.updateOne({
                    sub: interaction.user.id
                });
                recipientThread.save();

                return interaction.reply({ ephemeral: true, content: `${client.config.emojis.greenTick} You've successfully overrided this thread's subscription!` })
            }

            if (!recipientThread.sub === "none") {
                return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} Someone else is already subscribed to this thread!` })
            }

            await recipientThread.updateOne({
                sub: interaction.user.id
            });
            recipientThread.save();

            return interaction.reply({ ephemeral: true, content: `${client.config.emojis.greenTick} You've successfully subscribed to this thread!` })
        } else if (interaction.options._hoistedOptions[0].value === "unsub") {
            if (interaction.options._hoistedOptions[1] && interaction.options._hoistedOptions[1].value === "true") {
                if (!interaction.member.roles.cache.has(client.config.developerRole)) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You must be a developer to access this sub-command!` })
                if (recipientThread.sub === "none") {
                    return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} No one is currently subscribed to this thread!` })
                }

                await recipientThread.updateOne({
                    sub: "none"
                });
                recipientThread.save();

                return interaction.reply({ ephemeral: true, content: `${client.config.emojis.greenTick} You've successfully overrided this subscription and removed it!` })
            }

            if (!recipientThread.sub === interaction.user.id) {
                return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You aren't subscribed to this thread!` })
            }

            if (recipientThread.sub === "none") {
                return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You aren't subscribed to this thread!` })
            }

            await recipientThread.updateOne({
                sub: "none"
            });
            recipientThread.save();

            return interaction.reply({ ephemeral: true, content: `${client.config.emojis.greenTick} You've successfully unsubscribed to this thread!` })
        }
    },
};
